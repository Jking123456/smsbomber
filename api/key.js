import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  // Use these exact names from your Vercel Dashboard
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;

  // 1. Check if the keys actually exist in the environment
  if (!url || !key) {
    return res.status(200).json({ 
      success: false, 
      error: "Vercel Environment Variables are missing. Please add SUPABASE_URL and SUPABASE_ANON_KEY to your project settings." 
    });
  }

  try {
    const supabase = createClient(url, key);

    // 2. Try to fetch from the 'whitelist' table
    const { data, error } = await supabase
      .from('whitelist')
      .select('*')
      .limit(20);

    if (error) {
      return res.status(200).json({ success: false, error: error.message });
    }

    return res.status(200).json({ success: true, data: data });

  } catch (err) {
    // This catches the 'fetch failed' error and explains why
    return res.status(200).json({ 
      success: false, 
      error: "Connection Failed: " + err.message 
    });
  }
}
