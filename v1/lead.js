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

const TURNSTILE_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let turnstileLoading;

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve();
  if (!turnstileLoading) {
    turnstileLoading = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = TURNSTILE_SRC;
      script.async = true;
      script.onload = resolve;
      script.onerror = () => { turnstileLoading = null; reject(new Error("turnstile")); };
      document.head.appendChild(script);
    });
  }
  return turnstileLoading;
}

function LeadGuard() {
  const box = React.useRef(null);
  const siteKey = (window.NEW_HOME_CONFIG || {}).turnstileSiteKey || "";
  React.useEffect(() => {
    const form = box.current && box.current.closest("form");
    if (!siteKey || !form) return;
    let widget = null;
    let gone = false;
    const start = () => {
      loadTurnstile().then(() => {
        if (gone || widget !== null || !box.current) return;
        widget = window.turnstile.render(box.current, { sitekey: siteKey, appearance: "interaction-only" });
      }).catch(() => {});
    };
    form.addEventListener("focusin", start, { once: true });
    return () => {
      gone = true;
      form.removeEventListener("focusin", start);
      if (widget !== null && window.turnstile) window.turnstile.remove(widget);
    };
  }, [siteKey]);
  return React.createElement(React.Fragment, null,
    React.createElement("div", { "aria-hidden": "true", style: { position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" } },
      React.createElement("input", { name: "website", type: "text", tabIndex: -1, autoComplete: "off", defaultValue: "" })),
    React.createElement("div", { ref: box, className: "nh-turnstile" }));
}

async function readTurnstileToken(form) {
  const needed = Boolean((window.NEW_HOME_CONFIG || {}).turnstileSiteKey);
  for (let waited = 0; ; waited += 250) {
    const token = String(new FormData(form).get("cf-turnstile-response") || "");
    if (token || !needed || waited >= 5000) return token;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
}

async function saveLeadDirect(row) {
  if (!window.sb) return { saved: false };
  try {
    const { error } = await window.sb.from("leads").insert({ ...row, consent_at: new Date().toISOString() });
    return { saved: !error };
  } catch (e) {
    return { saved: false };
  }
}

async function submitLead(lead, form) {
  const row = {
    ...readAttribution(),
    ...lead,
    source_path: location.pathname.slice(0, 200),
    consent_version: LEAD_CONSENT_VERSION,
  };
  const token = form ? await readTurnstileToken(form) : "";
  const website = form ? String(new FormData(form).get("website") || "") : "";
  try {
    const response = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...row, consent: true, website, turnstileToken: token }),
    });
    if (response.status !== 404) return { saved: response.ok };
  } catch (e) {
  } finally {
    const box = form && form.querySelector(".nh-turnstile");
    if (box && box.firstChild && window.turnstile) window.turnstile.reset(box);
  }
  return saveLeadDirect(row);
}

readAttribution();
