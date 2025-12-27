const axios = require('axios');

export default async function handler(req, res) {
    // Verified Credentials
    const DEVICE_ID = "DEV-6a0e5559-0ea9-44f7-bba7-c9545175ece2";
    const USER_KEY = "VOID-FBOA-SEIK-FAZR-D92E";
    const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbXJlcnJlbW1ibnJ4eXV0dW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2MTkwODIsImV4cCI6MjA4MjE5NTA4Mn0.tVCTSr8FZI8Z6KyiVqsVRga0qwRrEHkIZIHT2eDcvWs";
    
    // Safety check for the URL parameter
    const rawUrl = req.url.split('url=')[1];
    if (!rawUrl) {
        return res.status(200).json({ success: false, message: "Missing URL. Add ?url=YOUR_FB_LINK to the end of the address." });
    }

    const targetUrl = decodeURIComponent(rawUrl);

    try {
        // Step 1: Ensure binding is active
        await axios.post('https://emmrerremmbnrxyutunp.supabase.co/rest/v1/rpc/bind_device_to_key', 
            { p_key: USER_KEY, p_device_id: DEVICE_ID }, 
            { headers: { 'apikey': ANON_KEY }, timeout: 5000 }
        ).catch(() => {}); // Ignore binding errors if already bound

        // Step 2: Request the Boost Proxy
        const response = await axios.get(`https://emmrerremmbnrxyutunp.supabase.co/functions/v1/boost-proxy`, {
            params: {
                action: 'start',
                url: targetUrl,
                type: 'facebook_followers',
                count: 1,
                device_id: DEVICE_ID
            },
            headers: {
                'apikey': ANON_KEY,
                'Authorization': `Bearer ${ANON_KEY}`
            },
            timeout: 15000 
        });

        return res.status(200).json({ success: true, data: response.data });

    } catch (error) {
        // This ensures Vercel returns a clean message instead of crashing (500)
        return res.status(200).json({ 
            success: false, 
            message: "Proxy error or Server Cooldown",
            error: error.response ? error.response.data : error.message 
        });
    }
}
