document.addEventListener('DOMContentLoaded', async function () {
    const campaignSelect = document.getElementById('campaignSelect');
    const resultsChartCtx = document.getElementById('resultsChart').getContext('2d');
    let resultsChart;

    try {
        const campaignsResponse = await fetch('/campaigns');
        if (campaignsResponse.ok) {
            const campaigns = await campaignsResponse.json();
            campaigns.reverse().forEach(campaign => {
                const option = document.createElement('option');
                option.value = campaign.id;
                option.textContent = campaign.title;
                campaignSelect.appendChild(option);
            });

            // Selecionar a última campanha por padrão
            if (campaigns.length > 0) {
                campaignSelect.value = campaigns[0].id;
                await loadCampaignResults(campaigns[0].id);
            }
        } else {
            alert('Failed to load campaigns');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load campaigns');
    }

    campaignSelect.addEventListener('change', function () {
        const campaignId = this.value;
        if (campaignId) {
            loadCampaignResults(campaignId);
        }
    });

    async function loadCampaignResults(campaignId) {
        try {
            const campaignDetailsResponse = await fetch(`/campaigns/${campaignId}`);
            const campaignDetails = await campaignDetailsResponse.json();

            const responsesResponse = await fetch(`/campaigns/${campaignId}/responses`);
            if (responsesResponse.ok) {
                const responses = await responsesResponse.json();

                const optionTextMap = {
                    option1: campaignDetails.option1,
                    option2: campaignDetails.option2,
                    option3: campaignDetails.option3,
                    option4: campaignDetails.option4
                };

                const labels = responses.map(response => optionTextMap[response.selected_option]);
                const data = responses.map(response => response.count);
                const totalVotes = data.reduce((acc, curr) => acc + curr, 0);
                const percentages = data.map(count => ((count / totalVotes) * 100).toFixed(2));

                // Atualizar tabela de resultados
                const resultsTableBody = document.getElementById('resultsTableBody');
                resultsTableBody.innerHTML = '';
                responses.forEach((response, index) => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${labels[index]}</td>
                        <td>${data[index]}</td>
                        <td>${percentages[index]}</td>
                    `;
                    resultsTableBody.appendChild(row);
                });

                // Atualizar gráfico de resultados
                if (resultsChart) {
                    resultsChart.destroy();
                }

                resultsChart = new Chart(resultsChartCtx, {
                    type: 'doughnut',
                    data: {
                        labels: labels,
                        datasets: [{
                            data: data,
                            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                    }
                });
            } else {
                alert('Failed to load responses');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to load responses');
        }
    }
});
