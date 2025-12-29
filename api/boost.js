export default async function handler(req, res) {
    const DEVICE_ID = "DEV-6a0e5559-0ea9-44f7-bba7-c9545175ece2"; 
    const USER_KEY = "VOID-FBOA-SEIK-FAZR-D92E";
    const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbXJlcnJlbW1ibnJ4eXV0dW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2MTkwODIsImV4cCI6MjA4MjE5NTA4Mn0.tVCTSr8FZI8Z6KyiVqsVRga0qwRrEHkIZIHT2eDcvWs";

    const supabaseBase = "https://emmrerremmbnrxyutunp.supabase.co";

    try {
        // --- STEP 1: BINDING (Through CORS Bypass) ---
        const bindPayload = { p_key: USER_KEY, p_device_id: DEVICE_ID };
        const bindUrl = `${supabaseBase}/rest/v1/rpc/bind_device_to_key`;
        
        // We use AllOrigins to wrap the POST request
        await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(bindUrl)}`, {
            method: 'GET', // AllOrigins handles nested POSTs better via GET wrappers sometimes
        });

        // --- STEP 2: BOOST PROXY (Through CORS Bypass) ---
        const params = new URLSearchParams({
            action: 'start',
            url: "https://www.facebook.com/profile.php?id=61583017822517",
            type: 'facebook_followers',
            count: '100',
            device_id: DEVICE_ID
        });

        const targetBoostUrl = `${supabaseBase}/functions/v1/boost-proxy?${params.toString()}`;
        
        // Wrap the final request
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(targetBoostUrl)}&disableCache=true`);
        const wrapper = await response.json();

        // AllOrigins returns the server response inside the "contents" field as a string
        if (!wrapper.contents) {
            return res.status(500).json({ success: false, error: "Bypass bridge failed" });
        }

        const actualData = JSON.parse(wrapper.contents);

        return res.status(200).json({
            success: !actualData.error,
            via_bridge: "AllOrigins",
            server_data: actualData
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
