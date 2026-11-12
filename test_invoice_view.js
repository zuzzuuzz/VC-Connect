const puppeteer = require('puppeteer-core');

async function testInvoiceDetail() {
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

    console.log('Navigating to http://localhost:8000/invoices/1 ...');
    await page.goto('http://localhost:8000/invoices/1', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));

    await page.screenshot({ path: 'D:\\Antigravity\\velourcare-ortho-cloud\\test_invoice_detail.png' });
    console.log('Screenshot saved to D:\\Antigravity\\velourcare-ortho-cloud\\test_invoice_detail.png');

    await browser.close();
}

testInvoiceDetail().catch(console.error);
