import { createClient } from '@supabase/supabase-js'

const SB_URL = "https://fshvscfofytmlyosdqsy.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzaHZzY2ZvZnl0bWx5b3NkcXN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTgzOTE2ODUsImV4cCI6MjAzMzk2NzY4NX0.S_1-r_U6vX8fX8YmY-7Vz8o2-8W7X-9Y-Z6v_X8v_Y8";

export default async function handler(req, res) {
  try {
    // Explicitly disabling features that cause server-side fetch failures
    const supabase = createClient(SB_URL, SB_KEY, {
      auth: {
        persistSession: false,
      },
      global: {
        headers: { 'x-my-custom-header': 'my-app-name' },
      },
    });

    // Querying 'whitelist' found in loadmenu.lua
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
      error: "Connection Error: " + err.message 
    });
  }
}
