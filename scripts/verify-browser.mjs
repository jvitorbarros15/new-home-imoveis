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
  { name: "finance", path: "/financiamento.html" },
  { name: "property", path: "/imovel.html?code=AP9680-NHB" },
  { name: "admin", path: "/admin.html" },
  { name: "not-found", path: "/404.html" },
];
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

const interactionContext = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: "pt-BR" });
const mobile = await interactionContext.newPage();
const interactionErrors = [];
mobile.on("pageerror", (error) => interactionErrors.push(error.message));
await mobile.goto(baseUrl, { waitUntil: "networkidle" });
const mobileScrollMetrics = await exerciseScroll(mobile);
await mobile.getByRole("button", { name: /abrir menu/i }).click();
const mobileMenuVisible = await mobile.getByRole("dialog", { name: /menu/i }).isVisible();
await mobile.keyboard.press("Escape");
await mobile.getByRole("button", { name: /abrir chat/i }).click();
const chatVisible = await mobile.getByRole("dialog", { name: /atendimento/i }).isVisible();
await mobile.keyboard.press("Escape");
await mobile.screenshot({ path: join(tmpdir(), "new-home-mobile.png"), fullPage: true });

await mobile.goto(baseUrl + "/imovel.html?code=AP9680-NHB", { waitUntil: "networkidle" });
const favorite = mobile.getByRole("button", { name: /salvar nos favoritos/i });
await favorite.click();
const favoriteSaved = await mobile.locator('.gal-action[aria-pressed="true"]').count() > 0;
const visitButton = mobile.getByRole("button", { name: /solicitar pelo whatsapp/i });
await mobile.evaluate(() => {
  window.__verifyOpenedUrl = "";
  window.open = (url) => { window.__verifyOpenedUrl = String(url); return null; };
});
await visitButton.click();
const visitOpenedWhatsapp = (await mobile.evaluate(() => window.__verifyOpenedUrl)).includes("wa.me");

report.push({
  page: "interactions-mobile",
  mobileMenuVisible,
  chatVisible,
  favoriteSaved,
  visitOpenedWhatsapp,
  scrollMetrics: mobileScrollMetrics,
  runtimeErrors: interactionErrors,
});

await interactionContext.close();
await browser.close();
console.log(JSON.stringify(report, null, 2));

const failed = report.some((item) =>
  (item.status && item.status >= 400) ||
  item.contentLength === 0 ||
  item.overlay > 0 ||
  item.runtimeErrors?.length ||
  item.seriousA11y?.length
);
if (failed) process.exitCode = 1;
