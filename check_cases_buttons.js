const puppeteer = require('puppeteer-core');

(async () => {
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto('http://localhost:8000/cases', { waitUntil: 'networkidle2' });
    
    const btns = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('button, a')).map(el => ({
            tag: el.tagName,
            text: el.innerText.trim(),
            class: el.className,
            href: el.getAttribute('href')
        })).filter(b => b.text.length > 0 && b.text.length < 50);
    });

    console.log(JSON.stringify(btns, null, 2));
    await browser.close();
})();
