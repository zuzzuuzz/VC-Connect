const puppeteer = require('puppeteer-core');

async function testCaseDetail() {
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    page.on('console', msg => {
        if (msg.type() === 'error') console.log(`[BROWSER ERROR] ${msg.text()}`);
    });

    console.log('Navigating to http://localhost:8000/cases/1/view ...');
    await page.goto('http://localhost:8000/cases/1/view', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2500));

    await page.screenshot({ path: 'D:\\Antigravity\\velourcare-ortho-cloud\\test_case_detail_verified.png' });
    console.log('Screenshot saved to D:\\Antigravity\\velourcare-ortho-cloud\\test_case_detail_verified.png');

    const heading = await page.evaluate(() => {
        const h = document.querySelector('h4') || document.querySelector('h3') || document.querySelector('.page-title-box');
        return h ? h.innerText : 'NO HEADING';
    });
    console.log('Page Heading:', heading);

    await browser.close();
}

testCaseDetail().catch(console.error);
