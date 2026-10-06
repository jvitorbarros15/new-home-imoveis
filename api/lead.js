const DEFAULT_SITE_URL = "https://new-home-imoveis.vercel.app";
const MAX_BODY_BYTES = 10 * 1024;
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const KINDS = { contact: "Contato", visit: "Visita", seller: "Anunciante" };
const CODE_PATTERN = /^[A-Za-z0-9-]{1,32}$/;
const EMAIL_PATTERN = /^\S+@\S+$/;

// Per-instance memory: resets on cold starts and is not shared between
// instances, so this is only a first line of defence next to Turnstile.
const hits = new Map();

function normalizePhoneBR(raw) {
  let digits = String(raw || "").replace(/\D/g, "");
  if (digits.startsWith("55") && digits.length >= 12) digits = digits.slice(2);
  digits = digits.replace(/^0+/, "");
  if (digits.length === 11 && digits[2] !== "9") return null;
  if (digits.length !== 10 && digits.length !== 11) return null;
  return `+55${digits}`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function clean(value, max) {
  if (typeof value !== "string") return null;
  const text = value.trim().slice(0, max);
  return text || null;
}

function clientIp(request) {
  const forwarded = String(request.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return forwarded || String(request.headers["x-real-ip"] || "").trim() || "unknown";
}

function rateLimited(ip, now) {
  if (hits.size > 5000) {
    for (const [key, entry] of hits) if (entry.resetAt <= now) hits.delete(key);
  }
  const entry = hits.get(ip);
  if (!entry || entry.resetAt <= now) {
    hits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return 0;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT ? Math.ceil((entry.resetAt - now) / 1000) : 0;
}

function readBody(request) {
  const length = Number(request.headers["content-length"] || 0);
  if (length > MAX_BODY_BYTES) return { status: 413 };
  let body = request.body;
  if (typeof body === "string" || Buffer.isBuffer(body)) {
    if (Buffer.byteLength(body) > MAX_BODY_BYTES) return { status: 413 };
    try { body = JSON.parse(String(body)); } catch { return { status: 400 }; }
  } else if (body && Buffer.byteLength(JSON.stringify(body)) > MAX_BODY_BYTES) {
    return { status: 413 };
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) return { status: 400 };
  return { body };
}

function validate(body) {
  if (body.consent !== true) return null;
  const name = clean(body.name, 120);
  const phone = normalizePhoneBR(body.phone);
  if (!name || !phone) return null;
  const email = clean(body.email, 200);
  if (email && (email.length < 5 || !EMAIL_PATTERN.test(email))) return null;
  const kind = body.kind === undefined ? "contact" : body.kind;
  if (!Object.hasOwn(KINDS, kind)) return null;
  const propertyCode = clean(body.property_code, 32);
  if (propertyCode && !CODE_PATTERN.test(propertyCode)) return null;
  return {
    name,
    phone,
    email,
    interest: clean(body.interest, 60),
    message: clean(body.message, 2000),
    kind,
    property_code: propertyCode,
    source_path: clean(body.source_path, 200),
    utm_source: clean(body.utm_source, 100),
    utm_medium: clean(body.utm_medium, 100),
    utm_campaign: clean(body.utm_campaign, 100),
    referrer: clean(body.referrer, 300),
    consent_version: clean(body.consent_version, 40),
  };
}

async function verifyTurnstile(secret, token, ip) {
  const form = new URLSearchParams({ secret, response: token });
  if (ip !== "unknown") form.set("remoteip", ip);
  const result = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form,
    signal: AbortSignal.timeout(3000),
  });
  if (!result.ok) throw new Error(`Turnstile responded ${result.status}`);
  const data = await result.json();
  return data.success === true;
}

async function insertLead(lead) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const result = await fetch(`${process.env.SUPABASE_URL}/rest/v1/leads`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(lead),
    signal: AbortSignal.timeout(3000),
  });
  if (!result.ok) throw new Error(`Supabase responded ${result.status}`);
}

function buildEmail(lead, siteUrl) {
  const label = KINDS[lead.kind];
  const subject = [`Novo contato: ${label}`, lead.property_code, lead.name.split(/\s+/)[0]]
    .filter(Boolean).join(" · ").replace(/[\r\n]+/g, " ");
  const digits = lead.phone.replace(/\D/g, "");
  const propertyUrl = lead.property_code ? `${siteUrl}/imovel?code=${encodeURIComponent(lead.property_code)}` : null;
  const utm = [lead.utm_source, lead.utm_medium, lead.utm_campaign];
  const rows = [
    ["Tipo", escapeHtml(label)],
    ["Nome", escapeHtml(lead.name)],
    ["WhatsApp", `<a href="https://wa.me/${digits}">${escapeHtml(lead.phone)}</a>`],
    ["E-mail", lead.email ? escapeHtml(lead.email) : null],
    ["Interesse", lead.interest ? escapeHtml(lead.interest) : null],
    ["Imóvel", propertyUrl ? `<a href="${escapeHtml(propertyUrl)}">${escapeHtml(lead.property_code)}</a>` : null],
    ["Mensagem", lead.message ? escapeHtml(lead.message).replace(/\n/g, "<br>") : null],
    ["Página", lead.source_path ? escapeHtml(lead.source_path) : null],
    ["UTM", utm.some(Boolean) ? escapeHtml(utm.map((value) => value || "-").join(" / ")) : null],
    ["Origem", lead.referrer ? escapeHtml(lead.referrer) : null],
  ].filter(([, value]) => value);
  const html = `<table cellpadding="6" style="font-family:sans-serif;font-size:14px">${rows
    .map(([key, value]) => `<tr><td><strong>${key}</strong></td><td>${value}</td></tr>`).join("")}</table>`;
  return { subject, html };
}

async function notify(lead) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = (process.env.LEAD_NOTIFY_TO || "").split(",").map((item) => item.trim()).filter(Boolean);
  if (!apiKey || !to.length) return;
  const siteUrl = (process.env.SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, "");
  try {
    const result = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.LEAD_NOTIFY_FROM || "New Home <onboarding@resend.dev>",
        to,
        ...buildEmail(lead, siteUrl),
      }),
      signal: AbortSignal.timeout(3000),
    });
    if (!result.ok) console.error(`Lead email failed: ${result.status}`);
  } catch (error) {
    console.error(`Lead email failed: ${error.name}`);
  }
}

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");
  const reply = (status, payload) => response.status(status).json(payload);

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return reply(405, { saved: false });
  }

  const parsed = readBody(request);
  if (!parsed.body) return reply(parsed.status, { saved: false });
  const body = parsed.body;

  if (typeof body.website === "string" && body.website.trim()) return reply(200, { saved: true });

  const ip = clientIp(request);
  const retryAfter = rateLimited(ip, Date.now());
  if (retryAfter) {
    response.setHeader("Retry-After", String(retryAfter));
    return reply(429, { saved: false });
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret && process.env.VERCEL_ENV === "production") {
    console.error("Lead endpoint misconfigured: TURNSTILE_SECRET_KEY is not set");
    return reply(503, { saved: false });
  }

  const lead = validate(body);
  if (!lead) return reply(400, { saved: false });

  if (secret) {
    const token = typeof body.turnstileToken === "string" ? body.turnstileToken.slice(0, 2048) : "";
    if (!token) return reply(403, { saved: false });
    try {
      if (!(await verifyTurnstile(secret, token, ip))) return reply(403, { saved: false });
    } catch (error) {
      console.error(`Turnstile verification failed: ${error.name}`);
      return reply(502, { saved: false });
    }
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Lead endpoint misconfigured: Supabase env is not set");
    return reply(502, { saved: false });
  }

  try {
    await insertLead({ ...lead, consent_at: new Date().toISOString() });
  } catch (error) {
    console.error(`Lead insert failed: ${error.message}`);
    return reply(502, { saved: false });
  }

  await notify(lead);
  return reply(201, { saved: true });
}
