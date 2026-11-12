const puppeteer = require('puppeteer-core');

(async () => {
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1200 });
    await page.goto('http://localhost:8000/cases/1/treatment-plans/1/document', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));

    // Find .diagram-legends element handle
    const elHandle = await page.$('.diagram-legends');
    if (elHandle) {
        console.log('Found .diagram-legends! Taking element screenshot...');
        await elHandle.screenshot({ path: 'D:\\Antigravity\\velourcare-ortho-cloud\\legends_element_captured.png' });
        console.log('Element screenshot saved to legends_element_captured.png');
    } else {
        console.log('Could not find .diagram-legends');
    }

    await browser.close();
})();
