const puppeteer = require('puppeteer-core');

async function testCaseTabsAndModals() {
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

    console.log('Navigating to http://localhost:8000/cases/1/view ...');
    await page.goto('http://localhost:8000/cases/1/view', { waitUntil: 'networkidle2' });

    // Test Step Files tab
    console.log('1. Clicking Step Files tab...');
    await page.evaluate(() => {
        const tabs = Array.from(document.querySelectorAll('a, button, [role="tab"]'));
        const tab = tabs.find(t => t.innerText.trim() === 'Step Files');
        if (tab) tab.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: 'D:\\Antigravity\\velourcare-ortho-cloud\\tab_step_files.png' });

    // Test Manufacturing tab
    console.log('2. Clicking Manufacturing tab...');
    await page.evaluate(() => {
        const tabs = Array.from(document.querySelectorAll('a, button, [role="tab"]'));
        const tab = tabs.find(t => t.innerText.trim() === 'Manufacturing');
        if (tab) tab.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: 'D:\\Antigravity\\velourcare-ortho-cloud\\tab_manufacturing.png' });

    // Test Activities tab
    console.log('3. Clicking Activities tab...');
    await page.evaluate(() => {
        const tabs = Array.from(document.querySelectorAll('a, button, [role="tab"]'));
        const tab = tabs.find(t => t.innerText.trim() === 'Activities');
        if (tab) tab.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: 'D:\\Antigravity\\velourcare-ortho-cloud\\tab_activities.png' });

    // Test /cases Add New Case button
    console.log('4. Navigating to /cases and clicking Add New Case...');
    await page.goto('http://localhost:8000/cases', { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
        const addBtn = Array.from(document.querySelectorAll('button, a')).find(b => b.innerText.includes('Add New Case'));
        if (addBtn) addBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: 'D:\\Antigravity\\velourcare-ortho-cloud\\modal_add_case.png' });

    console.log('Errors:', errors);
    await browser.close();
}

testCaseTabsAndModals().catch(console.error);
