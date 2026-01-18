import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  // Use these exact names from your Vercel Dashboard
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;

  // 1. Safety Check: If these are missing, the server will tell us why
  if (!url || !key) {
    return res.status(200).json({ 
      success: false, 
      error: "Variables Missing: Go to Vercel Settings and ensure SUPABASE_URL and SUPABASE_ANON_KEY are added, then Redeploy." 
    });
  }

  try {
    const supabase = createClient(url, key);

    // 2. Fetch from 'whitelist' (The table we found in loadmenu.lua)
    const { data, error } = await supabase
      .from('whitelist')
      .select('*')
      .limit(50);

    if (error) {
      return res.status(200).json({ success: false, error: error.message });
    }

    return res.status(200).json({ success: true, data: data });

  } catch (err) {
    return res.status(200).json({ 
      success: false, 
      error: "Connection Failed: " + err.message 
    });
  }
}
