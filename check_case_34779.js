const puppeteer = require('puppeteer-core');

(async () => {
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 950 });

    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
    });

    const apiCalls = [];
    page.on('response', async resp => {
        if (resp.url().includes('/api/')) {
            let snippet = '';
            try { snippet = (await resp.text()).slice(0, 150); } catch {}
            apiCalls.push({ url: resp.url(), status: resp.status(), data: snippet });
        }
    });

    // Login
    await page.goto('https://cloud.smilegenix.ae/login', { waitUntil: 'networkidle2' });
    await page.type('input[type="text"]', 'Ibrar@smilegenix');
    await page.type('input[type="password"]', 'Password123!');
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) await submitBtn.click();
    await new Promise(r => setTimeout(r, 4000));

    console.log('Navigating directly to https://cloud.smilegenix.ae/cases/34779/view ...');
    await page.goto('https://cloud.smilegenix.ae/cases/34779/view', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));

    const details = await page.evaluate(() => {
        const text = document.body.innerText;
        return {
            title: document.title,
            patientName: text.match(/Name\s+([A-Za-z\s]+)/),
            doctorName: text.match(/Doctor\s+([A-Za-z\s]+)/),
            hasTreatmentPlans: text.includes('Treatment Plans'),
            hasIpr: text.includes('IPR'),
            protocols: text.includes('Protocols'),
            allHeadings: Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => h.innerText.trim())
        };
    });

    console.log('Case details:', details);
    console.log('API calls made:', apiCalls);
    console.log('Console errors:', errors);

    await page.screenshot({ path: 'D:\\Antigravity\\velourcare-ortho-cloud\\live_case_34779_view.png' });
    console.log('Saved live_case_34779_view.png');

    await browser.close();
})();
