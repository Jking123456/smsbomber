document.addEventListener('DOMContentLoaded', () => {
    const bombForm = document.getElementById('bombForm');
    const phoneNumberInput = document.getElementById('phoneNumber');
    const totalRequestsInput = document.getElementById('totalRequests');
    const submitBtn = document.getElementById('submitBtn');
    const messageArea = document.getElementById('messageArea');

    // --- IMPORTANT SECURITY NOTE ---
    // This API key is exposed client-side for demonstration ONLY.
    // In a real application, NEVER do this. Use a backend server.
    const API_KEY = 'toshi_5keziigugz9_mhrn03ld';
    const API_URL = 'https://toshismsbombapi.up.railway.app/api/bomb/start';
    // --------------------------------

    bombForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission

        const phoneNumber = phoneNumberInput.value.trim();
        const totalRequests = parseInt(totalRequestsInput.value, 10);

        // Basic validation
        if (!phoneNumber || !totalRequests || isNaN(totalRequests) || totalRequests <= 0) {
            displayMessage('Please enter a valid phone number and a positive number of requests.', 'error');
            return;
        }

        // Disable the button and show a loading indicator
        submitBtn.disabled = true;
        submitBtn.innerHTML = ' Sending...';
        messageArea.innerHTML = ''; // Clear previous messages

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'x-api-key': API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    phoneNumber: phoneNumber,
                    totalRequests: totalRequests
                })
            });

            // Check if the request was successful (status code 2xx)
            if (!response.ok) {
                const errorData = await response.json(); // Try to get error details from API
                throw new Error(`
