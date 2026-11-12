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

    console.log("1. Visiting http://localhost:8000/ on a fresh clean browser session...");
    await page.goto('http://localhost:8000/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 4000));

    console.log("Current URL:", page.url());
    console.log("Current Title:", await page.title());

    // Check menu items
    const menuLinks = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('#navbar-nav a.nav-link'));
        return links.map(a => ({ text: a.innerText.trim().replace(/\n/g, ' '), href: a.getAttribute('href') }));
    });
    console.log("Sidebar Nav links count:", menuLinks.length);
    menuLinks.forEach(m => console.log(`   -> "${m.text}" (${m.href})`));

    // Test clicking Cases link
    console.log("2. Clicking Cases link...");
    await page.evaluate(() => {
        const a = Array.from(document.querySelectorAll('a')).find(el => el.getAttribute('href') === '/cases');
        if (a) a.click();
    });
    await new Promise(r => setTimeout(r, 4000));

    console.log("Cases URL:", page.url());
    console.log("Cases Title:", await page.title());
    const casesCount = await page.evaluate(() => document.querySelectorAll('table tbody tr').length);
    console.log("Cases table rows loaded:", casesCount);

    // Test clicking Invoices link
    console.log("3. Clicking Invoices link...");
    await page.evaluate(() => {
        const a = Array.from(document.querySelectorAll('a')).find(el => el.getAttribute('href') === '/invoices');
        if (a) a.click();
    });
    await new Promise(r => setTimeout(r, 4000));

    console.log("Invoices URL:", page.url());
    console.log("Invoices Title:", await page.title());
    const invoicesCount = await page.evaluate(() => document.querySelectorAll('table tbody tr').length);
    console.log("Invoices table rows loaded:", invoicesCount);

    // Test clicking Clients link
    console.log("4. Clicking Clients link...");
    await page.evaluate(() => {
        const a = Array.from(document.querySelectorAll('a')).find(el => el.getAttribute('href') === '/clients');
        if (a) a.click();
    });
    await new Promise(r => setTimeout(r, 4000));

    console.log("Clients URL:", page.url());
    console.log("Clients Title:", await page.title());
    const clientsCount = await page.evaluate(() => document.querySelectorAll('table tbody tr').length);
    console.log("Clients table rows loaded:", clientsCount);

    await page.screenshot({ path: 'D:\\Antigravity\\velourcare-ortho-cloud\\verified_live.png' });
    console.log("Saved verified_live.png screenshot.");

    await browser.close();
    console.log("Test finished successfully!");
})();
