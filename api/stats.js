// api/stats.js

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const response = await fetch('https://toshismsbmbapi.up.railway.app/api/stats');
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ message: 'Failed to fetch stats.' });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Stats API error:', error);
    return res.status(500).json({ message: 'Server error: Failed to fetch stats.' });
  }
}
