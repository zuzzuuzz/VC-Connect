const puppeteer = require('puppeteer-core');

async function testFullIPRWorkflow() {
    console.log('Starting Full IPR & Treatment Plan Verification...');
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 950 });

    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
            console.log(`[BROWSER ERROR] ${msg.text()}`);
        }
    });

    // Step 1: Case 1 Overview
    console.log('\n--- 1. Testing /cases/1/view Overview ---');
    await page.goto('http://localhost:8000/cases/1/view', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: 'D:\\Antigravity\\velourcare-ortho-cloud\\verified_case_overview.png' });

    const clinicalDetails = await page.evaluate(() => {
        const table = document.querySelector('.case-side-card table');
        if (!table) return 'NO CLINICAL TABLE';
        return Array.from(table.querySelectorAll('tr')).map(r => r.innerText.replace(/\n+/g, ': '));
    });
    console.log('Clinical Details:\n ', clinicalDetails.join('\n  '));

    // Step 2: Treatment Plans Tab
    console.log('\n--- 2. Testing Treatment Plans Tab & IPR Badges ---');
    await page.evaluate(() => {
        const tabs = Array.from(document.querySelectorAll('a, button, [role="tab"]'));
        const tpTab = tabs.find(t => t.innerText.trim() === 'Treatment Plans');
        if (tpTab) tpTab.click();
    });
    await new Promise(r => setTimeout(r, 2500));
    await page.screenshot({ path: 'D:\\Antigravity\\velourcare-ortho-cloud\\verified_treatment_plans_ipr.png' });

    const tpRowData = await page.evaluate(() => {
        const row = document.querySelector('table tbody tr');
        return row ? row.innerText.replace(/\n+/g, ' | ') : 'NO ROW';
    });
    console.log('Treatment Plan Row:\n ', tpRowData);

    const attachmentsFound = await page.evaluate(() => {
        const badges = Array.from(document.querySelectorAll('table tbody tr .badge, table tbody tr .attachment-chip, table tbody tr a'));
        return badges.map(b => ({ text: b.innerText.trim(), href: b.getAttribute('href') })).filter(b => b.text && b.href);
    });
    console.log('Attachments & Action Links:\n', JSON.stringify(attachmentsFound, null, 2));

    // Step 3: Plan Document Editor (Interactive Teeth & IPR Chart)
    console.log('\n--- 3. Testing /cases/1/treatment-plans/1/document ---');
    await page.goto('http://localhost:8000/cases/1/treatment-plans/1/document', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2500));

    // Click on "IPR Summary" tab
    console.log('Clicking "IPR Summary" tab in Document Editor...');
    const iprTabClicked = await page.evaluate(() => {
        const tabs = Array.from(document.querySelectorAll('.nav-link, a, button'));
        const iprTab = tabs.find(t => t.innerText.includes('IPR Summary'));
        if (iprTab) {
            iprTab.click();
            return true;
        }
        return false;
    });
    console.log('IPR Summary Tab Clicked:', iprTabClicked);
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: 'D:\\Antigravity\\velourcare-ortho-cloud\\verified_ipr_summary_editor.png' });

    const iprSummaryText = await page.evaluate(() => {
        const table = document.querySelector('.table-responsive, table, .tab-pane.active');
        return table ? table.innerText.slice(0, 800) : 'NO IPR TABLE';
    });
    console.log('IPR Summary Content:\n', iprSummaryText);

    console.log('\nBrowser errors detected:', errors.length);

    await browser.close();
}

testFullIPRWorkflow().catch(err => {
    console.error('Test crashed:', err);
    process.exit(1);
});
