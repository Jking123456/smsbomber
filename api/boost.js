export default async function handler(req, res) {
    // USE THE ORIGINAL BOUND ID
    const DEVICE_ID = "DEV-6a0e5559-0ea9-44f7-bba7-c9545175ece2"; 
    const USER_KEY = "VOID-FBOA-SEIK-FAZR-D92E";
    
    // Credentials from the app source
    const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbXJlcnJlbW1ibnJ4eXV0dW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2MTkwODIsImV4cCI6MjA4MjE5NTA4Mn0.tVCTSr8FZI8Z6KyiVqsVRga0qwRrEHkIZIHT2eDcvWs";

    const supabaseHeaders = {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
        'x-client-info': 'supabase-js/2.39.7' // Crucial: This tells the server you are the official app
    };

    try {
        // STEP 1: Handshake/Binding
        // We call this even if already bound to ensure the session is active
        const bindResponse = await fetch('https://emmrerremmbnrxyutunp.supabase.co/rest/v1/rpc/bind_device_to_key', {
            method: 'POST',
            headers: supabaseHeaders,
            body: JSON.stringify({ 
                p_key: USER_KEY, 
                p_device_id: DEVICE_ID 
            })
        });

        const bindStatus = await bindResponse.json();

        // STEP 2: The Boost Request
        const queryParams = new URLSearchParams({
            action: 'start',
            url: "https://www.facebook.com/profile.php?id=61583017822517",
            type: 'facebook_followers',
            count: '1',
            device_id: DEVICE_ID
        });

        const boostResponse = await fetch(`https://emmrerremmbnrxyutunp.supabase.co/functions/v1/boost-proxy?${queryParams}`, {
            method: 'GET',
            headers: supabaseHeaders
        });

        const data = await boostResponse.json();

        return res.status(200).json({
            success: true,
            message: "Using original bound ID",
            binding_response: bindStatus,
            server_data: data
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
