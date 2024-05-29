document.addEventListener('DOMContentLoaded', async function () {
    const campaignSelect = document.getElementById('campaignSelect');
    const resultsChartCtx = document.getElementById('resultsChart').getContext('2d');
    let resultsChart;

    try {
        const campaignsResponse = await fetch('/campaigns');
        if (campaignsResponse.ok) {
            const campaigns = await campaignsResponse.json();
            campaigns.forEach(campaign => {
                const option = document.createElement('option');
                option.value = campaign.id;
                option.textContent = campaign.title;
                campaignSelect.appendChild(option);
            });
        } else {
            alert('Failed to load campaigns');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load campaigns');
    }

    campaignSelect.addEventListener('change', async function () {
        const campaignId = this.value;
        if (!campaignId) return;

        try {
            // Fetch the campaign details to get the options text
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
    });
});
