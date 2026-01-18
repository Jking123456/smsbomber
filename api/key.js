import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  // Pulling from Vercel Dashboard Environment Variables
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

  // 1. Check if variables are loaded
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return res.status(200).json({ 
      success: false, 
      error: "Environment Variables Missing in Vercel Dashboard." 
    });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // 2. Fetch data from the 'whitelist' table
    const { data, error } = await supabase
      .from('whitelist')
      .select('*')
      .order('created_at', { ascending: false }) // Show newest keys first
      .limit(100);

    if (error) {
        return res.status(200).json({ success: false, error: error.message });
    }

    return res.status(200).json({ success: true, data: data });

  } catch (err) {
    return res.status(200).json({ success: false, error: "Server Error: " + err.message });
  }
}
