const puppeteer = require('puppeteer-core');

async function testLiveLogin(username, password, label) {
    console.log(`\n=== TESTING LIVE LOGIN FOR [${label}]: ${username} ===`);
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    const errors = [];
    const responses = [];

    page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
    });

    page.on('response', resp => {
        if (resp.url().includes('/api/') || resp.status() >= 400) {
            responses.push({
                url: resp.url(),
                status: resp.status(),
                statusText: resp.statusText()
            });
        }
    });

    try {
        console.log('Navigating to https://cloud.smilegenix.ae/login ...');
        await page.goto('https://cloud.smilegenix.ae/login', { waitUntil: 'networkidle2', timeout: 20000 });

        // Wait for input fields
        await page.waitForSelector('input[type="text"], input[placeholder*="username" i]', { timeout: 10000 });

        console.log('Filling in credentials...');
        const userInputs = await page.$$('input[type="text"], input[placeholder*="username" i]');
        if (userInputs.length > 0) {
            await userInputs[0].type(username, { delay: 50 });
        }

        const passInputs = await page.$$('input[type="password"]');
        if (passInputs.length > 0) {
            await passInputs[0].type(password, { delay: 50 });
        }

        console.log('Submitting login form...');
        const submitBtn = await page.$('button[type="submit"], button.btn-primary, button.btn-success');
        if (submitBtn) {
            await Promise.all([
                submitBtn.click(),
                new Promise(r => setTimeout(r, 4000))
            ]);
        }

        const currentUrl = page.url();
        const pageTitle = await page.title();
        console.log('Current URL after submit:', currentUrl);
        console.log('Page Title:', pageTitle);

        const pageText = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 300));
        console.log('Page text snippet:', pageText);

        await page.screenshot({ path: `D:\\Antigravity\\velourcare-ortho-cloud\\login_result_${label}.png` });
        console.log(`Screenshot saved to login_result_${label}.png`);

        console.log('API Responses during login:', responses);
        console.log('Console Errors:', errors);

    } catch (err) {
        console.error('Error during login test:', err.message);
    } finally {
        await browser.close();
    }
}

async function run() {
    await testLiveLogin('Ibrar@smilegenix', 'Password123!', 'profile1_ibrar');
    await testLiveLogin('3Dalignerplanner@smilegenix', 'Password123!', 'profile2_planner');
}

run().catch(console.error);
