import { chromium } from "playwright-core";
import { access, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
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

const SIZE = 1200;
const browser = await chromium.launch({ ...(executablePath ? { executablePath } : {}), headless: true });
const page = await browser.newPage({ viewport: { width: SIZE, height: SIZE } });
await page.setContent('<body style="margin:0"><canvas id="c" style="width:100vw;height:100vh;display:block"></canvas></body>');
await page.addScriptTag({ path: `${root}v1/dist/vendor-three.js` });
const dataUrl = await page.evaluate((size) => {
  const tower = window.NHTower.createTower(document.getElementById("c"), { assembled: true, preserve: true, pixelRatio: 1 });
  tower.resize(size, size, 1);
  tower.state.shift = 0;
  tower.state.p = 0.18;
  tower.render();
  return document.getElementById("c").toDataURL("image/webp", 0.88);
}, SIZE);
await browser.close();

const out = `${root}v1/assets/tower-still.webp`;
await writeFile(out, Buffer.from(dataUrl.split(",")[1], "base64"));
console.log(`Wrote ${out}`);
