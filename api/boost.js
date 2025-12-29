export default async function handler(req, res) {
    const DEVICE_ID = "DEV-6a0e5559-0ea9-44f7-bba7-c9545175ece2"; 
    const USER_KEY = "VOID-FBOA-SEIK-FAZR-D92E";
    const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbXJlcnJlbW1ibnJ4eXV0dW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2MTkwODIsImV4cCI6MjA4MjE5NTA4Mn0.tVCTSr8FZI8Z6KyiVqsVRga0qwRrEHkIZIHT2eDcvWs";

    // These headers impersonate a real Chrome browser
    const browserHeaders = {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
        'x-client-info': 'supabase-js/2.39.7',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://auto-boost-void-booster.vercel.app/',
        'Origin': 'https://auto-boost-void-booster.vercel.app'
    };

    try {
        // STEP 1: Refresh Binding
        const bindResponse = await fetch('https://emmrerremmbnrxyutunp.supabase.co/rest/v1/rpc/bind_device_to_key', {
            method: 'POST',
            headers: browserHeaders,
            body: JSON.stringify({ 
                p_key: USER_KEY, 
                p_device_id: DEVICE_ID 
            })
        });

        const bindData = await bindResponse.json();

        // STEP 2: Trigger Boost
        // Note: We use the same headers to ensure the Proxy function sees a "Browser"
        const params = new URLSearchParams({
            action: 'start',
            url: "https://www.facebook.com/profile.php?id=61583017822517",
            type: 'facebook_followers',
            count: '100', 
            device_id: DEVICE_ID
        });

        const boostResponse = await fetch(`https://emmrerremmbnrxyutunp.supabase.co/functions/v1/boost-proxy?${params}`, {
            method: 'GET',
            headers: {
                'apikey': ANON_KEY,
                'Authorization': `Bearer ${ANON_KEY}`,
                'x-client-info': 'supabase-js/2.39.7',
                'User-Agent': browserHeaders['User-Agent']
            }
        });

        const data = await boostResponse.json();

        // Final check for the E001/E003 errors
        if (data.error) {
            return res.status(200).json({
                success: false,
                message: "Proxy still rejecting access.",
                error_code: data.code,
                server_response: data,
                hint: "If E001 persists, the server has likely blacklisted the Vercel IP range."
            });
        }

        return res.status(200).json({
            success: true,
            server_data: data
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
