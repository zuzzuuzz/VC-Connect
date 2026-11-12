const puppeteer = require('puppeteer-core');

async function inspectSidebar() {
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    await page.goto('http://localhost:8000/dashboard', { waitUntil: 'networkidle2' });

    const sidebarInfo = await page.evaluate(() => {
        const sidebar = document.querySelector('.app-menu') || document.querySelector('#scrollbar') || document.querySelector('.navbar-menu');
        if (!sidebar) return { found: false };
        const html = sidebar.outerHTML.slice(0, 1500);
        const links = Array.from(sidebar.querySelectorAll('a')).map(a => ({
            text: a.innerText,
            span: a.querySelector('span') ? a.querySelector('span').innerText : null,
            classes: a.className,
            href: a.getAttribute('href')
        }));
        return {
            found: true,
            className: sidebar.className,
            htmlPreview: html,
            links: links
        };
    });

    console.log('Sidebar Info:', JSON.stringify(sidebarInfo, null, 2));

    await browser.close();
}

inspectSidebar().catch(console.error);
