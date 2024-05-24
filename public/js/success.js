document.addEventListener('DOMContentLoaded', function () {
    const params = new URLSearchParams(window.location.search);
    const qrCode = params.get('qr_code');
    const uniqueLink = params.get('unique_link');

    if (qrCode && uniqueLink) {
        document.getElementById('qrCode').src = qrCode;
        document.getElementById('campaignLink').href = "/campaign/" + uniqueLink;
    } else {
        document.getElementById('successMessage').innerHTML = '<p>Error: Missing campaign details.</p>';
    }
});
