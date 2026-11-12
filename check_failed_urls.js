const puppeteer = require('puppeteer-core');

async function checkFailedUrls() {
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    const failed = [];
    page.on('response', resp => {
        if (resp.status() >= 400) {
            failed.push({ status: resp.status(), url: resp.url() });
        }
    });

    await page.goto('http://localhost:8000/cases/1/view', { waitUntil: 'networkidle2' });
    console.log('Failed URLs in /cases/1/view:');
    failed.forEach(f => console.log(`  [${f.status}] ${f.url}`));

    await browser.close();
}

checkFailedUrls();
