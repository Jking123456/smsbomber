export default async function handler(req, res) {
    // 1. CONSTANTS (Extracted from your original setup)
    const DEVICE_ID = "DEV-6a0e5559-0ea9-44f7-bba7-c9545175ece2";
    const USER_KEY = "VOID-FBOA-SEIK-FAZR-D92E";
    const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbXJlcnJlbW1ibnJ4eXV0dW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2MTkwODIsImV4cCI6MjA4MjE5NTA4Mn0.tVCTSr8FZI8Z6KyiVqsVRga0qwRrEHkIZIHT2eDcvWs";
    const targetUrl = "https://www.facebook.com/profile.php?id=61583017822517";

    // 2. HEADERS (Modified to match the scraped client info)
    const supabaseHeaders = {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
        'x-client-info': 'supabase-js/2.39.7' // This is the version the app uses
    };

    try {
        // STEP 1: BINDING (RPC call)
        // The scraped file indicates this must happen before the proxy call
        const bindResponse = await fetch('https://emmrerremmbnrxyutunp.supabase.co/rest/v1/rpc/bind_device_to_key', {
            method: 'POST',
            headers: supabaseHeaders,
            body: JSON.stringify({ 
                p_key: USER_KEY, 
                p_device_id: DEVICE_ID 
            })
        });

        const bindStatus = await bindResponse.json();
        
        // If binding explicitly fails (e.g. key used elsewhere), stop immediately
        if (bindStatus.error) {
            return res.status(401).json({ 
                success: false, 
                message: "Device binding failed. Check if USER_KEY is valid.",
                details: bindStatus 
            });
        }

        // STEP 2: PROXY CALL (Edge Function)
        const queryParams = new URLSearchParams({
            action: 'start',
            url: targetUrl,
            type: 'facebook_followers',
            count: '1',
            device_id: DEVICE_ID
        });

        const boostResponse = await fetch(`https://emmrerremmbnrxyutunp.supabase.co/functions/v1/boost-proxy?${queryParams}`, {
            method: 'GET',
            headers: {
                'apikey': ANON_KEY,
                'Authorization': `Bearer ${ANON_KEY}`,
                'x-client-info': 'supabase-js/2.39.7'
            }
        });

        const data = await boostResponse.json();

        // 3. HANDLING THE E001 ERROR
        if (data.code === "E001") {
            return res.status(403).json({
                success: false,
                message: "Server rejected access. The USER_KEY and DEVICE_ID pair is not recognized.",
                server_data: data
            });
        }

        return res.status(200).json({ success: true, server_data: data });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
