const puppeteer = require('puppeteer-core');

async function testTreatmentPlansTab() {
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
    });

    console.log('Navigating to http://localhost:8000/cases/1/view ...');
    await page.goto('http://localhost:8000/cases/1/view', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));

    // Look for tabs: Overview, Treatment Plans, Step Files, Manufacturing, Activities
    console.log('Clicking Treatment Plans tab...');
    const clicked = await page.evaluate(() => {
        const tabs = Array.from(document.querySelectorAll('a, button, [role="tab"]'));
        const tpTab = tabs.find(t => t.innerText.trim() === 'Treatment Plans');
        if (tpTab) {
            tpTab.click();
            return true;
        }
        return false;
    });

    console.log('Treatment Plans tab clicked:', clicked);
    await new Promise(r => setTimeout(r, 2500));

    await page.screenshot({ path: 'D:\\Antigravity\\velourcare-ortho-cloud\\test_tp_tab.png' });
    console.log('Screenshot saved to D:\\Antigravity\\velourcare-ortho-cloud\\test_tp_tab.png');

    console.log('Browser errors:', errors);

    const bodyText = await page.evaluate(() => document.querySelector('.tab-content')?.innerText || document.body.innerText.slice(0, 1000));
    console.log('Tab content snippet:\n', bodyText.slice(0, 500));

    await browser.close();
}

testTreatmentPlansTab().catch(console.error);
