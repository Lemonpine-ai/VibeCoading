/**
 * 랜딩 페이지 구조 추출 — Barkio / Petcube Care 비교 리포트용
 */
import { chromium } from "playwright";

async function extractPageStructure(pageUrl) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(pageUrl, { waitUntil: "networkidle", timeout: 120000 });

  const data = await page.evaluate(() => {
    const headingSelectors = ["h1", "h2", "h3", "h4"];
    const headings = [];
    document.querySelectorAll(headingSelectors.join(",")).forEach((el) => {
      const t = el.textContent?.replace(/\s+/g, " ").trim();
      if (t && t.length < 500) {
        headings.push({ tag: el.tagName.toLowerCase(), text: t });
      }
    });

    const main = document.querySelector("main");
    const sections = [];
    document.querySelectorAll("main section, section, [role='region']").forEach((sec, i) => {
      const h = sec.querySelector("h1, h2, h3");
      const title = h?.textContent?.replace(/\s+/g, " ").trim() || `(section ${i + 1})`;
      const id = sec.id || sec.getAttribute("aria-label") || "";
      sections.push({ id, title: title.slice(0, 120) });
    });

    const navLinks = [];
    document.querySelectorAll("header nav a, nav[aria-label] a, .header a").forEach((a) => {
      const t = a.textContent?.replace(/\s+/g, " ").trim();
      if (t && t.length < 80) navLinks.push(t);
    });

    const metaDesc =
      document.querySelector('meta[name="description"]')?.getAttribute("content") || "";

    return {
      title: document.title,
      metaDescription: metaDesc.slice(0, 400),
      headings: headings.slice(0, 80),
      sectionCount: sections.length,
      sectionsSample: sections.slice(0, 25),
      navLinksSample: [...new Set(navLinks)].slice(0, 40),
    };
  });

  await browser.close();
  return { url: pageUrl, ...data };
}

const urls = [
  "https://barkio.com/en",
  "https://petcube.com/care/",
];

const results = [];
for (const u of urls) {
  results.push(await extractPageStructure(u));
}

console.log(JSON.stringify(results, null, 2));
