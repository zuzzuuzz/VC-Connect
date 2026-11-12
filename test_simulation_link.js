const puppeteer = require('puppeteer-core');
const BASE_URL = 'http://localhost:8000';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testSimulationLink() {
    const browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: 'new',
        args: ['--no-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(`${BASE_URL}/cases/1/view`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));

    // Click Treatment Plans tab
    await page.evaluate(() => {
        const tabs = Array.from(document.querySelectorAll('.nav-tabs a, .nav-tabs button'));
        const tp = tabs.find(t => t.innerText.includes('Treatment Plans'));
        if (tp) tp.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    const tpLinks = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('.tab-content a, .tab-content button'));
        return links.map(l => ({
            text: l.innerText.trim(),
            href: l.getAttribute('href'),
            target: l.getAttribute('target'),
            classes: l.className
        }));
    });
    console.log('Treatment Plans tab links & buttons:');
    console.log(tpLinks);

    await browser.close();
}

testSimulationLink().catch(console.error);
