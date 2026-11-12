const puppeteer = require('puppeteer-core');

(async () => {
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto('http://localhost:8000/cases/1/view', { waitUntil: 'networkidle2' });
    
    const tabs = await page.evaluate(() => {
        const ul = document.querySelector('ul.nav.nav-tabs.nav-tabs-custom.border-bottom-0');
        if (!ul) return null;
        return Array.from(ul.querySelectorAll('li')).map(li => ({
            text: li.innerText.trim(),
            html: li.innerHTML
        }));
    });

    console.log(JSON.stringify(tabs, null, 2));
    await browser.close();
})();
