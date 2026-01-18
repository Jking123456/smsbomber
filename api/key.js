import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  // Use the full credentials we extracted
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  try {
    // We try to fetch from 'whitelist' found in loadmenu.lua
    const { data, error } = await supabase
      .from('whitelist') 
      .select('*')
      .limit(10); // Limit to 10 rows to prevent timeouts

    if (error) {
      // If the table name is wrong, this sends the error instead of crashing
      return res.status(200).json({ 
        success: false, 
        error: error.message,
        hint: "Check if the table name 'whitelist' exists in the DB." 
      });
    }

    res.status(200).json({ success: true, data: data });

  } catch (err) {
    res.status(500).json({ success: false, error: "Server Timeout or Config Error" });
  }
}
