document.addEventListener('DOMContentLoaded', async function () {
    const uniqueLink = window.location.pathname.split('/').pop();

    try {
        const response = await fetch(`/api/campaign/${uniqueLink}`);
        if (response.ok) {
            const campaign = await response.json();
            document.getElementById('question').textContent = campaign.question;
            document.getElementById('option1').textContent = campaign.option1;
            document.getElementById('option2').textContent = campaign.option2;
            document.getElementById('option3').textContent = campaign.option3;
            document.getElementById('option4').textContent = campaign.option4;
        } else {
            alert('Failed to load campaign');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load campaign');
    }

    document.getElementById('surveyForm').addEventListener('submit', async function (event) {
        event.preventDefault();

        const selectedOption = document.querySelector('input[name="option"]:checked').value;

        try {
            const response = await fetch(`/campaigns/${uniqueLink}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ selectedOption })
            });

            if (response.ok) {
                alert('Survey submitted successfully!');
            } else {
                alert('Failed to submit survey');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to submit survey');
        }
    });
});
