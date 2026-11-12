const puppeteer = require('puppeteer-core');
const BASE_URL = 'http://localhost:8000';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testCard0() {
    const browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(`${BASE_URL}/cases/1/view`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));

    for (let i = 0; i < 3; i++) {
        console.log(`\nClicking Card 0, Button ${i}...`);
        await page.evaluate((idx) => {
            const card = document.querySelectorAll('.card')[0];
            const btn = card.querySelectorAll('button')[idx];
            if (btn) btn.click();
        }, i);
        await new Promise(r => setTimeout(r, 800));

        const res = await page.evaluate(() => {
            const m = document.querySelector('.modal.show, .modal[style*="display: block"]');
            return {
                open: !!m,
                title: m?.querySelector('.modal-title')?.innerText || 'No title'
            };
        });
        console.log(`Card 0, Button ${i} result:`, res);

        if (res.open) {
            await page.evaluate(() => {
                const c = document.querySelector('.modal.show .btn-close, .modal.show [data-bs-dismiss="modal"]');
                if (c) c.click();
            });
            await new Promise(r => setTimeout(r, 500));
        }
    }

    await browser.close();
}

testCard0().catch(console.error);
