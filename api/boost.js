export default async function handler(req, res) {
    const DEVICE_ID = "DEV-6a0e5559-0ea9-44f7-bba7-c9545175ece2"; 
    const USER_KEY = "VOID-FBOA-SEIK-FAZR-D92E";
    const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbXJlcnJlbW1ibnJ4eXV0dW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2MTkwODIsImV4cCI6MjA4MjE5NTA4Mn0.tVCTSr8FZI8Z6KyiVqsVRga0qwRrEHkIZIHT2eDcvWs";

    // Full Browser Fingerprint Headers
    const stealthHeaders = {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
        'x-client-info': 'supabase-js/2.39.7',
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'Sec-Fetch-Site': 'cross-site',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Dest': 'empty',
        'Referer': 'https://auto-boost-void-booster.vercel.app/',
        'Origin': 'https://auto-boost-void-booster.vercel.app',
        'Accept-Language': 'en-US,en;q=0.9'
    };

    try {
        // STEP 1: Mandatory Binding
        await fetch('https://emmrerremmbnrxyutunp.supabase.co/rest/v1/rpc/bind_device_to_key', {
            method: 'POST',
            headers: stealthHeaders,
            body: JSON.stringify({ p_key: USER_KEY, p_device_id: DEVICE_ID })
        });

        // STEP 2: Trigger Boost Proxy
        const params = new URLSearchParams({
            action: 'start',
            url: "https://www.facebook.com/profile.php?id=61583017822517",
            type: 'facebook_followers',
            count: '100', 
            device_id: DEVICE_ID
        });

        const boostResponse = await fetch(`https://emmrerremmbnrxyutunp.supabase.co/functions/v1/boost-proxy?${params}`, {
            method: 'GET',
            headers: stealthHeaders // Applying stealth headers here too
        });

        const data = await boostResponse.json();

        // If it still fails, it's an IP block
        if (data.error === "Access denied") {
            return res.status(200).json({
                success: false,
                message: "The server is blocking Vercel's IP address.",
                solution: "You must use a Proxy or run this script from a different hosting provider.",
                server_response: data
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
