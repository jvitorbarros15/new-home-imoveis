const LEAD_CONSENT_VERSION = "2026-09";

function normalizePhoneBR(raw) {
  let digits = String(raw || "").replace(/\D/g, "");
  if (digits.startsWith("55") && digits.length >= 12) digits = digits.slice(2);
  digits = digits.replace(/^0+/, "");
  if (digits.length === 11 && digits[2] !== "9") return null;
  if (digits.length !== 10 && digits.length !== 11) return null;
  return `+55${digits}`;
}

function readAttribution() {
  const KEY = "nh_attribution";
  try {
    const saved = sessionStorage.getItem(KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  const params = new URLSearchParams(location.search);
  let referrer = null;
  try {
    if (document.referrer && new URL(document.referrer).origin !== location.origin) referrer = document.referrer.slice(0, 300);
  } catch (e) {}
  const attribution = {
    utm_source: params.get("utm_source")?.slice(0, 100) || null,
    utm_medium: params.get("utm_medium")?.slice(0, 100) || null,
    utm_campaign: params.get("utm_campaign")?.slice(0, 100) || null,
    referrer,
  };
  try { sessionStorage.setItem(KEY, JSON.stringify(attribution)); } catch (e) {}
  return attribution;
}

async function submitLead(lead) {
  if (!window.sb) return { saved: false };
  try {
    const { error } = await window.sb.from("leads").insert({
      ...readAttribution(),
      ...lead,
      source_path: location.pathname.slice(0, 200),
      consent_at: new Date().toISOString(),
      consent_version: LEAD_CONSENT_VERSION,
    });
    return { saved: !error };
  } catch (e) {
    return { saved: false };
  }
}

readAttribution();
