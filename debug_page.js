const puppeteer = require('puppeteer-core');

(async () => {
    console.log("Launching Chrome...");
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Listen to console
    page.on('console', msg => {
        console.log(`[BROWSER CONSOLE ${msg.type().toUpperCase()}]:`, msg.text());
    });

    // Listen to errors
    page.on('pageerror', err => {
        console.error('[BROWSER UNCAUGHT ERROR]:', err.message, err.stack);
    });

    // Listen to failed requests
    page.on('requestfailed', request => {
        console.error(`[REQUEST FAILED]: ${request.method()} ${request.url()} - ${request.failure() ? request.failure().errorText : 'unknown'}`);
    });

    page.on('response', response => {
        if (response.status() >= 400) {
            console.error(`[HTTP ${response.status()}]: ${response.request().method()} ${response.url()}`);
        }
    });

    console.log("Navigating to http://localhost:8000/ ...");
    try {
        await page.goto('http://localhost:8000/', { waitUntil: 'networkidle2', timeout: 15000 });
    } catch (e) {
        console.log("Navigation timeout or finished with:", e.message);
    }

    // Wait 3 seconds for Vue to finish mounting
    await new Promise(r => setTimeout(r, 3000));

    // Take screenshot
    await page.screenshot({ path: 'D:\\Antigravity\\velourcare-ortho-cloud\\debug_screenshot.png' });
    console.log("Screenshot saved to debug_screenshot.png");

    // Check title and app innerHTML
    const title = await page.title();
    console.log("Page Title:", title);

    const appHtml = await page.evaluate(() => {
        const app = document.getElementById('app');
        return app ? app.innerHTML.slice(0, 500) : 'NO APP ELEMENT';
    });
    console.log("App HTML snippet:", appHtml);

    await browser.close();
    console.log("Browser closed.");
})();
