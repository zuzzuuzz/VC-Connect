const puppeteer = require('puppeteer-core');

async function testLegends() {
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1100 });

    console.log('Navigating to http://localhost:8000/cases/1/treatment-plans/1/document ...');
    await page.goto('http://localhost:8000/cases/1/treatment-plans/1/document', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));

    // Search for Legends element
    const foundLegends = await page.evaluate(() => {
        const els = Array.from(document.querySelectorAll('*')).filter(e => e.innerText && e.innerText.trim() === 'Legends');
        return els.map(e => ({
            tag: e.tagName,
            class: e.className,
            parentClass: e.parentElement ? e.parentElement.className : ''
        }));
    });
    console.log('Found Legends elements:', foundLegends);

    // Click each tab in Plan Document editor and look for Legends
    const tabs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.nav-link, button[role="tab"]')).map(b => b.innerText.trim());
    });
    console.log('Document Editor Tabs:', tabs);

    for (const tabName of tabs) {
        console.log(`Checking tab: "${tabName}"`);
        await page.evaluate((tName) => {
            const btn = Array.from(document.querySelectorAll('.nav-link, button[role="tab"]')).find(b => b.innerText.trim().includes(tName));
            if (btn) btn.click();
        }, tabName);
        await new Promise(r => setTimeout(r, 1000));

        // Check if Legends is visible
        const isLegendsVisible = await page.evaluate(() => {
            const el = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, div, p, span, th, td'))
                .find(e => e.innerText && e.innerText.trim() === 'Legends' && e.children.length === 0);
            if (el) {
                el.scrollIntoView({ behavior: 'instant', block: 'center' });
                return true;
            }
            return false;
        });

        if (isLegendsVisible) {
            console.log(`FOUND LEGENDS IN TAB "${tabName}"!`);
            await page.screenshot({ path: `D:\\Antigravity\\velourcare-ortho-cloud\\legends_${tabName.replace(/[^a-zA-Z0-9]/g, '_')}.png` });
        }
    }

    // Also take a screenshot of current view
    await page.screenshot({ path: 'D:\\Antigravity\\velourcare-ortho-cloud\\document_editor_current.png' });

    await browser.close();
}

testLegends().catch(console.error);
