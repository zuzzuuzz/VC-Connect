const puppeteer = require('puppeteer-core');

(async () => {
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 950 });

    // Login
    await page.goto('https://cloud.smilegenix.ae/login', { waitUntil: 'networkidle2' });
    await page.type('input[type="text"]', '3Dalignerplanner@smilegenix');
    await page.type('input[type="password"]', 'Password123!');
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) await submitBtn.click();
    await new Promise(r => setTimeout(r, 4000));

    // Go to case
    await page.goto('https://cloud.smilegenix.ae/cases/34768/view', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));

    // Click Treatment Plans tab
    console.log('Clicking Treatment Plans tab...');
    await page.evaluate(() => {
        const tabs = Array.from(document.querySelectorAll('a, button, [role="tab"]'));
        const tp = tabs.find(t => t.innerText.trim() === 'Treatment Plans');
        if (tp) tp.click();
    });

    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: 'D:\\Antigravity\\velourcare-ortho-cloud\\live_treatment_plans_tab.png' });
    console.log('Saved live_treatment_plans_tab.png');

    const tpContent = await page.evaluate(() => {
        return {
            tableRows: Array.from(document.querySelectorAll('table tr')).map(r => r.innerText.replace(/\s+/g, ' ')),
            bodySnippet: document.body.innerText.replace(/\s+/g, ' ').slice(0, 500)
        };
    });
    console.log('Treatment Plans Content:', JSON.stringify(tpContent, null, 2));

    await browser.close();
})();
