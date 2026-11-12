const puppeteer = require('puppeteer-core');

(async () => {
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    page.on('console', msg => console.log(`[DASH CONSOLE ${msg.type().toUpperCase()}]:`, msg.text()));
    page.on('pageerror', err => console.error('[DASH UNCAUGHT ERROR]:', err.message, err.stack));
    page.on('response', res => {
        if (res.status() >= 400) {
            console.error(`[DASH HTTP ${res.status()}]: ${res.request().method()} ${res.url()}`);
        }
    });

    // Login directly
    console.log("Navigating to login...");
    await page.goto('http://localhost:8000/login', { waitUntil: 'networkidle2' });

    await page.type('#username', 'admin');
    await page.type('#password-input', 'password');

    console.log("Submitting login form...");
    await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(e => console.log("Nav wait:", e.message)),
        page.click('button[type="submit"]')
    ]);

    await new Promise(r => setTimeout(r, 4000));

    console.log("URL:", page.url());
    console.log("Title:", await page.title());

    // Check if sidebar / navbar / cards exist
    const pageStructure = await page.evaluate(() => {
        return {
            sidebarExists: !!document.querySelector('.app-menu, .navbar-menu, [data-sidebar]'),
            headerExists: !!document.querySelector('header, .topbar, #page-topbar'),
            cardsCount: document.querySelectorAll('.card').length,
            mainText: document.body.innerText.slice(0, 1000)
        };
    });

    console.log("Page structure on dashboard:", JSON.stringify(pageStructure, null, 2));

    await page.screenshot({ path: 'D:\\Antigravity\\velourcare-ortho-cloud\\dashboard_live.png' });
    console.log("Saved dashboard_live.png");

    await browser.close();
})();
