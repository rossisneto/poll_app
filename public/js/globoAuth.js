document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('globoAuthForm').addEventListener('submit', async function (event) {
        event.preventDefault();

        if (!this.checkValidity()) {
            event.stopPropagation();
            this.classList.add('was-validated');
            return;
        }

        const formData = {
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        };

        try {
            const response = await fetch('/api/auth/globo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const result = await response.json();
                alert('Authenticated successfully! Globo ID: ' + result.glbId);
                window.location.href = '/html/success.html';
            } else {
                const errorData = await response.json();
                console.error('Error response data:', errorData);
                alert('Failed to authenticate');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to authenticate');
        }
    });
});
