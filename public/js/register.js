document.addEventListener('DOMContentLoaded', function () {
    const locationInput = document.getElementById('location');

    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            locationInput.value = `${latitude}, ${longitude}`;
        }, error => {
            console.error('Error getting location:', error);
        });
    } else {
        console.error('Geolocation is not available');
    }

    document.getElementById('registrationForm').addEventListener('submit', async function (event) {
        event.preventDefault();

        if (!this.checkValidity()) {
            event.stopPropagation();
            this.classList.add('was-validated');
            return;
        }

        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            location: document.getElementById('location').value,
        };

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('User registered successfully!');
                window.location.href = '/html/success.html';
            } else {
                const errorData = await response.json();
                console.error('Error response data:', errorData);
                alert('Failed to register user');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to register user');
        }
    });
});
