const puppeteer = require('puppeteer-core');

async function testDocEditor() {
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
        console.log(`[CONSOLE ${msg.type().toUpperCase()}] ${msg.text()}`);
    });

    console.log('Navigating to http://localhost:8000/cases/1/treatment-plans/1/document ...');
    await page.goto('http://localhost:8000/cases/1/treatment-plans/1/document', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 3000));

    await page.screenshot({ path: 'D:\\Antigravity\\velourcare-ortho-cloud\\test_doc_editor.png' });
    console.log('Screenshot saved to D:\\Antigravity\\velourcare-ortho-cloud\\test_doc_editor.png');

    const title = await page.title();
    console.log('Page Title:', title);

    await browser.close();
}

testDocEditor().catch(console.error);
