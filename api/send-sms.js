export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { phoneNumber, amount } = req.body;

  if (!phoneNumber || !amount) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const response = await fetch("https://toshismsbombapi.up.railway.app/api/bomb/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": "toshi_5keziigugz9_mhrn03ld",
      },
      body: JSON.stringify({ phoneNumber, totalRequests }),
    });

    let data;
    try {
      data = await response.json(); // try to parse JSON
    } catch {
      // fallback if response is not JSON
      const text = await response.text();
      return res.status(response.status).json({ error: "Invalid JSON from API", raw: text });
    }

    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
