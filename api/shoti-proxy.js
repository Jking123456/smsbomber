export default async function handler(req, res) {
  try {
    // 1️⃣ Get Shoti API link
    const apiResponse = await fetch("https://haji-mix-api.gleeze.com/api/shoti?stream=false", {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
      },
      cache: "no-store"
    });

    if (!apiResponse.ok) {
      return res.status(502).json({ error: "Failed to fetch from Shoti API" });
    }

    const data = await apiResponse.json();
    const videoUrl = data.link;

    if (!videoUrl) {
      return res.status(404).json({ error: "No video link found" });
    }

    // 2️⃣ Fetch the actual video binary
    const videoResponse = await fetch(videoUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "*/*"
      }
    });

    if (!videoResponse.ok) {
      return res.status(502).json({ error: "Failed to fetch video from source" });
    }

    // 3️⃣ Ensure correct content type (force mp4)
    const contentType = videoResponse.headers.get("content-type");
    const safeContentType = contentType && contentType.includes("video")
      ? contentType
      : "video/mp4";

    res.setHeader("Content-Type", safeContentType);
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    // 4️⃣ Stream the video to the client
    const reader = videoResponse.body.getReader();
    const stream = new ReadableStream({
      async start(controller) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
        }
        controller.close();
      }
    });

    return new Response(stream, { headers: { "Content-Type": safeContentType } }).body.pipe(res);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
