const puppeteer = require('puppeteer-core');

async function findDoc404() {
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    const failed = [];
    page.on('response', resp => {
        if (resp.status() >= 400) failed.push(resp.status() + ' ' + resp.url());
    });

    await page.goto('http://localhost:8000/cases/1/treatment-plans/1/document', { waitUntil: 'networkidle2' });
    console.log('Failed requests on /document:');
    failed.forEach(f => console.log('  ', f));

    await browser.close();
}

findDoc404().catch(console.error);
