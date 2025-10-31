import crypto from "crypto";

// 15-minute cooldown (per hybrid device key)
const cooldowns = new Map();
const COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes

function makeHybridIdHash(userAgent, deviceModel, ip) {
  const raw = `${userAgent}||${deviceModel}||${ip}`;
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { phoneNumber, amount } = req.body;

  if (!phoneNumber || !amount) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Gather identification pieces
  const userAgent = (req.headers["user-agent"] || "unknown-ua").trim();
  // try common headers for device model; clients may also send custom header 'x-device-model'
  const deviceModel =
    (req.headers["x-device-model"] ||
     req.headers["sec-ch-ua-platform"] ||
     // fallback: try to extract the token inside parentheses from user-agent e.g. (Linux; Android 10; Pixel 3)
     (() => {
       const m = userAgent.match(/\(([^)]+)\)/);
       return m ? m[1].split(";").map(s => s.trim())[0] : "unknown-model";
     })()
    ).toString();
  const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown-ip").toString();

  // Make a hashed hybrid id to avoid storing long raw headers and to slightly obscure them
  const deviceId = makeHybridIdHash(userAgent, deviceModel, ip);

  // Cooldown check
  const lastTime = cooldowns.get(deviceId);
  const now = Date.now();

  if (lastTime && now - lastTime < COOLDOWN_MS) {
    const remaining = Math.ceil((COOLDOWN_MS - (now - lastTime)) / 1000);
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    const readable =
      minutes > 0
        ? `${minutes} minute${minutes > 1 ? "s" : ""} and ${seconds} second${seconds !== 1 ? "s" : ""}`
        : `${seconds} second${seconds !== 1 ? "s" : ""}`;

    return res.status(429).json({
      error: `Please wait ${readable} before using this service again.`,
      remainingSeconds: remaining
    });
  }

  try {
    // Step 1: Try to get a fresh API key
    const keyResponse = await fetch("https://sms-api-key.vercel.app/api/generate?count=1");

    if (!keyResponse.ok) {
      // Attempt to parse cooldown info if present (propagate it)
      const errData = await keyResponse.json().catch(() => ({}));

      if (errData?.error?.includes("Cooldown")) {
        // Extract remaining seconds from error message if available
        const match = errData.error.match(/(\d+)\s*seconds?/);
        const remaining = match ? parseInt(match[1], 10) : 0;
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        const readable =
          minutes > 0
            ? `${minutes} minute${minutes > 1 ? "s" : ""} and ${seconds} second${seconds !== 1 ? "s" : ""}`
            : `${seconds} second${seconds !== 1 ? "s" : ""}`;

        return res.status(429).json({
          error: `Please wait ${readable} before using this service again.`,
          remainingSeconds: remaining
        });
      }

      throw new Error("Failed to obtain API key");
    }

    const keyData = await keyResponse.json();
    const apiKey = keyData[0]; // API returns an array with one key

    if (!apiKey) {
      throw new Error("15 minutes Cooldown (no API key available)");
    }

    // Step 2: Send SMS using the fetched key
    const smsResponse = await fetch("https://toshismsbmbapi.up.railway.app/api/send-sms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey
      },
      body: JSON.stringify({ phoneNumber, amount })
    });

    const data = await smsResponse.json();

    // If SMS succeeded (2xx), set cooldown for this hybrid device id.
    if (smsResponse.ok) {
      cooldowns.set(deviceId, Date.now());
    } else {
      // If SMS failed, do not set cooldown so user can retry quickly
      // Optionally you can handle specific statuses differently here.
    }

    return res.status(smsResponse.status).json(data);

  } catch (error) {
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
        }
