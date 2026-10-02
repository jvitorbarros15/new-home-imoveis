import { chromium } from "playwright-core";
import AxeBuilder from "@axe-core/playwright";
import { access } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

const baseUrl = process.env.VERIFY_URL || "http://127.0.0.1:8080";
const candidates = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
].filter(Boolean);

let executablePath;
for (const candidate of candidates) {
  try {
    await access(candidate);
    executablePath = candidate;
    break;
  } catch {}
}
if (!executablePath) throw new Error("Chrome or Edge was not found.");

const browser = await chromium.launch({ executablePath, headless: true });
const pages = [
  { name: "home", path: "/" },
  { name: "about", path: "/quem-somos.html" },
  { name: "listings", path: "/imoveis.html" },
  { name: "favorites", path: "/favoritos.html" },
  { name: "privacy", path: "/privacidade.html" },
  { name: "seller", path: "/anunciar.html" },
  { name: "finance", path: "/financiamento.html" },
  { name: "property", path: "/imovel?code=AP0001-NHB" },
  { name: "property-missing", path: "/imovel?code=ZZZ" },
  { name: "admin", path: "/admin.html" },
  { name: "not-found", path: "/404.html" },
];

const fixtureProperty = {
  code: "AP0001-NHB", title: "Apartamento de teste", type: "Apartamento", region: "Barra da Tijuca",
  price_brl: 150000000, area_m2: 100, bedrooms: 3, suites: 1, bathrooms: 2, parking: 1,
  images: ["/assets/logo-gold.png", "/assets/logo-gold.png", "/assets/logo-gold.png"], status: "active", purpose: "sale", description: "Descrição de teste.",
  tour_url: null, pet_friendly: true, condominio_brl: 0, iptu_brl: 0, featured: true,
};

const fixtureNoPhotos = { ...fixtureProperty, code: "AP0002-NHB", title: "Apartamento sem fotos", images: [], featured: false };

async function mockBackend(context) {
  await context.route("**/config.js", (route) => route.fulfill({
    contentType: "application/javascript",
    body: 'window.NEW_HOME_CONFIG={"supabaseUrl":"https://fixture.supabase.co","supabaseAnonKey":"fixture","turnstileSiteKey":""};',
  }));
  await context.route("https://fixture.supabase.co/**", (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (request.method() !== "GET") return route.fulfill({ status: 201, body: "" });
    if (!url.pathname.endsWith("/properties")) return route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    const code = url.searchParams.get("code");
    const wantsObject = (request.headers()["accept"] || "").includes("vnd.pgrst.object");
    const rows = code === "eq.AP0001-NHB" || !code ? [fixtureProperty] : code === "eq.AP0002-NHB" ? [fixtureNoPhotos] : [];
    if (wantsObject) {
      return rows.length
        ? route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(rows[0]) })
        : route.fulfill({ status: 406, contentType: "application/json", body: JSON.stringify({ code: "PGRST116", message: "no rows" }) });
    }
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "content-range": `0-${Math.max(0, rows.length - 1)}/${rows.length}` },
      body: JSON.stringify(rows),
    });
  });
}
const report = [];

async function exerciseScroll(page) {
  const metrics = await page.evaluate(() => new Promise((resolve) => {
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    const duration = 1400;
    let start = 0;
    let last = 0;
    let frames = 0;
    let slowFrames = 0;
    let worstFrameMs = 0;
    const step = (now) => {
      if (!start) { start = now; last = now; }
      const frameMs = now - last;
      if (frames > 0) {
        if (frameMs > 34) slowFrames += 1;
        worstFrameMs = Math.max(worstFrameMs, frameMs);
      }
      frames += 1;
      last = now;
      const progress = Math.min(1, (now - start) / duration);
      scrollTo(0, maxScroll * progress);
      if (progress < 1) requestAnimationFrame(step);
      else resolve({ frames, slowFrames, worstFrameMs: Math.round(worstFrameMs) });
    };
    requestAnimationFrame(step);
  }));
  await page.waitForTimeout(250);
  await page.evaluate(() => scrollTo(0, 0));
  return metrics;
}

for (const item of pages) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: "pt-BR" });
  await mockBackend(context);
  const page = await context.newPage();
  const runtimeErrors = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });
  const response = await page.goto(baseUrl + item.path, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle").catch(() => {});
  const scrollMetrics = await exerciseScroll(page);
  const contentLength = (await page.locator("body").innerText()).trim().length;
  const heading = await page.locator("h1").first().innerText().catch(() => "");
  const overlay = await page.locator("[data-nextjs-dialog], .vite-error-overlay, #webpack-dev-server-client-overlay").count();
  const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  const serious = axe.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
  await page.screenshot({ path: join(tmpdir(), `new-home-${item.name}.png`), fullPage: true });
  report.push({
    page: item.name,
    status: response?.status(),
    title: await page.title(),
    heading,
    contentLength,
    overlay,
    runtimeErrors: [...new Set(runtimeErrors)],
    scrollMetrics,
    seriousA11y: serious.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      nodes: violation.nodes.length,
      targets: violation.nodes.map((node) => node.target.join(" ")),
    })),
    allA11yCount: axe.violations.length,
  });
  await context.close();
}

const narrowContext = await browser.newContext({ viewport: { width: 320, height: 700 }, locale: "pt-BR" });
await mockBackend(narrowContext);
const narrow = await narrowContext.newPage();
for (const item of pages.filter((entry) => entry.name !== "not-found")) {
  await narrow.goto(baseUrl + item.path, { waitUntil: "networkidle" });
  await narrow.waitForTimeout(800);
  // body clips horizontal overflow, so scrollWidth hides it; count unclipped elements instead.
  const overflow = await narrow.evaluate(() => {
    const clipped = (el) => {
      for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
        if (/(hidden|auto|scroll|clip)/.test(getComputedStyle(a).overflowX)) return true;
      }
      return false;
    };
    return [...document.querySelectorAll("body *")].filter((el) => {
      const box = el.getBoundingClientRect();
      return box.width > 0 && box.right > innerWidth + 1 && getComputedStyle(el).position !== "fixed" && !clipped(el);
    }).map((el) => `${el.tagName}.${el.className}`);
  });
  const smallTargets = await narrow.evaluate(() => [...document.querySelectorAll("a, button")]
    .filter((el) => {
      const box = el.getBoundingClientRect();
      return box.width > 0 && box.height > 0 && (box.height < 24 || box.width < 24) && getComputedStyle(el).visibility !== "hidden";
    }).length);
  report.push({ page: `narrow-320-${item.name}`, horizontalOverflow: overflow.length, overflowTargets: overflow, smallTargets });
}
await narrowContext.close();

const interactionContext = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: "pt-BR" });
await mockBackend(interactionContext);
const mobile = await interactionContext.newPage();
const interactionErrors = [];
mobile.on("pageerror", (error) => interactionErrors.push(error.message));
await mobile.goto(baseUrl, { waitUntil: "networkidle" });
const mobileScrollMetrics = await exerciseScroll(mobile);
await mobile.getByRole("button", { name: /abrir menu/i }).click();
const mobileMenuVisible = await mobile.getByRole("dialog", { name: /menu/i }).isVisible();
await mobile.keyboard.press("Escape");
await mobile.getByRole("button", { name: /abrir chat/i }).click();
const chatVisible = await mobile.getByRole("dialog", { name: /assistente/i }).isVisible();
await mobile.keyboard.press("Escape");
await mobile.screenshot({ path: join(tmpdir(), "new-home-mobile.png"), fullPage: true });

await mobile.goto(baseUrl + "/imovel?code=AP0001-NHB", { waitUntil: "networkidle" });
const favorite = mobile.getByRole("button", { name: /salvar nos favoritos/i });
await favorite.click();
const favoriteSaved = await mobile.locator('.gal-action[aria-pressed="true"]').count() > 0;
await mobile.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
const stickyBarVisible = await mobile.evaluate(() => {
  const bar = document.querySelector(".sticky-contact");
  if (!bar) return false;
  const box = bar.getBoundingClientRect();
  return box.height > 0 && box.bottom <= innerHeight + 1 && box.top >= 0;
});
await mobile.evaluate(() => scrollTo(0, 0));
const visitButton = mobile.getByRole("button", { name: /^solicitar visita$/i });
const visitForm = mobile.locator("form.visit");
await visitForm.locator('input[name="name"]').fill("Cliente Teste");
await visitForm.locator('input[name="phone"]').fill("(21) 99999-9999");
await visitForm.locator('input[name="consent"]').check();
await mobile.evaluate(() => {
  window.__verifyOpenedUrl = "";
  window.open = (url) => { window.__verifyOpenedUrl = String(url); return null; };
});
await visitButton.click();
const visitOpenedWhatsapp = (await mobile.evaluate(() => window.__verifyOpenedUrl)).includes("wa.me");
const visitConfirmed = await mobile.locator(".visit-status.ok").waitFor({ timeout: 5000 }).then(() => true, () => false);

report.push({
  page: "interactions-mobile",
  mobileMenuVisible,
  chatVisible,
  favoriteSaved,
  visitOpenedWhatsapp,
  stickyBarVisible,
  visitConfirmed,
  scrollMetrics: mobileScrollMetrics,
  runtimeErrors: interactionErrors,
});

const checks = {};
checks.navContactNotActiveOnHome = await mobile.goto(baseUrl, { waitUntil: "networkidle" }).then(() =>
  mobile.locator(".nav-links a.active", { hasText: "Contato" }).count()).then((n) => n === 0);

await mobile.goto(baseUrl + "/anunciar.html", { waitUntil: "networkidle" });
checks.sellerSubmitStyled = await mobile.locator(".seller-submit").evaluate((el) => {
  const bg = getComputedStyle(el).backgroundColor;
  return bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent";
});

await mobile.goto(baseUrl + "/imovel?code=AP0001-NHB", { waitUntil: "networkidle" });
checks.galleryControlsDontOverlap = await mobile.evaluate(() => {
  const a = document.querySelector(".gal-all")?.getBoundingClientRect();
  const b = document.querySelector(".gal-actions")?.getBoundingClientRect();
  if (!b) return false;
  return !a || a.width === 0 || a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top;
});

await mobile.goto(baseUrl + "/imovel?code=AP0002-NHB", { waitUntil: "networkidle" });
checks.emptyGalleryIsCompact = await mobile.evaluate(() => {
  const gal = document.querySelector(".gal.gal-noimg");
  return !!gal && gal.getBoundingClientRect().height <= 220 && !!gal.querySelector(".gal-empty a[href*='wa.me']");
});

report.push({ page: "checks", ...checks });
await interactionContext.close();
await browser.close();
console.log(JSON.stringify(report, null, 2));

const failed = report.some((item) =>
  (item.status && item.status >= 400) ||
  item.contentLength === 0 ||
  item.overlay > 0 ||
  item.runtimeErrors?.length ||
  item.seriousA11y?.length ||
  item.mobileMenuVisible === false ||
  item.chatVisible === false ||
  item.favoriteSaved === false ||
  item.visitOpenedWhatsapp === false ||
  item.stickyBarVisible === false ||
  item.visitConfirmed === false ||
  item.horizontalOverflow > 0 ||
  (item.page === "checks" && Object.values(item).slice(1).includes(false))
);
if (failed) process.exitCode = 1;
