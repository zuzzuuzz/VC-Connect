const puppeteer = require('puppeteer-core');

(async () => {
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1200 });

    console.log('Navigating to http://localhost:8000/cases/1/treatment-plans/1/document ...');
    await page.goto('http://localhost:8000/cases/1/treatment-plans/1/document', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));

    console.log('Clicking "Treatment Overview" tab...');
    await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('.nav-link, button[role="tab"]')).find(b => b.innerText.trim().includes('Treatment Overview'));
        if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    // Scroll to .diagram-legends inside the visible container
    const found = await page.evaluate(() => {
        const visibleLegends = Array.from(document.querySelectorAll('.diagram-legends')).filter(el => {
            const rect = el.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0 && rect.left >= 0;
        });
        if (visibleLegends.length > 0) {
            visibleLegends[0].scrollIntoView({ behavior: 'instant', block: 'center' });
            return true;
        }
        return false;
    });

    console.log('Visible legends found & scrolled:', found);
    await new Promise(r => setTimeout(r, 1000));

    await page.screenshot({ path: 'D:\\Antigravity\\velourcare-ortho-cloud\\treatment_overview_legends.png' });
    console.log('Saved treatment_overview_legends.png');

    await browser.close();
})();
