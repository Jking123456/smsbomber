export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const response = await fetch("https://toshismsbombapi.up.railway.app/api/stats", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": "toshi_8qkczdpyos8_mi1hfcay"
      }
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
