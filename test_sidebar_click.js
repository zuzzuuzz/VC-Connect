const puppeteer = require('puppeteer-core');

(async () => {
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    page.on('console', msg => console.log(`[BROWSER ${msg.type().toUpperCase()}]:`, msg.text()));
    page.on('pageerror', err => console.error('[UNCAUGHT ERROR]:', err.message, err.stack));

    // 1. Login
    console.log("1. Visiting login...");
    await page.goto('http://localhost:8000/login', { waitUntil: 'networkidle2' });
    await page.type('#username', 'admin');
    await page.type('#password-input', 'password');
    await page.click('button[type="submit"]');

    // Wait for dashboard navigation
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log("2. After login URL:", page.url());

    // 2. Instead of page.goto (which does a hard reload and might reinitialize vue-router before localStorage is read),
    // let's click the "Cases" link in the sidebar or use client-side router navigation:
    console.log("3. Looking for Cases link in sidebar...");
    const casesLink = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        const caseA = links.find(a => a.href && a.href.includes('/cases'));
        if (caseA) {
            caseA.click();
            return caseA.href;
        }
        return null;
    });
    console.log("Clicked sidebar link:", casesLink);

    await new Promise(r => setTimeout(r, 4000));
    console.log("4. URL after click:", page.url());
    console.log("5. Title:", await page.title());

    const tableInfo = await page.evaluate(() => {
        const rows = document.querySelectorAll('table tbody tr');
        return {
            tableFound: !!document.querySelector('table'),
            rowCount: rows.length,
            firstRow: rows[0] ? rows[0].innerText.replace(/\s+/g, ' ') : null
        };
    });
    console.log("Table info:", tableInfo);

    await page.screenshot({ path: 'D:\\Antigravity\\velourcare-ortho-cloud\\cases_clicked_screenshot.png' });
    console.log("Screenshot saved.");

    await browser.close();
})();
