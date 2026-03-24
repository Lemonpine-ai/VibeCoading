/**
 * Cubo US 홈페이지에서 대표 스타일 토큰 추출 (Playwright)
 */
import { chromium } from "playwright";

const targetUrl = "https://us.getcubo.com/";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 60000 });

const tokens = await page.evaluate(() => {
  const pick = (selector) => {
    const el = document.querySelector(selector);
    if (!el) return null;
    const cs = getComputedStyle(el);
    return {
      selector,
      color: cs.color,
      backgroundColor: cs.backgroundColor,
      fontFamily: cs.fontFamily,
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      letterSpacing: cs.letterSpacing,
      lineHeight: cs.lineHeight,
    };
  };

  const body = pick("body");
  const h1 = document.querySelector("h1");
  const h1Style = h1 ? getComputedStyle(h1) : null;
  const nav = document.querySelector("header nav, .header__menu, [class*='header'] a") || document.querySelector("header a");
  const navStyle = nav ? getComputedStyle(nav) : null;
  const btn = document.querySelector("a.button, button[type='submit'], .btn, [class*='Button']");
  const btnStyle = btn ? getComputedStyle(btn) : null;

  const rootStyle = getComputedStyle(document.documentElement);
  const cssVars = {};
  for (let i = 0; i < rootStyle.length; i++) {
    const name = rootStyle[i];
    if (name.startsWith("--")) {
      cssVars[name] = rootStyle.getPropertyValue(name).trim();
    }
  }

  return {
    url: location.href,
    body,
    h1: h1Style
      ? {
          color: h1Style.color,
          fontFamily: h1Style.fontFamily,
          fontSize: h1Style.fontSize,
          fontWeight: h1Style.fontWeight,
          letterSpacing: h1Style.letterSpacing,
          lineHeight: h1Style.lineHeight,
        }
      : null,
    navLink: navStyle
      ? {
          color: navStyle.color,
          fontFamily: navStyle.fontFamily,
          fontSize: navStyle.fontSize,
        }
      : null,
    buttonLike: btnStyle
      ? {
          color: btnStyle.color,
          backgroundColor: btnStyle.backgroundColor,
          borderRadius: btnStyle.borderRadius,
          fontFamily: btnStyle.fontFamily,
          fontSize: btnStyle.fontSize,
          padding: `${btnStyle.paddingTop} ${btnStyle.paddingRight}`,
        }
      : null,
    sampleCssVariables: Object.keys(cssVars).length ? cssVars : null,
  };
});

await page.screenshot({ path: "design/cubo-us-home-reference.png", fullPage: true });
await browser.close();

console.log(JSON.stringify(tokens, null, 2));
