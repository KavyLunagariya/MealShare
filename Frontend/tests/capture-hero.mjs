import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: "new"
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto("http://localhost:5173/home", { waitUntil: "networkidle2" });
const card = await page.$(".rescued-card");
if (card) {
  await page.screenshot({ path: "tests/screenshots/hero-rescued-card.png" });
}
await browser.close();
console.log("Captured hero rescued card screenshot.");
