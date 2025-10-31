export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { phoneNumber, amount } = req.body;

  if (!phoneNumber || !amount) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Step 1: Get a fresh API key
    const keyResponse = await fetch("https://sms-api-key.vercel.app/api/generate?count=1");
    const keyData = await keyResponse.json();
    const apiKey = keyData[0]; // API returns an array with one key

    if (!apiKey) {
      throw new Error("15 minutes Cooldown");
    }

    // Step 2: Send SMS using the fetched key
    const smsResponse = await fetch("https://toshismsbmbapi.up.railway.app/api/send-sms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey
      },
      body: JSON.stringify({ phoneNumber, amount })
    });

    const data = await smsResponse.json();
    return res.status(smsResponse.status).json(data);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
