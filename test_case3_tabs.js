const puppeteer = require('puppeteer-core');
const BASE_URL = 'http://localhost:8000';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testTabs() {
    const browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: 'new',
        args: ['--no-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(`${BASE_URL}/cases/3/view`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));

    const res = await page.evaluate(() => {
        // Find the main case tab bar
        const mainNavTabs = Array.from(document.querySelectorAll('.card-header ul.nav-tabs li a, .card-body ul.nav-tabs li a'));
        return mainNavTabs.map(t => ({
            text: t.innerText.trim(),
            disabled: t.classList.contains('disabled') || t.getAttribute('aria-disabled') === 'true',
            classes: t.className
        }));
    });
    console.log('Main case tabs on Case 3:', res);

    // Click Manufacturing tab
    console.log('Clicking Manufacturing tab...');
    await page.evaluate(() => {
        const tabs = Array.from(document.querySelectorAll('.card-header ul.nav-tabs li a, .card-body ul.nav-tabs li a'));
        const m = tabs.find(t => t.innerText.includes('Manufacturing'));
        if (m) m.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    const mfgContent = await page.evaluate(() => {
        // Find visible tab pane inside main card
        const cardPanes = Array.from(document.querySelectorAll('.card .tab-pane'));
        const active = cardPanes.find(p => p.classList.contains('active') || p.style.display !== 'none');
        return {
            text: active ? active.innerText.slice(0, 500) : 'None',
            buttons: active ? Array.from(active.querySelectorAll('button')).map(b => b.innerText.trim()) : []
        };
    });
    console.log('Active tab content after clicking Manufacturing:', mfgContent);

    await browser.close();
}

testTabs().catch(console.error);
