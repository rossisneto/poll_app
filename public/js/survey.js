document.addEventListener('DOMContentLoaded', async function () {
    const uniqueLink = window.location.pathname.split('/').pop();
    

    try {
        
        const response = await fetch(`/api/campaign/${uniqueLink}`);
        if (response.ok) {
            const campaign = await response.json();
            document.getElementById('question').textContent = campaign.question;
            document.getElementById('option1Button').textContent = campaign.option1;
            document.getElementById('option2Button').textContent = campaign.option2;
            document.getElementById('option3Button').textContent = campaign.option3;
            document.getElementById('option4Button').textContent = campaign.option4;
        } else {
            alert('Failed to load campaign');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load campaign');
    }

    const optionButtons = document.querySelectorAll('.btn-option');
    optionButtons.forEach(button => {
        button.addEventListener('click', function() {
            optionButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            document.getElementById('selectedOption').value = this.id.replace('Button', '');
        });
    });

    document.getElementById('surveyForm').addEventListener('submit', async function (event) {
        event.preventDefault();

        const selectedOption = document.getElementById('selectedOption').value;
        alert(ip);
        if (!selectedOption) {
            alert('Please select an option.');
            return;
        }

        try {
            const response = await fetch(`/campaign/${uniqueLink}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ selectedOption })
            });

            if (response.ok) {
                // Registrar localização
                await fetch(`/campaign/${uniqueLink}/register-location`, {
                    method: 'POST'
                });

                window.location.href = '/html/thankyou.html';  // Redireciona para a página de agradecimento
            } else {
                const errorData = await response.json();
                console.error('Error response data:', errorData);
                alert('Failed to submit survey');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to submit survey');
        }
    });
});
