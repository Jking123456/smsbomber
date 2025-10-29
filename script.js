const form = document.getElementById("otpForm");
const phoneNumberInput = document.getElementById("phoneNumber");
const amountInput = document.getElementById("amount");
const messageArea = document.getElementById("messageArea");
const sendButton = document.getElementById("sendButton");
const statsContent = document.getElementById("statsContent");

// Show messages
function showMessage(type, text) {
  messageArea.style.color =
    type === "error" ? "#e11d48" : type === "success" ? "#16a34a" : "#4f46e5";
  messageArea.textContent = text;
}

// Send SMS
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const phoneNumber = phoneNumberInput.value.trim();
  const amount = parseInt(amountInput.value.trim(), 10);

  if (!phoneNumber || phoneNumber.length < 10) {
    showMessage("error", "Enter a valid phone number.");
    return;
  }
  if (isNaN(amount) || amount <= 0) {
    showMessage("error", "Enter a valid amount greater than 0.");
    return;
  }

  sendButton.disabled = true;
  sendButton.textContent = "Sending...";
  showMessage("info", "Sending SMS...");

  try {
    const res = await fetch("/api/send-sms", {
      method: "POST",
      headers: { "Content-Type": "application/json"
                 "X-API-Key": "0cb4423ed3ee1551036aa1b8a0dc8235236652bdde425707bbc6e98e4e9c5c4e"},
      body: JSON.stringify({ phoneNumber, amount }),
    });

    const data = await res.json();
    if (res.ok) {
      showMessage("success", "✅ SMS sent successfully!");
      loadStats();  // Refresh stats here!
    } else {
      showMessage("error", data.message || "Failed to send SMS.");
    }
  } catch {
    showMessage("error", "Network error. Try again later.");
  } finally {
    sendButton.disabled = false;
    sendButton.textContent = "✈️ Send SMS";
  }
});

// Load API stats
async function loadStats() {
  statsContent.textContent = "Loading...";
  try {
    const res = await fetch("/api/stats");
    const data = await res.json();

    if (data.success && data.data) {
      const { totalRequests, endpoints } = data.data;
      let html = `<p><strong>Total Requests:</strong> ${totalRequests}</p><ul>`;
      for (const [name, count] of Object.entries(endpoints)) {
        html += `<li>${name}: <strong>${count}</strong></li>`;
      }
      html += "</ul>";
      statsContent.innerHTML = html;
    } else {
      statsContent.textContent = "Failed to load stats.";
    }
  } catch {
    statsContent.textContent = "Error loading stats.";
  }
}

window.addEventListener("load", loadStats);
