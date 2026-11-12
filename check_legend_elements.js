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
    await new Promise(r => setTimeout(r, 1500));

    await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('.nav-link, button[role="tab"]')).find(b => b.innerText.trim().includes('Treatment Overview'));
        if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    const imgReport = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        return imgs.map(img => ({
            src: img.src,
            alt: img.alt,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            complete: img.complete,
            visible: img.offsetWidth > 0 && img.offsetHeight > 0
        })).filter(i => i.src.includes('assets') || i.src.includes('tooth') || i.src.includes('cutout') || i.src.includes('hook') || i.src.includes('ipr') || i.src.includes('step'));
    });

    console.log(JSON.stringify(imgReport, null, 2));
    await browser.close();
})();
