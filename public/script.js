const form = document.getElementById('otpForm');
const phoneNumberInput = document.getElementById('phoneNumber');
const amountInput = document.getElementById('amount');
const messageArea = document.getElementById('messageArea');
const sendButton = document.getElementById('sendButton');
const statsContent = document.getElementById('statsContent');

function displayMessage(type, message) {
  const colors = {
    success: 'bg-green-100 border-green-400 text-green-700',
    error: 'bg-red-100 border-red-400 text-red-700',
    info: 'bg-blue-100 border-blue-400 text-blue-700',
  };
  messageArea.innerHTML = `
    <div class="p-3 border rounded-lg text-sm ${colors[type]}">${message}</div>
  `;
}

async function sendOTP(event) {
  event.preventDefault();

  const phoneNumber = phoneNumberInput.value.trim();
  const amount = parseInt(amountInput.value.trim(), 10);

  if (!phoneNumber || phoneNumber.length < 10) {
    displayMessage('error', 'Please enter a valid phone number.');
    return;
  }

  if (isNaN(amount) || amount <= 0) {
    displayMessage('error', 'Please enter a valid amount.');
    return;
  }

  sendButton.disabled = true;
  sendButton.innerHTML = 'Sending...';
  displayMessage('info', 'Sending SMS...');

  try {
    const response = await fetch('/api/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, amount }),
    });

    const result = await response.json();

    if (response.ok) {
      displayMessage('success', `✅ SMS sent successfully! Message: ${result.message || 'Success'}`);
      fetchStats(); // Refresh stats after sending
    } else {
      displayMessage('error', result.message || 'Failed to send SMS.');
    }
  } catch (err) {
    console.error(err);
    displayMessage('error', 'Network error. Please try again.');
  } finally {
    sendButton.disabled = false;
    sendButton.innerHTML = 'Send SMS';
  }
}

async function fetchStats() {
  try {
    const response = await fetch('/api/stats');
    const data = await response.json();

    if (!response.ok || !data.success) {
      statsContent.innerHTML = `<p class="text-red-600">Failed to load stats.</p>`;
      return;
    }

    const { totalRequests, endpoints, lastUpdated } = data.data;

    const endpointsHtml = Object.entries(endpoints)
      .map(([name, count]) => `
        <div class="flex justify-between border-b py-1">
          <span>${name}</span>
          <span class="font-semibold">${count}</span>
        </div>
      `).join('');

    const updatedDate = new Date(lastUpdated).toLocaleString();

    statsContent.innerHTML = `
      <div class="space-y-3">
        <p><strong>Total Requests:</strong> ${totalRequests}</p>
        <div class="text-left">${endpointsHtml}</div>
        <p class="text-xs text-gray-400">Last Updated: ${updatedDate}</p>
      </div>
    `;
  } catch (error) {
    console.error('Error loading stats:', error);
    statsContent.innerHTML = `<p class="text-red-600">Error loading stats.</p>`;
  }
}

form.addEventListener('submit', sendOTP);
window.addEventListener('DOMContentLoaded', fetchStats);
