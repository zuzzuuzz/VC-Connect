const puppeteer = require('puppeteer-core');
const fs = require('fs');

async function testPage() {
    console.log('Launching Chrome...');
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    const logs = [];
    page.on('console', msg => {
        logs.push(`[CONSOLE ${msg.type().toUpperCase()}] ${msg.text()}`);
        console.log(`[CONSOLE ${msg.type().toUpperCase()}] ${msg.text()}`);
    });

    page.on('pageerror', err => {
        logs.push(`[PAGE ERROR] ${err.toString()}`);
        console.error(`[PAGE ERROR]`, err);
    });

    page.on('requestfailed', req => {
        logs.push(`[FAILED REQUEST] ${req.url()} - ${req.failure().errorText}`);
        console.warn(`[FAILED REQUEST] ${req.url()} - ${req.failure().errorText}`);
    });

    console.log('Navigating to http://localhost:8000 ...');
    try {
        await page.goto('http://localhost:8000', { waitUntil: 'networkidle2', timeout: 15000 });
    } catch (e) {
        console.log('Navigation wait error (continuing):', e.message);
    }

    // Wait a couple seconds for Vue to mount
    await new Promise(r => setTimeout(r, 3000));

    const title = await page.title();
    const url = page.url();
    const appHtml = await page.evaluate(() => {
        const el = document.getElementById('app');
        return el ? el.innerHTML.slice(0, 500) : 'NO #app FOUND';
    });

    console.log('--- TEST RESULT ---');
    console.log('Page Title:', title);
    console.log('Current URL:', url);
    console.log('App HTML preview:', appHtml);

    await page.screenshot({ path: 'D:\\Antigravity\\velourcare-ortho-cloud\\test_render.png' });
    console.log('Screenshot saved to D:\\Antigravity\\velourcare-ortho-cloud\\test_render.png');

    await browser.close();
}

testPage().catch(err => {
    console.error('Test crashed:', err);
    process.exit(1);
});
