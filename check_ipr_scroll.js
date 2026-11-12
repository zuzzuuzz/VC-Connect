const puppeteer = require('puppeteer-core');

async function captureIPRSection() {
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 950 });

    await page.goto('http://localhost:8000/cases/1/view', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));

    await page.evaluate(() => {
        const el = document.getElementById('velourcare-ipr-section');
        if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    });

    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'D:\\Antigravity\\velourcare-ortho-cloud\\ipr_section_scroll_view.png' });
    console.log('IPR Section screenshot captured!');

    await browser.close();
}

captureIPRSection().catch(console.error);
