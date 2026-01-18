import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;

  // Safety check: If variables are missing, don't crash, just tell us.
  if (!url || !key) {
    return res.status(200).json({ 
      success: false, 
      error: "Missing Environment Variables in Vercel Dashboard." 
    });
  }

  const supabase = createClient(url, key);

  try {
    // Try to get data from 'whitelist' (the table found in loadmenu.lua)
    const { data, error } = await supabase.from('whitelist').select('*').limit(5);

    if (error) {
      return res.status(200).json({ success: false, error: error.message });
    }

    return res.status(200).json({ success: true, data: data });
  } catch (err) {
    return res.status(200).json({ success: false, error: "Internal Server Error" });
  }
}
