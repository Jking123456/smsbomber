export default async function handler(req, res) {
    const DEVICE_ID = "DEV-6a0e5559-0ea9-44f7-bba7-c9545175ece2";
    const USER_KEY = "VOID-FBOA-SEIK-FAZR-D92E";
    const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbXJlcnJlbW1ibnJ4eXV0dW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2MTkwODIsImV4cCI6MjA4MjE5NTA4Mn0.tVCTSr8FZI8Z6KyiVqsVRga0qwRrEHkIZIHT2eDcvWs";
    const targetUrl = "https://www.facebook.com/profile.php?id=61583017822517";

    try {
        // Step 1: Bind Device (Using native fetch)
        await fetch('https://emmrerremmbnrxyutunp.supabase.co/rest/v1/rpc/bind_device_to_key', {
            method: 'POST',
            headers: { 
                'apikey': ANON_KEY,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ p_key: USER_KEY, p_device_id: DEVICE_ID })
        });

        // Step 2: Trigger Boost
        const query = new URLSearchParams({
            action: 'start',
            url: targetUrl,
            type: 'facebook_followers',
            count: '1',
            device_id: DEVICE_ID
        });

        const response = await fetch(`https://emmrerremmbnrxyutunp.supabase.co/functions/v1/boost-proxy?${query}`, {
            method: 'GET',
            headers: {
                'apikey': ANON_KEY,
                'Authorization': `Bearer ${ANON_KEY}`
            }
        });

        const data = await response.json();

        return res.status(200).json({ 
            success: true, 
            server_data: data 
        });

    } catch (error) {
        return res.status(200).json({ 
            success: false, 
            error: error.message 
        });
    }
}
