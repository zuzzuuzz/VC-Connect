const puppeteer = require('puppeteer-core');
const fs = require('fs');

const BASE_URL = 'http://localhost:8000';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

async function testDeepWorkflows() {
    console.log('--- STARTING IN-DEPTH WORKFLOWS & GLITCH AUDIT ---');

    const browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') errors.push({ url: page.url(), text: msg.text() });
    });
    page.on('pageerror', err => errors.push({ url: page.url(), text: err.toString() }));

    const findings = [];

    // ==========================================
    // 1. PLAN DOCUMENT EDITOR AUDIT
    // ==========================================
    console.log('\n1. Testing Plan Document Editor (/cases/1/treatment-plans/1/document)...');
    await page.goto(`${BASE_URL}/cases/1/treatment-plans/1/document`, { waitUntil: 'networkidle2' });
    await sleep(2000);

    const planDocState = await page.evaluate(() => {
        const teethElements = document.querySelectorAll('.tooth-item, [data-tooth], .teeth-chart svg, .teeth-chart path, .teeth-chart-item');
        const saveBtns = Array.from(document.querySelectorAll('button')).filter(b => 
            b.innerText.includes('Save') || b.innerText.includes('PDF') || b.innerText.includes('Generate')
        ).map(b => b.innerText.trim());
        const editorTextarea = document.querySelector('textarea, .ck-editor, .ck-content, [contenteditable="true"]');
        
        return {
            title: document.title,
            teethInteractiveCount: teethElements.length,
            saveButtons: saveBtns,
            hasRichTextEditor: !!editorTextarea
        };
    });
    console.log('   Plan Document State:', planDocState);

    // Test clicking teeth or buttons in PlanDocumentEditor
    const clickTeethResult = await page.evaluate(() => {
        const teeth = document.querySelectorAll('[data-tooth], .tooth-box, .tooth-item');
        if (teeth.length > 0) {
            teeth[0].click();
            return { clicked: true, count: teeth.length };
        }
        return { clicked: false, count: 0 };
    });
    console.log('   Interactive Teeth Chart Click Test:', clickTeethResult);

    // ==========================================
    // 2. INVOICE WORKFLOW AUDIT
    // ==========================================
    console.log('\n2. Testing Invoice Creation Wizard (/invoices/create)...');
    await page.goto(`${BASE_URL}/invoices/create`, { waitUntil: 'networkidle2' });
    await sleep(1500);

    const invoiceCreateForm = await page.evaluate(() => {
        const clientSelect = document.querySelector('select, .multiselect');
        const steps = Array.from(document.querySelectorAll('.step, .nav-tabs li, .progress-bar, .wizard-tab')).map(el => el.innerText.trim());
        const nextBtns = Array.from(document.querySelectorAll('button')).filter(b => 
            b.innerText.includes('Next') || b.innerText.includes('Continue') || b.innerText.includes('Services')
        ).map(b => b.innerText.trim());

        return {
            hasClientSelect: !!clientSelect,
            stepsFound: steps,
            buttons: nextBtns
        };
    });
    console.log('   Invoice Create Wizard State:', invoiceCreateForm);

    console.log('\n3. Testing Single Invoice Detail View (/invoices/1)...');
    await page.goto(`${BASE_URL}/invoices/1`, { waitUntil: 'networkidle2' });
    await sleep(1500);

    const invoiceDetailState = await page.evaluate(() => {
        const printBtn = Array.from(document.querySelectorAll('button, a')).find(b => b.innerText.includes('Print'));
        const payBtn = Array.from(document.querySelectorAll('button, a')).find(b => b.innerText.includes('Pay') || b.innerText.includes('Stripe'));
        const totalAmount = Array.from(document.querySelectorAll('td, span, div')).find(el => el.innerText.includes('$') || el.innerText.includes('AED'));
        
        return {
            hasPrintBtn: !!printBtn,
            hasPayBtn: !!payBtn,
            sampleAmount: totalAmount ? totalAmount.innerText.trim() : 'N/A'
        };
    });
    console.log('   Invoice #1 Detail State:', invoiceDetailState);

    // ==========================================
    // 3. TOPBAR CONTROLS: THEME, FULLSCREEN, PROFILE
    // ==========================================
    console.log('\n4. Testing Topbar UI Controls (Theme Switcher, User Dropdown, Notifications)...');
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle2' });
    await sleep(1200);

    const topbarControls = await page.evaluate(async () => {
        // Theme switch (dark mode / light mode)
        const lightDarkBtn = document.querySelector('[data-bs-toggle="mode"], #light-dark-mode, .light-dark-mode, button[title*="Dark"], button[title*="Light"]');
        const initialTheme = document.documentElement.getAttribute('data-bs-theme');
        let toggledTheme = null;
        if (lightDarkBtn) {
            lightDarkBtn.click();
            await new Promise(r => setTimeout(r, 400));
            toggledTheme = document.documentElement.getAttribute('data-bs-theme');
        }

        // User dropdown
        const userAvatarBtn = document.querySelector('#page-header-user-dropdown, .header-item.user-dropdown, [data-bs-toggle="dropdown"] img[src*="square"]');
        let userDropdownOpened = false;
        if (userAvatarBtn) {
            userAvatarBtn.click();
            await new Promise(r => setTimeout(r, 400));
            const dropdownMenu = document.querySelector('.dropdown-menu.show');
            userDropdownOpened = !!dropdownMenu;
        }

        // Notification dropdown
        const notifBtn = document.querySelector('#page-header-notifications-dropdown, button[title*="Notifications"]');
        let notifDropdownOpened = false;
        if (notifBtn) {
            notifBtn.click();
            await new Promise(r => setTimeout(r, 400));
            const notifMenu = document.querySelector('.dropdown-menu.show');
            notifDropdownOpened = !!notifMenu;
        }

        return {
            hasThemeBtn: !!lightDarkBtn,
            initialTheme,
            toggledTheme,
            themeToggleWorks: toggledTheme && toggledTheme !== initialTheme,
            userDropdownOpened,
            notifDropdownOpened
        };
    });
    console.log('   Topbar Controls Results:', topbarControls);

    // ==========================================
    // 4. ROLES PERMISSIONS MATRIX AUDIT
    // ==========================================
    console.log('\n5. Testing Roles Permissions Matrix (/roles/1/permissions)...');
    await page.goto(`${BASE_URL}/roles/1/permissions`, { waitUntil: 'networkidle2' });
    await sleep(1500);

    const permissionsMatrix = await page.evaluate(() => {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        const groups = Array.from(document.querySelectorAll('h5, h6, .card-title, .fw-semibold')).map(el => el.innerText.trim()).filter(t => t.length > 2);
        const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Save') || b.innerText.includes('Update'));
        
        return {
            checkboxesCount: checkboxes.length,
            groupsFound: groups.slice(0, 10),
            hasSaveButton: !!saveBtn
        };
    });
    console.log('   Permissions Matrix State:', permissionsMatrix);

    // ==========================================
    // 5. CLIENT EDIT & SUB-CLIENTS TABS
    // ==========================================
    console.log('\n6. Testing Client Detail / Edit Tabs (/clients/1/edit)...');
    await page.goto(`${BASE_URL}/clients/1/edit`, { waitUntil: 'networkidle2' });
    await sleep(1500);

    const clientTabs = await page.evaluate(async () => {
        const tabs = Array.from(document.querySelectorAll('ul.nav-tabs li a, [role="tab"], button.nav-link')).map(t => t.innerText.trim());
        const inputs = document.querySelectorAll('input, select, textarea').length;
        return {
            tabs,
            inputsCount: inputs
        };
    });
    console.log('   Client Edit Tabs State:', clientTabs);

    await browser.close();

    console.log('\n--- WORKFLOW TEST SUMMARY ---');
    console.log(`Uncaught Console Errors Count: ${errors.length}`);
    if (errors.length > 0) {
        console.log('Sample errors:');
        errors.slice(0, 5).forEach(e => console.log(`  [${e.url}] ${e.text}`));
    }
}

testDeepWorkflows().catch(console.error);
