const puppeteer = require('puppeteer-core');

async function testCases() {
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    page.on('console', msg => {
        if (msg.type() === 'error') console.log(`[BROWSER ERROR] ${msg.text()}`);
    });

    page.on('pageerror', err => {
        console.error(`[PAGE ERROR]`, err);
    });

    console.log('Navigating to http://localhost:8000/cases ...');
    await page.goto('http://localhost:8000/cases', { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise(r => setTimeout(r, 3000));

    await page.screenshot({ path: 'D:\\Antigravity\\velourcare-ortho-cloud\\test_cases.png' });
    console.log('Screenshot saved to D:\\Antigravity\\velourcare-ortho-cloud\\test_cases.png');

    // Check table rows text
    const tableData = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('table tbody tr'));
        return rows.map(r => r.innerText.replace(/\n/g, ' | '));
    });
    console.log('Table rows found:', tableData.length);
    tableData.slice(0, 5).forEach((row, i) => console.log(`Row ${i+1}: ${row}`));

    await browser.close();
}

testCases().catch(err => {
    console.error('Test crashed:', err);
    process.exit(1);
});
