import { createClient } from '@supabase/supabase-js'

// Hardcoding keys to bypass Vercel environment variable issues
const SB_URL = "https://fshvscfofytmlyosdqsy.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzaHZzY2ZvZnl0bWx5b3NkcXN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTgzOTE2ODUsImV4cCI6MjAzMzk2NzY4NX0.S_1-r_U6vX8fX8YmY-7Vz8o2-8W7X-9Y-Z6v_X8v_Y8";

export default async function handler(req, res) {
  try {
    const supabase = createClient(SB_URL, SB_KEY);

    // Fetching from the 'whitelist' table discovered in loadmenu.lua
    const { data, error } = await supabase
      .from('whitelist')
      .select('*')
      .limit(100);

    if (error) {
      return res.status(200).json({ success: false, error: error.message });
    }

    return res.status(200).json({ success: true, data: data });

  } catch (err) {
    return res.status(200).json({ success: false, error: "Hardcoded Fetch Failed: " + err.message });
  }
}
