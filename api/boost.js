export default async function handler(req, res) {
    const DEVICE_ID = "DEV-6a0e5559-0ea9-44f7-bba7-c9545175ece2"; 
    const USER_KEY = "VOID-FBOA-SEIK-FAZR-D92E";
    const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbXJlcnJlbW1ibnJ4eXV0dW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2MTkwODIsImV4cCI6MjA4MjE5NTA4Mn0.tVCTSr8FZI8Z6KyiVqsVRga0qwRrEHkIZIHT2eDcvWs";

    const stealthHeaders = {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'x-client-info': 'supabase-js/2.39.7', // Matches original client
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Sec-Fetch-Site': 'cross-site',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Dest': 'empty',
        'Referer': 'https://auto-boost-void-booster.vercel.app/',
    };

    try {
        // Step 1: Re-bind to refresh the session token
        await fetch('https://emmrerremmbnrxyutunp.supabase.co/rest/v1/rpc/bind_device_to_key', {
            method: 'POST',
            headers: { ...stealthHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({ p_key: USER_KEY, p_device_id: DEVICE_ID })
        });

        // Step 2: The Boost Call
        const params = new URLSearchParams({
            action: 'start',
            url: "https://www.facebook.com/profile.php?id=61583017822517",
            type: 'facebook_followers',
            count: '100',
            device_id: DEVICE_ID
        });

        const response = await fetch(`https://emmrerremmbnrxyutunp.supabase.co/functions/v1/boost-proxy?${params}`, {
            method: 'GET',
            headers: stealthHeaders
        });

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
