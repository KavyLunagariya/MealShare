import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: "new"
});
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, isMobile: true });
await page.goto("http://localhost:5173/home", { waitUntil: "networkidle2" });
const footer = await page.$(".footer-wordmark");
if (footer) {
  await footer.scrollIntoView();
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: "tests/screenshots/mobile-footer-current.png" });
}
await browser.close();
console.log("Captured mobile footer screenshot.");
