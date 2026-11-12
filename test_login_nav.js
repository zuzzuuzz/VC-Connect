const puppeteer = require('puppeteer-core');

async function testLoginWithNavigation(username, password) {
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    page.on('console', msg => console.log('PAGE CONSOLE:', msg.type(), msg.text()));

    page.on('response', async resp => {
        if (resp.url().includes('login') || resp.url().includes('/api/')) {
            let bodyText = '';
            try { bodyText = (await resp.text()).slice(0, 300); } catch {}
            console.log(`[RESP ${resp.status()}] ${resp.url()} -> ${bodyText}`);
        }
    });

    console.log('Navigating to https://cloud.smilegenix.ae/login ...');
    await page.goto('https://cloud.smilegenix.ae/login', { waitUntil: 'networkidle2' });

    console.log('Typing credentials...');
    await page.type('input[type="text"]', username);
    await page.type('input[type="password"]', password);

    console.log('Clicking Sign In button...');
    const btn = await page.$('button[type="submit"]');
    if (btn) await btn.click();

    console.log('Waiting for navigation or URL change...');
    try {
        await page.waitForNavigation({ timeout: 10000 });
    } catch (e) {
        console.log('waitForNavigation timeout/done, current URL:', page.url());
    }

    await new Promise(r => setTimeout(r, 4000));
    console.log('Final URL:', page.url());
    console.log('Final Title:', await page.title());

    await page.screenshot({ path: 'D:\\Antigravity\\velourcare-ortho-cloud\\live_logged_in_dashboard.png' });
    console.log('Saved live_logged_in_dashboard.png');

    await browser.close();
}

testLoginWithNavigation('Ibrar@smilegenix', 'Password123!').catch(console.error);
