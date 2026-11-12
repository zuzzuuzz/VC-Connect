const puppeteer = require('puppeteer-core');
const BASE_URL = 'http://localhost:8000';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testCase3() {
    const browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: 'new',
        args: ['--no-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(`${BASE_URL}/cases/3/view`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));

    // Click Manufacturing tab
    await page.evaluate(() => {
        const tabs = Array.from(document.querySelectorAll('.nav-tabs a, .nav-tabs button'));
        const m = tabs.find(t => t.innerText.includes('Manufacturing'));
        if (m) m.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    const content = await page.evaluate(() => {
        const pane = document.querySelector('.tab-pane.active, [role="tabpanel"].active');
        return {
            paneText: pane ? pane.innerText.slice(0, 400) : 'No active pane',
            buttons: Array.from(pane ? pane.querySelectorAll('button') : []).map(b => b.innerText.trim())
        };
    });
    console.log('Case 3 Manufacturing Tab Content:', content);

    await browser.close();
}

testCase3().catch(console.error);
