const puppeteer = require('puppeteer-core');
const BASE_URL = 'http://localhost:8000';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testManufacturing() {
    const browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: 'new',
        args: ['--no-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(`${BASE_URL}/cases/1/view`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));

    // Click Manufacturing tab
    await page.evaluate(() => {
        const tabs = Array.from(document.querySelectorAll('.nav-tabs a, .nav-tabs button'));
        const m = tabs.find(t => t.innerText.includes('Manufacturing'));
        if (m) m.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    const content = await page.evaluate(() => {
        const text = document.querySelector('.tab-content')?.innerText;
        const buttons = Array.from(document.querySelectorAll('.tab-content button')).map(b => b.innerText.trim());
        return {
            buttons,
            textSnippet: text?.slice(0, 500)
        };
    });
    console.log('Manufacturing tab content:', content);

    await browser.close();
}

testManufacturing().catch(console.error);
