const sendBtn = document.getElementById("sendBtn");
const loader = document.getElementById("loader");
const responseBox = document.getElementById("responseBox");

sendBtn.addEventListener("click", async () => {
  const phone = document.getElementById("phone").value.trim();
  const seconds = document.getElementById("seconds").value.trim();

  responseBox.style.display = "none";

  if (!phone || !seconds) {
    showResponse(false, "Please enter both fields.");
    return;
  }

  loader.style.display = "block";
  sendBtn.disabled = true;

  try {
    const res = await fetch("/api/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone_no: phone, seconds: parseInt(seconds) }),
    });

    const data = await res.json();
    if (data.success) {
      showResponse(true, data.message);
    } else {
      showResponse(false, data.error || "Failed to send OTP.");
    }
  } catch (err) {
    showResponse(false, "Backend error occurred.");
  } finally {
    loader.style.display = "none";
    sendBtn.disabled = false;
  }
});

function showResponse(success, message) {
  responseBox.style.display = "block";
  responseBox.className = `response-box ${success ? "response-success" : "response-error"}`;
  responseBox.textContent = message;
}
