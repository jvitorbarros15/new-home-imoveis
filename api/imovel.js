import { readFile } from "node:fs/promises";
import { join } from "node:path";

const SITE_URL = process.env.SITE_URL || "https://new-home-imoveis.vercel.app";
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";
const CODE_PATTERN = /^[A-Za-z0-9-]{1,32}$/;

let templateCache;

async function loadTemplate() {
  if (templateCache) return templateCache;
  templateCache = await readFile(join(process.cwd(), "templates", "imovel.html"), "utf8");
  return templateCache;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function fetchProperty(code) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  const query = new URLSearchParams({
    code: `eq.${code}`,
    status: "eq.active",
    select: "code,title,type,region,price_brl,area_m2,bedrooms,suites,parking,images",
    limit: "1",
  });
  const response = await fetch(`${SUPABASE_URL}/rest/v1/properties?${query}`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    signal: AbortSignal.timeout(3000),
  });
  if (!response.ok) return null;
  const rows = await response.json();
  return Array.isArray(rows) && rows.length ? rows[0] : null;
}

function buildMeta(property, code) {
  const price = property.price_brl
    ? (property.price_brl / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
    : "Valor sob consulta";
  const specs = [
    property.area_m2 ? `${property.area_m2} m²` : null,
    property.bedrooms ? `${property.bedrooms} quartos` : null,
    property.suites ? `${property.suites} suítes` : null,
    property.parking ? `${property.parking} vagas` : null,
  ].filter(Boolean).join(" · ");

  return {
    title: `${property.title} · ${property.region} · ${code} — New Home Imóveis`,
    description: [`${property.type || "Imóvel"} em ${property.region}.`, specs, price].filter(Boolean).join(" "),
    image: Array.isArray(property.images) && property.images[0]
      ? property.images[0]
      : `${SITE_URL}/assets/logo-gold.png`,
    url: `${SITE_URL}/imovel?code=${encodeURIComponent(code)}`,
  };
}

function applyMeta(html, meta) {
  const set = (source, pattern, replacement) => source.replace(pattern, replacement);
  let out = set(html, /<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(meta.title)}</title>`);
  out = set(out, /<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${escapeHtml(meta.description)}" />`);
  out = set(out, /<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${escapeHtml(meta.url)}" />`);
  out = set(out, /<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${escapeHtml(meta.title)}" />`);
  out = set(out, /<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${escapeHtml(meta.description)}" />`);
  out = set(out, /<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${escapeHtml(meta.url)}" />`);
  out = set(out, /<meta property="og:image" content="[^"]*" \/>/, `<meta property="og:image" content="${escapeHtml(meta.image)}" />`);
  return out;
}

export default async function handler(request, response) {
  const template = await loadTemplate();
  const url = new URL(request.url, `https://${request.headers.host || "localhost"}`);
  const code = (url.searchParams.get("code") || "").trim();

  let html = template;
  if (code && CODE_PATTERN.test(code)) {
    try {
      const property = await fetchProperty(code);
      if (property) html = applyMeta(template, buildMeta(property, property.code));
    } catch {
      // Metadata enrichment is best-effort; the shell still renders.
    }
  }

  response.setHeader("Content-Type", "text/html; charset=utf-8");
  response.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
  response.status(200).send(html);
}
