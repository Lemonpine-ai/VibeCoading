/**
 * barkio.com/en — 토큰 + 히어로/모바일 섹션 스크린샷 (Playwright)
 */
import { chromium } from "playwright";

const targetUrl = "https://barkio.com/en";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, "height": 844 } });
await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 90000 });

const tokens = await page.evaluate(() => {
  const h1 = document.querySelector("h1");
  const h1Style = h1 ? getComputedStyle(h1) : null;
  const body = document.body ? getComputedStyle(document.body) : null;
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
    body: body
      ? {
          color: body.color,
          backgroundColor: body.backgroundColor,
          fontFamily: body.fontFamily,
        }
      : null,
  };
});

await page.screenshot({ path: "design/barkio-en-mobile-full.png", fullPage: true });
await browser.close();

console.log(JSON.stringify(tokens, null, 2));
