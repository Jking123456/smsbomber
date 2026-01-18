// api/key.js
export default function handler(req, res) {
  // We use process.env for security on Vercel
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

  if (req.method === 'GET') {
    res.status(200).json({
      url: SUPABASE_URL,
      anonKey: SUPABASE_ANON_KEY,
    });
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
