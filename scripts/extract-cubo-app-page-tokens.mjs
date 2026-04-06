/**
 * Cubo US /pages/app — 스타일 토큰 + 스크린샷 (Playwright)
 */
import { chromium } from "playwright";

const targetUrl = "https://us.getcubo.com/pages/app";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 90000 });

const tokens = await page.evaluate(() => {
  const pick = (selector) => {
    const el = document.querySelector(selector);
    if (!el) return null;
    const cs = getComputedStyle(el);
    return {
      color: cs.color,
      backgroundColor: cs.backgroundColor,
      fontFamily: cs.fontFamily,
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
    };
  };
  const h1 = document.querySelector("h1");
  const h1Style = h1 ? getComputedStyle(h1) : null;
  const vars = {};
  const root = getComputedStyle(document.documentElement);
  for (let i = 0; i < root.length; i++) {
    const n = root[i];
    if (n.startsWith("--")) vars[n] = root.getPropertyValue(n).trim();
  }
  return {
    url: location.href,
    h1: h1Style
      ? {
          color: h1Style.color,
          fontFamily: h1Style.fontFamily,
          fontSize: h1Style.fontSize,
          fontWeight: h1Style.fontWeight,
        }
      : null,
    body: pick("body"),
    cssVariablesSample: Object.keys(vars).length ? vars : null,
  };
});

await page.screenshot({
  path: "design/cubo-us-app-page-reference.png",
  fullPage: true,
});
await browser.close();

console.log(JSON.stringify(tokens, null, 2));
