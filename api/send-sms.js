export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { phoneNumber, amount } = req.body;

  if (!phoneNumber || !amount) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    const response = await fetch(
      "https://toshismsbmbapi.up.railway.app/api/send-sms",
      {
        method: "POST",
        headers: { "Content-Type": "application/json"
                    'X-API-Key': '0cb4423ed3ee1551036aa1b8a0dc8235236652bdde425707bbc6e98e4e9c5c4e'},
        body: JSON.stringify({ phoneNumber, amount }),
      }
    );

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Backend error connecting to API", error: error.message });
  }
}
