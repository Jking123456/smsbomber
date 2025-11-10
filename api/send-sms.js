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
        "x-api-key": "toshi_5keziigugz9_mhrn03ld",
      },
      // ✅ Changed keys to match what the API likely expects
      body: JSON.stringify({
        phoneNumber: phoneNumber,
        totalRequests: amount,
      }),
    });

    let data;
    try {
      data = await response.json();
    } catch {
      const text = await response.text();
      return res.status(response.status).json({
        error: "Invalid JSON from external API",
        raw: text,
      });
    }

    return res.status(response.status).json(data);
  } catch (error) {
    console.error("API proxy error:", error);
    return res.status(500).json({ error: error.message });
  }
}
