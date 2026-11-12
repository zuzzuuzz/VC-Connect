const puppeteer = require('puppeteer-core');
const BASE_URL = 'http://localhost:8000';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function dumpCards() {
    const browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
    });

    const page = await browser.newPage();
    await page.goto(`${BASE_URL}/cases/1/view`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));

    const htmls = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.card'));
        return cards.slice(0, 6).map((c, i) => ({
            index: i,
            text: c.innerText.slice(0, 100),
            buttons: Array.from(c.querySelectorAll('button')).map(b => ({
                text: b.innerText,
                classes: b.className,
                onclick: b.onclick ? b.onclick.toString() : null,
                attributes: Array.from(b.attributes).map(a => `${a.name}="${a.value}"`)
            }))
        }));
    });

    console.log(JSON.stringify(htmls, null, 2));
    await browser.close();
}

dumpCards().catch(console.error);
