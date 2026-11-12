const puppeteer = require('puppeteer-core');

(async () => {
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 950 });

    // Login as Ibrar
    await page.goto('https://cloud.smilegenix.ae/login', { waitUntil: 'networkidle2' });
    await page.type('input[type="text"]', 'Ibrar@smilegenix');
    await page.type('input[type="password"]', 'Password123!');
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) await submitBtn.click();
    await new Promise(r => setTimeout(r, 4000));

    // Get list of cases from API or DOM
    await page.goto('https://cloud.smilegenix.ae/cases', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 3000));

    const cases = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('table tbody tr')).map(tr => {
            const tds = Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim());
            const link = tr.querySelector('a');
            return {
                id: tds[0],
                status: tds[1],
                patient: tds[5],
                href: link ? link.href : null
            };
        });
    });

    console.log('Found cases on Ibrar account:', cases.slice(0, 10));

    // Let's click on the first 3 cases and check each one
    for (let i = 0; i < Math.min(3, cases.length); i++) {
        const c = cases[i];
        if (!c.href) continue;
        console.log(`\nInspecting case ${c.id} (${c.href}) ...`);
        await page.goto(c.href, { waitUntil: 'networkidle2', timeout: 20000 });
        await new Promise(r => setTimeout(r, 2500));

        const info = await page.evaluate(() => {
            return {
                title: document.title,
                url: window.location.href,
                hasChiefComplaint: !document.body.innerText.includes('No chief complaint available'),
                protocols: Array.from(document.querySelectorAll('*')).filter(e => e.innerText && e.innerText.includes('Protocol')).map(e => e.innerText.slice(0, 60)),
                clinicalDetails: Array.from(document.querySelectorAll('.card, table')).map(c => c.innerText.replace(/\s+/g, ' ').slice(0, 100))
            };
        });
        console.log(`Case ${c.id} info:`, info.protocols);
        await page.screenshot({ path: `D:\\Antigravity\\velourcare-ortho-cloud\\live_ibrar_case_${i}.png` });
    }

    await browser.close();
})();
