import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOT_DIR = path.join(__dirname, "screenshots");

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Find local Chrome or Edge
const CHROME_PATHS = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
];

const executablePath = CHROME_PATHS.find((p) => fs.existsSync(p));

if (!executablePath) {
  console.error("No local Chrome or Edge browser found on this system.");
  process.exit(1);
}

const BASE_URL = "http://localhost:5173";

const DEVICES = [
  { name: "Desktop", width: 1440, height: 900, isMobile: false },
  { name: "Tablet", width: 768, height: 1024, isMobile: true },
  { name: "Mobile", width: 390, height: 844, isMobile: true },
];

const PAGES = [
  { name: "Home Page", path: "/home", auth: null },
  { name: "Meals Page", path: "/meals", auth: null },
  { name: "About Page", path: "/about", auth: null },
  { name: "Login Page", path: "/login", auth: null },
  { name: "Signup Page", path: "/signup", auth: null },
  {
    name: "Restaurant Dashboard",
    path: "/food-lister-dashboard",
    auth: { role: "food-lister", name: "Spice Garden Restaurant" },
  },
  {
    name: "Normal Dashboard",
    path: "/reserver-dashboard",
    auth: { role: "reserver", name: "Rahul Sharma" },
  },
];

async function runTestSuite() {
  console.log("====================================================");
  console.log("🚀 STARTING AUTOMATED FULL WEBSITE & DEVICE TEST SUITE");
  console.log(`Browser: ${executablePath}`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Devices: Desktop (1440px), Tablet (768px), Mobile (390px)`);
  console.log(`Pages: Home, Meals, About, Login, Signup, Food Lister Dashboard, Reserver Dashboard`);
  console.log("====================================================\n");

  const browser = await puppeteer.launch({
    executablePath,
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--window-size=1440,900",
    ],
  });

  const results = [];
  let totalTests = 0;
  let passedTests = 0;

  for (const device of DEVICES) {
    console.log(`\n----------------------------------------------------`);
    console.log(`📱 TESTING DEVICE: ${device.name.toUpperCase()} (${device.width}x${device.height})`);
    console.log(`----------------------------------------------------`);

    const page = await browser.newPage();
    await page.setViewport({
      width: device.width,
      height: device.height,
      isMobile: device.isMobile,
      hasTouch: device.isMobile,
    });

    const pageErrors = [];
    page.on("pageerror", (err) => {
      pageErrors.push(err.message);
    });

    for (const testPage of PAGES) {
      totalTests++;
      const startTime = Date.now();
      const testResult = {
        device: device.name,
        page: testPage.name,
        path: testPage.path,
        loadStatus: "FAIL",
        noHorizontalOverflow: false,
        stickyNavbar: false,
        mobileToggle: "N/A",
        errors: [],
        durationMs: 0,
        screenshot: "",
      };

      try {
        // Set auth state if needed
        await page.goto(`${BASE_URL}/home`, { waitUntil: "domcontentloaded" });
        if (testPage.auth) {
          await page.evaluate((authData) => {
            localStorage.setItem("mealshare_token", "test_jwt_token_12345");
            localStorage.setItem(
              "mealshare_auth",
              JSON.stringify({
                user: {
                  id: "test_user_id_123",
                  name: authData.name,
                  email: "test@mealshare.org",
                  role: authData.role,
                },
              })
            );
          }, testPage.auth);
        } else {
          await page.evaluate(() => {
            localStorage.removeItem("mealshare_token");
            localStorage.removeItem("mealshare_auth");
          });
        }

        // Navigate to the target page
        await page.goto(`${BASE_URL}${testPage.path}`, {
          waitUntil: "networkidle2",
          timeout: 15000,
        });

        testResult.loadStatus = "PASS";

        // Check horizontal overflow (crucial for mobile/tablet responsiveness)
        const overflow = await page.evaluate(() => {
          const docWidth = document.documentElement.scrollWidth;
          const winWidth = window.innerWidth;
          return {
            scrollWidth: docWidth,
            innerWidth: winWidth,
            hasOverflow: docWidth > winWidth + 3, // 3px tolerance for subpixel scrollbars
          };
        });
        testResult.noHorizontalOverflow = !overflow.hasOverflow;

        // Check Navbar and sticky behavior
        const navbarCheck = await page.evaluate(async () => {
          const nav = document.querySelector(".navbar");
          if (!nav) return { exists: false, stickyOnScroll: false };

          const rectBefore = nav.getBoundingClientRect();
          window.scrollTo(0, 400);
          await new Promise((r) => setTimeout(r, 100));
          const rectAfter = nav.getBoundingClientRect();
          window.scrollTo(0, 0);

          return {
            exists: true,
            topInitial: rectBefore.top,
            topScrolled: rectAfter.top,
            stickyOnScroll: Math.abs(rectAfter.top) <= 2,
          };
        });
        testResult.stickyNavbar = navbarCheck.exists && navbarCheck.stickyOnScroll;

        // Test mobile hamburger toggle on mobile devices
        if (device.name === "Mobile") {
          const mobileToggleResult = await page.evaluate(async () => {
            const toggle = document.querySelector(".navbar-mobile-toggle");
            if (!toggle) return "Toggle button not found";

            const isVisible = window.getComputedStyle(toggle).display !== "none";
            if (!isVisible) return "Toggle hidden";

            // Click toggle to open drawer
            toggle.click();
            await new Promise((r) => setTimeout(r, 200));

            const drawer = document.querySelector(".navbar-mobile-drawer");
            const drawerOpen =
              drawer && window.getComputedStyle(drawer).display !== "none";

            // Click toggle again to close drawer
            toggle.click();
            await new Promise((r) => setTimeout(r, 200));
            const drawerClosed = !document.querySelector(".navbar-mobile-drawer");

            return drawerOpen && drawerClosed ? "PASS" : "FAIL";
          });
          testResult.mobileToggle = mobileToggleResult;
        }

        // Capture Screenshot
        const safeName = `${device.name}_${testPage.name.replace(/\s+/g, "_")}.png`;
        const screenshotPath = path.join(SCREENSHOT_DIR, safeName);
        await page.screenshot({ path: screenshotPath, fullPage: false });
        testResult.screenshot = safeName;

        testResult.durationMs = Date.now() - startTime;
        testResult.errors = [...pageErrors];
        pageErrors.length = 0;

        const isSuccess =
          testResult.loadStatus === "PASS" &&
          testResult.noHorizontalOverflow &&
          testResult.stickyNavbar &&
          (device.name !== "Mobile" || testResult.mobileToggle === "PASS");

        if (isSuccess) passedTests++;

        const icon = isSuccess ? "✅ PASS" : "❌ FAIL";
        console.log(
          `  ${icon} | ${testPage.name.padEnd(23)} | Overflow: ${
            testResult.noHorizontalOverflow ? "No (Good)" : "YES (Bad)"
          } | Sticky Nav: ${testResult.stickyNavbar ? "YES" : "NO"} | Time: ${testResult.durationMs}ms`
        );
      } catch (err) {
        testResult.errors.push(err.message);
        testResult.durationMs = Date.now() - startTime;
        console.log(`  ❌ FAIL | ${testPage.name.padEnd(23)} | Error: ${err.message}`);
      }

      results.push(testResult);
    }

    await page.close();
  }

  await browser.close();

  // Summary Report
  console.log("\n====================================================");
  console.log("📊 TEST EXECUTION SUMMARY REPORT");
  console.log("====================================================");
  console.log(`Total Page/Device Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  console.log(`Screenshots saved to: Frontend/tests/screenshots/`);
  console.log("====================================================\n");

  // Write JSON result summary
  fs.writeFileSync(
    path.join(__dirname, "test-results.json"),
    JSON.stringify(results, null, 2)
  );

  return results;
}

runTestSuite().catch((err) => {
  console.error("Test runner failed:", err);
  process.exit(1);
});
