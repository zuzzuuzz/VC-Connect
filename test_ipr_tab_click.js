const puppeteer = require('puppeteer-core');

async function testIprTabClick() {
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 950 });

    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
    });

    console.log('Navigating to http://localhost:8000/cases/1/view ...');
    await page.goto('http://localhost:8000/cases/1/view', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));

    // Capture initial tabs state
    await page.screenshot({ path: 'D:\\Antigravity\\velourcare-ortho-cloud\\ipr_tab_initial.png' });

    console.log('Clicking IPR Protocol tab...');
    const clicked = await page.evaluate(() => {
        const iprBtn = document.getElementById('velourcare-ipr-tab-button');
        if (iprBtn) {
            iprBtn.click();
            return true;
        }
        return false;
    });

    console.log('IPR Tab button clicked:', clicked);
    await new Promise(r => setTimeout(r, 1200));

    await page.screenshot({ path: 'D:\\Antigravity\\velourcare-ortho-cloud\\ipr_tab_clicked_view.png' });
    console.log('Captured ipr_tab_clicked_view.png');

    console.log('Errors:', errors);
    await browser.close();
}

testIprTabClick().catch(console.error);
