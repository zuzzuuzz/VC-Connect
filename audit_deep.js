const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:8000';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const results = {
    pagesAudited: 0,
    consoleErrors: [],
    networkErrors: [],
    modalTests: [],
    formTests: [],
    interactionTests: [],
    responsiveGlitches: [],
    generalGlitches: []
};

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runAudit() {
    console.log('====================================================');
    console.log('STARTING IN-DEPTH COMPREHENSIVE QA AUDIT OF PORTAL');
    console.log('Target:', BASE_URL);
    console.log('Time:', new Date().toISOString());
    console.log('====================================================\n');

    const browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-web-security',
            '--allow-running-insecure-content',
            '--window-size=1440,900'
        ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // Global listener for console & network errors
    page.on('console', msg => {
        if (msg.type() === 'error') {
            const text = msg.text();
            // Filter noise if any
            results.consoleErrors.push({
                url: page.url(),
                text: text
            });
            console.log(`[CONSOLE ERROR] [${page.url()}] ${text.slice(0, 150)}`);
        }
    });

    page.on('pageerror', err => {
        results.consoleErrors.push({
            url: page.url(),
            text: err.toString()
        });
        console.log(`[PAGE UNCAUGHT ERROR] [${page.url()}] ${err.toString().slice(0, 150)}`);
    });

    page.on('response', resp => {
        if (resp.status() >= 400) {
            results.networkErrors.push({
                pageUrl: page.url(),
                requestUrl: resp.url(),
                status: resp.status()
            });
            console.log(`[NETWORK FAIL ${resp.status()}] ${resp.url()}`);
        }
    });

    // ==========================================
    // 1. DASHBOARD AUDIT
    // ==========================================
    console.log('\n--- 1. Testing Dashboard (/dashboard) ---');
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle2' });
    results.pagesAudited++;
    await sleep(1000);

    // Test Refresh Button
    const refreshClicked = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const rBtn = btns.find(b => b.innerText.includes('Refresh'));
        if (rBtn) { rBtn.click(); return true; }
        return false;
    });
    console.log('Dashboard Refresh clicked:', refreshClicked);
    await sleep(1000);

    // Test Test Email Modal
    console.log('Testing Test Email Modal...');
    const emailModalOpened = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const eBtn = btns.find(b => b.innerText.includes('Test Email'));
        if (eBtn) { eBtn.click(); return true; }
        return false;
    });
    await sleep(800);
    const emailModalVisible = await page.evaluate(() => {
        const modal = document.querySelector('.modal.show, .modal[style*="display: block"]');
        return !!modal;
    });
    results.modalTests.push({ modal: 'TestEmailModal', opened: emailModalOpened && emailModalVisible });
    console.log('Test Email Modal opened:', emailModalVisible);

    // Close modal if open
    await page.evaluate(() => {
        const closeBtn = document.querySelector('.modal.show .btn-close, .modal.show button.close, .modal.show [data-bs-dismiss="modal"]');
        if (closeBtn) closeBtn.click();
    });
    await sleep(500);

    // ==========================================
    // 2. CASES LIST & ADD NEW CASE MODAL
    // ==========================================
    console.log('\n--- 2. Testing Cases List (/cases) ---');
    await page.goto(`${BASE_URL}/cases`, { waitUntil: 'networkidle2' });
    results.pagesAudited++;
    await sleep(1000);

    // Check table rows
    const caseRowCount = await page.evaluate(() => {
        return document.querySelectorAll('table tbody tr').length;
    });
    console.log(`Cases table rendered with ${caseRowCount} rows.`);

    // Test Search input
    console.log('Testing Cases Search Filter...');
    await page.evaluate(() => {
        const searchInput = document.querySelector('input[placeholder*="Search"], input[type="search"]');
        if (searchInput) {
            searchInput.value = 'Fatima';
            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
    });
    await sleep(1000);

    // Test Status capsule click
    console.log('Testing Status Capsule Filters...');
    await page.evaluate(() => {
        const capsules = Array.from(document.querySelectorAll('.badge, .nav-link, button')).filter(el => el.innerText.includes('Review Treatment Plan') || el.innerText.includes('In Planning'));
        if (capsules.length > 0) capsules[0].click();
    });
    await sleep(1000);

    // Test "Add New Case" Modal Wizard
    console.log('Testing Add New Case Wizard Modal...');
    const addCaseBtnClicked = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button, a'));
        const btn = btns.find(b => b.innerText.includes('Add New Case'));
        if (btn) { btn.click(); return true; }
        return false;
    });
    await sleep(1000);

    const addCaseModalVisible = await page.evaluate(() => {
        const modal = document.querySelector('.modal.show, .modal[style*="display: block"]');
        return {
            visible: !!modal,
            title: modal ? modal.querySelector('.modal-title')?.innerText : null,
            hasClientSelect: !!modal?.querySelector('select, .multiselect, [id*="client"]'),
            inputsCount: modal ? modal.querySelectorAll('input, select, textarea').length : 0
        };
    });
    console.log('Add New Case Modal Status:', addCaseModalVisible);
    results.modalTests.push({ modal: 'CreateCaseModal', ...addCaseModalVisible });

    // Test navigating steps inside Add Case wizard
    if (addCaseModalVisible.visible) {
        console.log('Attempting Step Navigation in Add Case Wizard...');
        const wizardStep1Result = await page.evaluate(() => {
            const nextBtns = Array.from(document.querySelectorAll('.modal.show button')).filter(b => b.innerText.includes('Next') || b.innerText.includes('Continue'));
            return nextBtns.map(b => b.innerText.trim());
        });
        console.log('Wizard navigation buttons found:', wizardStep1Result);

        // Close modal
        await page.evaluate(() => {
            const closeBtn = document.querySelector('.modal.show .btn-close, .modal.show button.close, .modal.show [data-bs-dismiss="modal"]');
            if (closeBtn) closeBtn.click();
        });
        await sleep(500);
    }

    // ==========================================
    // 3. CASE DETAIL VIEW & TABS (/cases/1/view)
    // ==========================================
    console.log('\n--- 3. Testing Case Detail View (/cases/1/view) ---');
    await page.goto(`${BASE_URL}/cases/1/view`, { waitUntil: 'networkidle2' });
    results.pagesAudited++;
    await sleep(1200);

    // Check all tab buttons
    const caseTabs = await page.evaluate(() => {
        const tabs = Array.from(document.querySelectorAll('ul.nav-tabs li a, [role="tab"], button.nav-link'));
        return tabs.map(t => t.innerText.trim());
    });
    console.log('Case Detail Tabs Found:', caseTabs);

    const tabsToTest = ['Overview', 'Treatment Plans', 'IPR Protocol', 'Step Files', 'Manufacturing', 'Activities'];
    for (const tabName of tabsToTest) {
        console.log(`Clicking tab: "${tabName}"...`);
        const clicked = await page.evaluate((name) => {
            const tabs = Array.from(document.querySelectorAll('ul.nav-tabs li a, [role="tab"], button.nav-link'));
            const tab = tabs.find(t => t.innerText.toLowerCase().includes(name.toLowerCase()));
            if (tab) { tab.click(); return true; }
            return false;
        }, tabName);
        await sleep(1000);
        results.interactionTests.push({ component: 'CaseDetailTab', tab: tabName, success: clicked });
    }

    // Test Comments / Discussion on Case Detail
    console.log('Testing Comment posting on Case Detail...');
    const commentResult = await page.evaluate(async () => {
        const input = document.querySelector('textarea[placeholder*="comment"], textarea[placeholder*="message"], textarea[id*="comment"]');
        const submitBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Send') || b.innerText.includes('Post') || b.innerText.includes('Comment'));
        if (input && submitBtn) {
            input.value = 'Automated QA test comment ' + Date.now();
            input.dispatchEvent(new Event('input', { bubbles: true }));
            submitBtn.click();
            return { attempted: true };
        }
        return { attempted: false, reason: 'Comment input or submit button not found' };
    });
    console.log('Comment test result:', commentResult);
    await sleep(1000);

    // Test Modals on Case Detail: "Edit Case", "Edit Patient", "Change Status", "Change Planner"
    const caseDetailModals = ['Edit Case', 'Edit Patient', 'Change Status', 'Assign Planner', 'Change Client'];
    for (const actionName of caseDetailModals) {
        console.log(`Testing Case Detail action button: "${actionName}"...`);
        const modalOpened = await page.evaluate((act) => {
            const btns = Array.from(document.querySelectorAll('button, a'));
            const b = btns.find(x => x.innerText.trim() === act || x.innerText.includes(act));
            if (b) { b.click(); return true; }
            return false;
        }, actionName);
        await sleep(800);
        const isOpen = await page.evaluate(() => {
            const m = document.querySelector('.modal.show, .modal[style*="display: block"]');
            return {
                open: !!m,
                title: m ? m.querySelector('.modal-title')?.innerText : null
            };
        });
        console.log(`Action "${actionName}" modal result:`, isOpen);
        results.modalTests.push({ action: actionName, ...isOpen });

        if (isOpen.open) {
            // Close it
            await page.evaluate(() => {
                const closeBtn = document.querySelector('.modal.show .btn-close, .modal.show [data-bs-dismiss="modal"]');
                if (closeBtn) closeBtn.click();
            });
            await sleep(500);
        }
    }

    // ==========================================
    // 4. PLAN DOCUMENT EDITOR
    // ==========================================
    console.log('\n--- 4. Testing Plan Document Editor (/cases/1/treatment-plans/1/document) ---');
    await page.goto(`${BASE_URL}/cases/1/treatment-plans/1/document`, { waitUntil: 'networkidle2' });
    results.pagesAudited++;
    await sleep(1500);

    // Check action buttons in document editor
    const docButtons = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button, a.btn'));
        return btns.map(b => b.innerText.trim()).filter(Boolean);
    });
    console.log('Plan Document Editor buttons:', docButtons);

    // Test Edit Teeth Chart Modal
    console.log('Testing "Edit Teeth Chart" button...');
    const teethChartClicked = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button, a.btn'));
        const btn = btns.find(b => b.innerText.includes('Edit Teeth Chart') || b.innerText.includes('Teeth Chart'));
        if (btn) { btn.click(); return true; }
        return false;
    });
    await sleep(800);
    const teethChartModal = await page.evaluate(() => {
        const m = document.querySelector('.modal.show, .modal[style*="display: block"]');
        return {
            open: !!m,
            title: m ? m.querySelector('.modal-title')?.innerText : null
        };
    });
    console.log('Teeth Chart Modal:', teethChartModal);
    if (teethChartModal.open) {
        await page.evaluate(() => {
            const closeBtn = document.querySelector('.modal.show .btn-close, .modal.show [data-bs-dismiss="modal"]');
            if (closeBtn) closeBtn.click();
        });
        await sleep(500);
    }

    // ==========================================
    // 5. CLIENTS & EDIT CLIENT (/clients, /clients/1)
    // ==========================================
    console.log('\n--- 5. Testing Clients Page (/clients) ---');
    await page.goto(`${BASE_URL}/clients`, { waitUntil: 'networkidle2' });
    results.pagesAudited++;
    await sleep(1000);

    // Test "Create Client" modal
    console.log('Testing "Create Client" Modal...');
    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button, a'));
        const btn = btns.find(b => b.innerText.includes('Create Client'));
        if (btn) btn.click();
    });
    await sleep(800);
    const clientModalStatus = await page.evaluate(() => {
        const m = document.querySelector('.modal.show, .modal[style*="display: block"]');
        return {
            open: !!m,
            title: m ? m.querySelector('.modal-title')?.innerText : null,
            fieldCount: m ? m.querySelectorAll('input, select, textarea').length : 0
        };
    });
    console.log('Create Client Modal Status:', clientModalStatus);
    results.modalTests.push({ modal: 'CreateClientModal', ...clientModalStatus });
    if (clientModalStatus.open) {
        await page.evaluate(() => {
            const closeBtn = document.querySelector('.modal.show .btn-close, .modal.show [data-bs-dismiss="modal"]');
            if (closeBtn) closeBtn.click();
        });
        await sleep(500);
    }

    // Test navigating to Client Edit / View page
    console.log('Testing Client Edit / Detail route (/clients/1/edit or /clients/1)...');
    await page.goto(`${BASE_URL}/clients/1`, { waitUntil: 'networkidle2' });
    results.pagesAudited++;
    await sleep(1000);
    const clientDetailTitle = await page.title();
    console.log('Client 1 Title:', clientDetailTitle);

    // Test tabs in Client Edit (Details, Privacy, Addresses, etc.)
    const clientTabs = await page.evaluate(() => {
        const tabs = Array.from(document.querySelectorAll('ul.nav-tabs li a, [role="tab"], button.nav-link'));
        return tabs.map(t => t.innerText.trim());
    });
    console.log('Client Tabs:', clientTabs);
    for (const t of clientTabs) {
        if (!t) continue;
        await page.evaluate((tabName) => {
            const el = Array.from(document.querySelectorAll('ul.nav-tabs li a, [role="tab"], button.nav-link')).find(x => x.innerText.trim() === tabName);
            if (el) el.click();
        }, t);
        await sleep(500);
    }

    // ==========================================
    // 6. SUB-CLIENTS (/sub-clients)
    // ==========================================
    console.log('\n--- 6. Testing Sub Clients Page (/sub-clients) ---');
    await page.goto(`${BASE_URL}/sub-clients`, { waitUntil: 'networkidle2' });
    results.pagesAudited++;
    await sleep(1000);

    // Test "Add Sub Client" modal
    await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button, a')).find(b => b.innerText.includes('Add Sub Client') || b.innerText.includes('Create Sub Client'));
        if (btn) btn.click();
    });
    await sleep(800);
    const subClientModalStatus = await page.evaluate(() => {
        const m = document.querySelector('.modal.show, .modal[style*="display: block"]');
        return {
            open: !!m,
            title: m ? m.querySelector('.modal-title')?.innerText : null
        };
    });
    console.log('Add Sub Client Modal Status:', subClientModalStatus);
    results.modalTests.push({ modal: 'CreateSubClientModal', ...subClientModalStatus });
    if (subClientModalStatus.open) {
        await page.evaluate(() => {
            const closeBtn = document.querySelector('.modal.show .btn-close, .modal.show [data-bs-dismiss="modal"]');
            if (closeBtn) closeBtn.click();
        });
        await sleep(500);
    }

    // ==========================================
    // 7. VENDORS (/vendors)
    // ==========================================
    console.log('\n--- 7. Testing Vendors Page (/vendors) ---');
    await page.goto(`${BASE_URL}/vendors`, { waitUntil: 'networkidle2' });
    results.pagesAudited++;
    await sleep(1000);

    // Test Create Vendor modal
    await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button, a')).find(b => b.innerText.includes('Create Vendor'));
        if (btn) btn.click();
    });
    await sleep(800);
    const vendorModalStatus = await page.evaluate(() => {
        const m = document.querySelector('.modal.show, .modal[style*="display: block"]');
        return {
            open: !!m,
            title: m ? m.querySelector('.modal-title')?.innerText : null
        };
    });
    console.log('Create Vendor Modal Status:', vendorModalStatus);
    results.modalTests.push({ modal: 'CreateVendorModal', ...vendorModalStatus });
    if (vendorModalStatus.open) {
        await page.evaluate(() => {
            const closeBtn = document.querySelector('.modal.show .btn-close, .modal.show [data-bs-dismiss="modal"]');
            if (closeBtn) closeBtn.click();
        });
        await sleep(500);
    }

    // ==========================================
    // 8. INVOICES & GENERATE INVOICE WIZARD
    // ==========================================
    console.log('\n--- 8. Testing Invoices & Wizard (/invoices, /invoices/create, /invoices/1) ---');
    await page.goto(`${BASE_URL}/invoices`, { waitUntil: 'networkidle2' });
    results.pagesAudited++;
    await sleep(1000);

    console.log('Navigating to Generate Invoice wizard (/invoices/create)...');
    await page.goto(`${BASE_URL}/invoices/create`, { waitUntil: 'networkidle2' });
    results.pagesAudited++;
    await sleep(1000);

    // Test wizard steps
    const invoiceWizardSteps = await page.evaluate(() => {
        const steps = Array.from(document.querySelectorAll('.step-item, .wizard-step, ul.nav-pills li, .stepper li'));
        const btns = Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim());
        return {
            stepsCount: steps.length,
            buttons: btns
        };
    });
    console.log('Invoice Wizard Setup:', invoiceWizardSteps);

    console.log('Navigating to Invoice 1 (/invoices/1)...');
    await page.goto(`${BASE_URL}/invoices/1`, { waitUntil: 'networkidle2' });
    results.pagesAudited++;
    await sleep(1000);
    const invoice1Details = await page.evaluate(() => {
        const text = document.body.innerText;
        return {
            hasInvoiceNumber: text.includes('INV-VELOUR') || text.includes('INV-'),
            hasPrintBtn: !!Array.from(document.querySelectorAll('button, a')).find(b => b.innerText.includes('Print')),
            hasAmount: text.includes('AED') || text.includes('Total') || text.includes('$')
        };
    });
    console.log('Invoice 1 Details check:', invoice1Details);

    // ==========================================
    // 9. USERS, ROLES & PERMISSIONS
    // ==========================================
    console.log('\n--- 9. Testing Users, Roles & Permissions ---');
    await page.goto(`${BASE_URL}/users`, { waitUntil: 'networkidle2' });
    results.pagesAudited++;
    await sleep(1000);

    // Test Create User modal
    await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button, a')).find(b => b.innerText.includes('Create User'));
        if (btn) btn.click();
    });
    await sleep(800);
    const userModalStatus = await page.evaluate(() => {
        const m = document.querySelector('.modal.show, .modal[style*="display: block"]');
        return {
            open: !!m,
            title: m ? m.querySelector('.modal-title')?.innerText : null
        };
    });
    console.log('Create User Modal Status:', userModalStatus);
    results.modalTests.push({ modal: 'CreateUserModal', ...userModalStatus });
    if (userModalStatus.open) {
        await page.evaluate(() => {
            const closeBtn = document.querySelector('.modal.show .btn-close, .modal.show [data-bs-dismiss="modal"]');
            if (closeBtn) closeBtn.click();
        });
        await sleep(500);
    }

    // Test Roles
    await page.goto(`${BASE_URL}/roles`, { waitUntil: 'networkidle2' });
    results.pagesAudited++;
    await sleep(1000);

    // Test Create Role modal
    await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button, a')).find(b => b.innerText.includes('Create Role'));
        if (btn) btn.click();
    });
    await sleep(800);
    const roleModalStatus = await page.evaluate(() => {
        const m = document.querySelector('.modal.show, .modal[style*="display: block"]');
        return {
            open: !!m,
            title: m ? m.querySelector('.modal-title')?.innerText : null
        };
    });
    console.log('Create Role Modal Status:', roleModalStatus);
    results.modalTests.push({ modal: 'CreateRoleModal', ...roleModalStatus });
    if (roleModalStatus.open) {
        await page.evaluate(() => {
            const closeBtn = document.querySelector('.modal.show .btn-close, .modal.show [data-bs-dismiss="modal"]');
            if (closeBtn) closeBtn.click();
        });
        await sleep(500);
    }

    // Test Permissions Matrix (/roles/1/permissions)
    console.log('Navigating to Role 1 Permissions Matrix (/roles/1/permissions)...');
    await page.goto(`${BASE_URL}/roles/1/permissions`, { waitUntil: 'networkidle2' });
    results.pagesAudited++;
    await sleep(1000);
    const permMatrix = await page.evaluate(() => {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Save') || b.innerText.includes('Update'));
        return {
            checkboxesCount: checkboxes.length,
            hasSaveButton: !!saveBtn
        };
    });
    console.log('Permissions Matrix Status:', permMatrix);

    // ==========================================
    // 10. BANK ACCOUNTS & SETTINGS
    // ==========================================
    console.log('\n--- 10. Testing Bank Accounts & Settings ---');
    await page.goto(`${BASE_URL}/bank-accounts`, { waitUntil: 'networkidle2' });
    results.pagesAudited++;
    await sleep(1000);

    // Test Add Account Modal
    await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button, a')).find(b => b.innerText.includes('Add account') || b.innerText.includes('Add Account'));
        if (btn) btn.click();
    });
    await sleep(800);
    const bankModalStatus = await page.evaluate(() => {
        const m = document.querySelector('.modal.show, .modal[style*="display: block"]');
        return {
            open: !!m,
            title: m ? m.querySelector('.modal-title')?.innerText : null
        };
    });
    console.log('Add Bank Account Modal Status:', bankModalStatus);
    results.modalTests.push({ modal: 'AddBankAccountModal', ...bankModalStatus });
    if (bankModalStatus.open) {
        await page.evaluate(() => {
            const closeBtn = document.querySelector('.modal.show .btn-close, .modal.show [data-bs-dismiss="modal"]');
            if (closeBtn) closeBtn.click();
        });
        await sleep(500);
    }

    // Stripe Platform
    await page.goto(`${BASE_URL}/settings/stripe-platform`, { waitUntil: 'networkidle2' });
    results.pagesAudited++;
    await sleep(800);

    // Stripe Connect
    await page.goto(`${BASE_URL}/settings/stripe-connect`, { waitUntil: 'networkidle2' });
    results.pagesAudited++;
    await sleep(800);

    // Client API Credentials
    await page.goto(`${BASE_URL}/settings/client-api-credentials`, { waitUntil: 'networkidle2' });
    results.pagesAudited++;
    await sleep(800);
    await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button, a')).find(b => b.innerText.includes('Add Credential'));
        if (btn) btn.click();
    });
    await sleep(800);
    const credModalStatus = await page.evaluate(() => {
        const m = document.querySelector('.modal.show, .modal[style*="display: block"]');
        return {
            open: !!m,
            title: m ? m.querySelector('.modal-title')?.innerText : null
        };
    });
    console.log('Add Credential Modal Status:', credModalStatus);
    results.modalTests.push({ modal: 'AddCredentialModal', ...credModalStatus });
    if (credModalStatus.open) {
        await page.evaluate(() => {
            const closeBtn = document.querySelector('.modal.show .btn-close, .modal.show [data-bs-dismiss="modal"]');
            if (closeBtn) closeBtn.click();
        });
        await sleep(500);
    }

    // ==========================================
    // 11. MESSAGES (/messages)
    // ==========================================
    console.log('\n--- 11. Testing Messages Page (/messages) ---');
    await page.goto(`${BASE_URL}/messages`, { waitUntil: 'networkidle2' });
    results.pagesAudited++;
    await sleep(1200);
    const messagesStatus = await page.evaluate(() => {
        const contacts = document.querySelectorAll('.chat-user-list li, .chat-list li, .list-group-item');
        const input = document.querySelector('input[placeholder*="message"], textarea[placeholder*="message"]');
        const sendBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Send') || b.querySelector('i.ri-send-plane-2-fill, i.ri-send-plane-fill'));
        return {
            contactsCount: contacts.length,
            hasInput: !!input,
            hasSendBtn: !!sendBtn
        };
    });
    console.log('Messages Page Status:', messagesStatus);

    // ==========================================
    // 12. RESPONSIVE BREAKPOINT AUDIT
    // ==========================================
    console.log('\n--- 12. Responsive Breakpoint Checks (375px, 768px, 1440px) ---');
    const viewports = [
        { name: 'Mobile (375x667)', width: 375, height: 667 },
        { name: 'Tablet (768x1024)', width: 768, height: 1024 },
        { name: 'Desktop (1440x900)', width: 1440, height: 900 }
    ];

    const testPages = ['/dashboard', '/cases', '/cases/1/view', '/invoices'];
    for (const vp of viewports) {
        await page.setViewport({ width: vp.width, height: vp.height });
        for (const p of testPages) {
            await page.goto(`${BASE_URL}${p}`, { waitUntil: 'networkidle2' });
            await sleep(500);
            const overflow = await page.evaluate(() => {
                const docWidth = document.documentElement.offsetWidth;
                const scrollWidth = document.documentElement.scrollWidth;
                return {
                    hasHorizontalScroll: scrollWidth > docWidth + 5,
                    docWidth,
                    scrollWidth
                };
            });
            if (overflow.hasHorizontalScroll) {
                results.responsiveGlitches.push({
                    viewport: vp.name,
                    page: p,
                    overflow: `${overflow.scrollWidth}px > ${overflow.docWidth}px`
                });
                console.log(`[RESPONSIVE OVERFLOW] ${vp.name} on ${p}: scrollWidth ${overflow.scrollWidth} > ${overflow.docWidth}`);
            }
        }
    }

    await browser.close();

    console.log('\n================ AUDIT RESULTS SUMMARY ================');
    console.log(`Total Pages Audited: ${results.pagesAudited}`);
    console.log(`Total Console Errors Caught: ${results.consoleErrors.length}`);
    console.log(`Total Network Failures Caught: ${results.networkErrors.length}`);
    console.log(`Total Modals Verified: ${results.modalTests.length}`);
    console.log(`Total Responsive Glitches: ${results.responsiveGlitches.length}`);

    fs.writeFileSync(
        path.join(__dirname, 'audit_report_raw.json'),
        JSON.stringify(results, null, 2),
        'utf8'
    );
    console.log('Raw audit report saved to audit_report_raw.json');
}

runAudit().catch(err => {
    console.error('Audit run failed:', err);
});
