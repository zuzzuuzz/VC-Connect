const puppeteer = require('puppeteer-core');

async function testSpaNavigation() {
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    const requests = [];
    page.on('request', req => {
        requests.push({ url: req.url(), method: req.method(), resourceType: req.resourceType() });
    });

    page.on('console', msg => {
        console.log(`[CONSOLE] ${msg.type()}: ${msg.text()}`);
    });

    console.log('1. Loading /dashboard ...');
    await page.goto('http://localhost:8000/dashboard', { waitUntil: 'networkidle2' });

    // Look for sidebar links
    const links = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('a[href]'));
        return anchors.map(a => ({ text: a.innerText.trim(), href: a.getAttribute('href') })).filter(a => a.href && !a.href.startsWith('javascript'));
    });
    console.log('Sidebar / Page links found:', JSON.stringify(links, null, 2));

    // Try navigating to /cases via vue router or link click
    console.log('2. Clicking /cases link or pushing route...');
    await page.evaluate(() => {
        const caseLink = Array.from(document.querySelectorAll('a')).find(a => a.getAttribute('href') === '/cases');
        if (caseLink) {
            caseLink.click();
        } else {
            console.log('Direct click failed, using window.history.pushState or location');
        }
    });

    await new Promise(r => setTimeout(r, 3000));
    console.log('Current URL after navigation:', page.url());

    // Print all requests made since navigation
    console.log('All API / XHR / Fetch requests:');
    requests.filter(r => r.resourceType === 'xhr' || r.resourceType === 'fetch').forEach(r => {
        console.log(`  ${r.method} ${r.url}`);
    });

    await page.screenshot({ path: 'D:\\Antigravity\\velourcare-ortho-cloud\\test_after_click_cases.png' });
    console.log('Screenshot saved to D:\\Antigravity\\velourcare-ortho-cloud\\test_after_click_cases.png');

    await browser.close();
}

testSpaNavigation().catch(err => {
    console.error('Test crashed:', err);
    process.exit(1);
});
