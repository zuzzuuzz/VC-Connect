const puppeteer = require('puppeteer-core');

(async () => {
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    page.on('console', msg => console.log(`[BROWSER ${msg.type().toUpperCase()}]:`, msg.text()));
    page.on('pageerror', err => console.error('[UNCAUGHT ERROR]:', err.message));
    page.on('response', res => {
        if (res.url().includes('/api/') || res.url().includes('sanctum') || res.status() >= 400) {
            console.log(`[HTTP ${res.status()}]: ${res.request().method()} ${res.url()}`);
        }
    });

    console.log("Loading login page...");
    await page.goto('http://localhost:8000/login', { waitUntil: 'networkidle2' });

    // Let's type username and password
    console.log("Typing credentials...");
    await page.type('#username', 'admin');
    await page.type('#password-input', 'password');

    // Click Sign In button
    console.log("Clicking Sign In...");
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) {
        await submitBtn.click();
    } else {
        console.log("Submit button not found!");
    }

    // Wait 5 seconds
    await new Promise(r => setTimeout(r, 5000));

    console.log("Current URL after click:", page.url());
    console.log("Current Title after click:", await page.title());

    await page.screenshot({ path: 'D:\\Antigravity\\velourcare-ortho-cloud\\after_login_screenshot.png' });
    console.log("Saved after_login_screenshot.png");

    await browser.close();
})();
