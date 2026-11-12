const puppeteer = require('puppeteer-core');

async function testWizard() {
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 950 });

    await page.goto('http://localhost:8000/cases', { waitUntil: 'networkidle2' });

    console.log('Clicking Add New Case...');
    await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Add New Case');
        if (btn) btn.click();
    });

    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'D:\\Antigravity\\velourcare-ortho-cloud\\add_case_wizard_step1.png' });
    console.log('Wizard Step 1 captured!');

    await browser.close();
}

testWizard().catch(console.error);
