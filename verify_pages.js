const puppeteer = require('puppeteer-core');

async function verifyAllPages() {
    console.log('Launching Chrome for Full Verification...');
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

    // 1. Direct navigation to /cases
    console.log('\n--- 1. Testing Direct Navigation to http://localhost:8000/cases ---');
    await page.goto('http://localhost:8000/cases', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: 'D:\\Antigravity\\velourcare-ortho-cloud\\test_cases_verified.png' });
    
    const casesRows = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('table tbody tr'));
        return rows.map(r => r.innerText.replace(/\n+/g, ' | '));
    });
    console.log(`Cases Table: Found ${casesRows.length} rows`);
    casesRows.forEach((r, idx) => console.log(`  Row ${idx + 1}: ${r}`));

    // 2. Direct navigation to /invoices
    console.log('\n--- 2. Testing Direct Navigation to http://localhost:8000/invoices ---');
    await page.goto('http://localhost:8000/invoices', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: 'D:\\Antigravity\\velourcare-ortho-cloud\\test_invoices_verified.png' });

    const invoiceRows = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('table tbody tr'));
        return rows.map(r => r.innerText.replace(/\n+/g, ' | '));
    });
    console.log(`Invoices Table: Found ${invoiceRows.length} rows`);
    invoiceRows.forEach((r, idx) => console.log(`  Row ${idx + 1}: ${r}`));

    // 3. Direct navigation to /clients
    console.log('\n--- 3. Testing Direct Navigation to http://localhost:8000/clients ---');
    await page.goto('http://localhost:8000/clients', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: 'D:\\Antigravity\\velourcare-ortho-cloud\\test_clients_verified.png' });

    const clientRows = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('table tbody tr'));
        return rows.map(r => r.innerText.replace(/\n+/g, ' | '));
    });
    console.log(`Clients Table: Found ${clientRows.length} rows`);
    clientRows.forEach((r, idx) => console.log(`  Row ${idx + 1}: ${r}`));

    await browser.close();
    console.log('\nAll direct navigations and table verifications completed successfully!');
}

verifyAllPages().catch(err => {
    console.error('Verification failed:', err);
    process.exit(1);
});
