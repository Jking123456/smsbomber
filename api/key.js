import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;

  // If this check triggers, it means you need to Redeploy in Vercel
  if (!url || !key) {
    return res.status(200).json({ 
      success: false, 
      error: "Vercel cannot see your Environment Variables. Go to Settings, add them, then REDEPLOY." 
    });
  }

  try {
    const supabase = createClient(url, key);
    
    // Attempt to fetch from 'whitelist' table
    const { data, error } = await supabase
      .from('whitelist')
      .select('*')
      .limit(50);

    if (error) {
      return res.status(200).json({ success: false, error: error.message });
    }

    return res.status(200).json({ success: true, data: data });

  } catch (err) {
    // This prevents the "fetch failed" crash from taking down the site
    return res.status(200).json({ success: false, error: "Network Error: " + err.message });
  }
}
