const puppeteer = require('puppeteer-core');

(async () => {
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1200 });

    const failedRequests = [];
    const consoleErrors = [];

    page.on('response', res => {
        if (res.status() >= 400) {
            failedRequests.push({ status: res.status(), url: res.url() });
        }
    });

    page.on('console', msg => {
        if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
        }
    });

    await page.goto('http://localhost:8000/cases/1/treatment-plans/1/document', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));

    const tabNames = ['PDF Config', 'Edit Teeth Chart', 'Treatment Overview', 'Movement Chart', 'Smile Summary', 'IPR Summary'];
    for (const name of tabNames) {
        await page.evaluate((tName) => {
            const btn = Array.from(document.querySelectorAll('.nav-link, button[role="tab"]')).find(b => b.innerText.trim().includes(tName));
            if (btn) btn.click();
        }, name);
        await new Promise(r => setTimeout(r, 800));
    }

    console.log('Failed Requests:', failedRequests);
    console.log('Console Errors:', consoleErrors);

    await browser.close();
})();
