import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  // Directly using the values if process.env fails to read
  const url = process.env.SUPABASE_URL || "https://fshvscfofytmlyosdqsy.supabase.co";
  const key = process.env.SUPABASE_ANON_KEY;

  if (!key) {
    return res.status(200).json({ success: false, error: "Missing Anon Key in Vercel." });
  }

  try {
    // We add 'fetch' options to handle the Node.js environment better
    const supabase = createClient(url, key, {
      auth: { persistSession: false }
    });

    // Try a simple table name 'whitelist'
    const { data, error } = await supabase.from('whitelist').select('*').limit(10);

    if (error) {
      return res.status(200).json({ success: false, error: error.message });
    }

    return res.status(200).json({ success: true, data: data });

  } catch (err) {
    return res.status(200).json({ success: false, error: "Network Failure: " + err.message });
  }
}
