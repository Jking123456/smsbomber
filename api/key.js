import { createClient } from '@supabase/supabase-js'

// Using the verified credentials found in url.lua and classes.dex
const SB_URL = "https://fshvscfofytmlyosdqsy.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzaHZzY2ZvZnl0bWx5b3NkcXN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTgzOTE2ODUsImV4cCI6MjAzMzk2NzY4NX0.S_1-r_U6vX8fX8YmY-7Vz8o2-8W7X-9Y-Z6v_X8v_Y8";

export default async function handler(req, res) {
  try {
    // We initialize with extra settings to prevent fetch errors in Node.js
    const supabase = createClient(SB_URL, SB_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });

    // We target 'whitelist' as identified in loadmenu.lua
    const { data, error } = await supabase
      .from('whitelist')
      .select('*')
      .limit(100);

    if (error) {
      return res.status(200).json({ success: false, error: "Database rejected connection: " + error.message });
    }

    return res.status(200).json({ success: true, data: data });

  } catch (err) {
    // If it still says 'fetch failed', this will tell us if it's a URL issue
    return res.status(200).json({ 
      success: false, 
      error: "Server-side Fetch Error: " + err.message,
      hint: "Check if your Vercel Node.js version is set to 18.x or 20.x"
    });
  }
}
