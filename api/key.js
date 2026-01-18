import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;

  // This check tells us if Vercel is actually reading your settings
  if (!url || !key) {
    return res.status(200).json({ 
      success: false, 
      error: `Missing Variables. URL found: ${!!url}, Key found: ${!!key}. Please Redeploy in Vercel.` 
    });
  }

  try {
    const supabase = createClient(url, key);
    
    // Test connection to the 'whitelist' table
    const { data, error } = await supabase.from('whitelist').select('*').limit(1);

    if (error) {
      return res.status(200).json({ success: false, error: "Database Error: " + error.message });
    }

    return res.status(200).json({ success: true, data: data });

  } catch (err) {
    return res.status(200).json({ success: false, error: "System Error: " + err.message });
  }
}
