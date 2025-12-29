export default async function handler(req, res) {
    const DEVICE_ID = "DEV-6a0e5559-0ea9-44f7-bba7-c9545175ece2"; 
    const USER_KEY = "VOID-FBOA-SEIK-FAZR-D92E";
    const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbXJlcnJlbW1ibnJ4eXV0dW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2MTkwODIsImV4cCI6MjA4MjE5NTA4Mn0.tVCTSr8FZI8Z6KyiVqsVRga0qwRrEHkIZIHT2eDcvWs";

    const stealthHeaders = {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
        'x-client-info': 'supabase-js/2.39.7',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };

    try {
        // Step 1: Bind/Session Handshake
        await fetch('https://emmrerremmbnrxyutunp.supabase.co/rest/v1/rpc/bind_device_to_key', {
            method: 'POST',
            headers: stealthHeaders,
            body: JSON.stringify({ p_key: USER_KEY, p_device_id: DEVICE_ID })
        });

        // Step 2: Trigger Boost with alternate 'type' and mobile URL
        // E003 Fix: Many proxies prefer the 'm.facebook.com' format or just the ID.
        const targetUrl = "https://m.facebook.com/profile.php?id=61583017822517";
        
        const params = new URLSearchParams({
            action: 'start',
            url: targetUrl,
            type: 'fb_followers', // Changed from 'facebook_followers' to 'fb_followers'
            count: '500',         // Increased to 500 (standard minimum for many scripts)
            device_id: DEVICE_ID
        });

        const boostResponse = await fetch(`https://emmrerremmbnrxyutunp.supabase.co/functions/v1/boost-proxy?${params}`, {
            method: 'GET',
            headers: stealthHeaders
        });

        const data = await boostResponse.json();

        return res.status(200).json({
            success: data.error ? false : true,
            message: data.error ? `Error: ${data.code}` : "Request Sent",
            server_data: data
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
