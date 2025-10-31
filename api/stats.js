export default async function handler(req, res) {
  try {
    const response = await fetch("https://toshismsbmbapi.up.railway.app/api/stats", {
      headers: {
        "X-API-Key": "65b4edb0643bedb83606abf34c6c044bc825bcc2492960b4a16873586d5286aa"
      }
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
