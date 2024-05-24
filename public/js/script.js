document.getElementById('campaignForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const formData = {
        title: document.getElementById('title').value,
        question: document.getElementById('question').value,
        option1: document.getElementById('option1').value,
        option2: document.getElementById('option2').value,
        option3: document.getElementById('option3').value,
        option4: document.getElementById('option4').value
    };

    console.log("Form Data:", formData); // Adicione este log para verificar os dados enviados

    try {
        const response = await fetch('/campaigns', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const result = await response.json();
            const params = new URLSearchParams({
                qr_code: result.qr_code,
                unique_link: result.unique_link
            });
            window.location.href = `/html/success.html?${params.toString()}`;
        } else {
            const errorData = await response.json();
            console.error('Error response data:', errorData);
            alert('Failed to create campaign');
        }
    } catch (error) {
        console.error('Error:', error); // Adicione este log para verificar erros
        alert('Failed to create campaign');
    }
});
