import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CHROME_PATHS = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
];

const executablePath = CHROME_PATHS.find((p) => fs.existsSync(p));
const BASE_URL = "http://localhost:5173";

async function testOrderNowButton() {
  const browser = await puppeteer.launch({
    executablePath,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  let dialogTriggered = false;
  let dialogMessage = "";
  page.on("dialog", async (dialog) => {
    dialogTriggered = true;
    dialogMessage = dialog.message();
    console.log(`[WARNING] Dialog appeared: ${dialogMessage}`);
    await dialog.dismiss();
  });

  console.log("Navigating to http://localhost:5173/home...");
  await page.goto(`${BASE_URL}/home`, { waitUntil: "networkidle2" });

  const orderBtn = await page.$("#meal-plan-order-now-btn");
  if (!orderBtn) {
    throw new Error("Could not find #meal-plan-order-now-btn on the page!");
  }

  console.log("Found Order Now button. Clicking...");
  await orderBtn.click();

  await new Promise((r) => setTimeout(r, 1000));

  const currentUrl = page.url();
  console.log(`Current URL after clicking Order Now: ${currentUrl}`);

  if (dialogTriggered) {
    throw new Error(`Test failed: Browser dialog triggered with message "${dialogMessage}"`);
  }

  if (!currentUrl.includes("/meals")) {
    throw new Error(`Test failed: Expected URL to include /meals, but got ${currentUrl}`);
  }

  console.log("SUCCESS: Button navigated directly to /meals without any alert popups!");

  const screenshotPath = path.join(__dirname, "screenshots", "order-now-navigated.png");
  await page.screenshot({ path: screenshotPath });
  console.log(`Screenshot saved to: ${screenshotPath}`);

  await browser.close();
}

testOrderNowButton().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
