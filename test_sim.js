const puppeteer = require('puppeteer-core');
const BASE_URL = 'http://localhost:8000';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testSim() {
    const browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: 'new',
        args: ['--no-sandbox']
    });

    const page = await browser.newPage();
    const errors = [];
    const failed404s = [];

    page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('response', resp => {
        if (resp.status() >= 400) failed404s.push({ status: resp.status(), url: resp.url() });
    });

    console.log('Navigating to http://localhost:8000/simulation/velour-0001 ...');
    await page.goto(`${BASE_URL}/simulation/velour-0001`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));

    // Test slider or view change buttons in simulation
    const buttons = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.map(b => b.innerText.trim());
    });
    console.log('Simulation buttons:', buttons);

    // Click view buttons
    for (const bName of ['Frontal Bite', 'Upper Occlusal', 'Lower Occlusal']) {
        await page.evaluate((name) => {
            const b = Array.from(document.querySelectorAll('button')).find(x => x.innerText.trim() === name);
            if (b) b.click();
        }, bName);
        await new Promise(r => setTimeout(r, 500));
    }

    console.log('Simulation Console Errors:', errors);
    console.log('Simulation Failed 404s:', failed404s);

    await browser.close();
}

testSim().catch(console.error);
