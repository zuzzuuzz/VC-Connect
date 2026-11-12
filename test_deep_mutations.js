const puppeteer = require('puppeteer-core');
const fs = require('fs');

const BASE_URL = 'http://localhost:8000';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function testMutations() {
    console.log('=== COMPREHENSIVE MUTATION & FEATURE INTEGRITY TEST ===\n');

    const browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    const errors = [];
    const failedApis = [];

    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push({ url: page.url(), text: msg.text() });
            console.log(`[CONSOLE ERR] ${msg.text().slice(0, 160)}`);
        }
    });

    page.on('response', resp => {
        if (resp.status() >= 400) {
            failedApis.push({ url: resp.url(), status: resp.status() });
            console.log(`[API FAIL ${resp.status()}] ${resp.url()}`);
        }
    });

    // ==========================================
    // 1. ADD NEW CASE WIZARD END-TO-END
    // ==========================================
    console.log('\n--- 1. Testing Add New Case Wizard Multi-Step Submission ---');
    await page.goto(`${BASE_URL}/cases`, { waitUntil: 'networkidle2' });
    await sleep(1500);

    // Click "Add New Case"
    await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Add New Case'));
        if (btn) btn.click();
    });
    await sleep(1000);

    // Check wizard step 1
    const step1Check = await page.evaluate(() => {
        const modal = document.querySelector('.modal.show');
        if (!modal) return { open: false };

        // Select client dropdown
        const clientSelect = modal.querySelector('select[name="client_id"], select#client_id, select');
        return {
            open: true,
            hasClientSelect: !!clientSelect,
            clientOptions: clientSelect ? Array.from(clientSelect.options).map(o => ({ val: o.value, text: o.text })) : [],
            inputs: Array.from(modal.querySelectorAll('input, select, textarea')).map(i => i.placeholder || i.name || i.id).filter(Boolean)
        };
    });
    console.log('Wizard Step 1 Form fields:', step1Check);

    // Fill Step 1 fields
    console.log('Filling Step 1 patient & case details...');
    const filledStep1 = await page.evaluate(() => {
        const modal = document.querySelector('.modal.show');
        if (!modal) return false;

        // Fill Patient Name
        const nameInput = modal.querySelector('input[placeholder*="Patient Name"], input[name="patient_name"], input#patient_name') || modal.querySelectorAll('input[type="text"]')[0];
        if (nameInput) {
            nameInput.value = 'Sara Al-Maktoum';
            nameInput.dispatchEvent(new Event('input', { bubbles: true }));
        }

        // Fill Age
        const ageInput = modal.querySelector('input[type="number"], input[placeholder*="Age"]');
        if (ageInput) {
            ageInput.value = '28';
            ageInput.dispatchEvent(new Event('input', { bubbles: true }));
        }

        // Click next button
        const nextBtn = Array.from(modal.querySelectorAll('button')).find(b => b.innerText.trim() === 'Next' || b.innerText.includes('Next'));
        if (nextBtn) {
            nextBtn.click();
            return true;
        }
        return false;
    });
    console.log('Step 1 Next clicked:', filledStep1);
    await sleep(1200);

    // Check if on Step 2 or if validation prevented it
    const wizardAfterNext = await page.evaluate(() => {
        const modal = document.querySelector('.modal.show');
        const errors = Array.from(modal?.querySelectorAll('.text-danger, .invalid-feedback') || []).map(e => e.innerText.trim()).filter(Boolean);
        const header = modal?.querySelector('.wizard-step-active, .active, h5, .step-title')?.innerText;
        return {
            header,
            validationErrors: errors
        };
    });
    console.log('Wizard state after Next:', wizardAfterNext);

    // Close wizard modal
    await page.evaluate(() => {
        const c = document.querySelector('.modal.show .btn-close, .modal.show [data-bs-dismiss="modal"]');
        if (c) c.click();
    });
    await sleep(500);

    // ==========================================
    // 2. CASE DETAIL COMMENT COMPOSER TEST
    // ==========================================
    console.log('\n--- 2. Testing Case Detail Comment Submission ---');
    await page.goto(`${BASE_URL}/cases/1/view`, { waitUntil: 'networkidle2' });
    await sleep(1500);

    const commentSubmissionResult = await page.evaluate(async () => {
        const composer = document.querySelector('.comment-composer');
        if (!composer) return { found: false };

        const textarea = composer.querySelector('textarea, [contenteditable="true"]');
        const sendBtn = composer.querySelector('.comment-composer__send');

        if (!textarea || !sendBtn) return { found: true, hasControls: false };

        textarea.value = 'Urgent QA test note: check molar alignment';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));

        sendBtn.click();
        return { found: true, submitted: true };
    });
    console.log('Comment submission trigger:', commentSubmissionResult);
    await sleep(1500);

    // Verify if comment appears or if network error occurred
    const commentsInDom = await page.evaluate(() => {
        const text = document.body.innerText;
        return {
            containsComment: text.includes('Urgent QA test note: check molar alignment'),
            totalCommentsCount: document.querySelectorAll('.comment-item, .discussion-item, .chat-message').length
        };
    });
    console.log('Comment verification in DOM:', commentsInDom);

    // ==========================================
    // 3. PLAN DOCUMENT EDITOR: PDF GENERATION & SAVE
    // ==========================================
    console.log('\n--- 3. Testing Plan Document Editor Actions ---');
    await page.goto(`${BASE_URL}/cases/1/treatment-plans/1/document`, { waitUntil: 'networkidle2' });
    await sleep(1500);

    // Test "Save & Generate PDF" button
    console.log('Testing "Save & Generate PDF" button click...');
    const pdfSaveResult = await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Save & Generate PDF'));
        if (btn) {
            btn.click();
            return { clicked: true };
        }
        return { clicked: false };
    });
    console.log('Save & Generate PDF click result:', pdfSaveResult);
    await sleep(2000);

    // Check for alerts or swal toasts
    const swalAlert = await page.evaluate(() => {
        const swal = document.querySelector('.swal2-container, .alert, .toast');
        return swal ? swal.innerText.replace(/\s+/g, ' ') : null;
    });
    console.log('Alert after PDF save:', swalAlert);

    // Test "View Saved PDF"
    console.log('Testing "View Saved PDF" button...');
    const viewPdfBtn = await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button, a')).find(b => b.innerText.includes('View Saved PDF'));
        return {
            found: !!btn,
            href: btn?.getAttribute('href'),
            target: btn?.getAttribute('target')
        };
    });
    console.log('View Saved PDF button info:', viewPdfBtn);

    // ==========================================
    // 4. ROLES & PERMISSIONS SAVE
    // ==========================================
    console.log('\n--- 4. Testing Role Permissions Matrix Save ---');
    await page.goto(`${BASE_URL}/roles/1/permissions`, { waitUntil: 'networkidle2' });
    await sleep(1200);

    const permSaveResult = await page.evaluate(() => {
        const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Save') || b.innerText.includes('Update'));
        if (saveBtn) {
            saveBtn.click();
            return { clicked: true };
        }
        return { clicked: false };
    });
    console.log('Save Permissions click result:', permSaveResult);
    await sleep(1500);
    const permSwal = await page.evaluate(() => {
        const s = document.querySelector('.swal2-container, .alert');
        return s ? s.innerText.replace(/\s+/g, ' ') : null;
    });
    console.log('Permissions Save feedback:', permSwal);

    // ==========================================
    // 5. PROFILE SWITCHING TEST
    // ==========================================
    console.log('\n--- 5. Testing Profile Switcher ---');
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle2' });
    await sleep(1000);

    const rolesToTest = ['Doctor (Clinic)', 'CAD Planner', 'Lab (Vendor)', 'Super Admin'];
    for (const rName of rolesToTest) {
        console.log(`Switching profile to: "${rName}"...`);
        const switchClicked = await page.evaluate((role) => {
            const btns = Array.from(document.querySelectorAll('button, a'));
            const b = btns.find(x => x.innerText.trim() === role);
            if (b) { b.click(); return true; }
            return false;
        }, rName);
        await sleep(1200);
        const currentTitle = await page.title();
        const activeUserBadge = await page.evaluate(() => {
            const user = document.querySelector('.user-name-text, .header-item .fw-semibold');
            return user?.innerText || null;
        });
        console.log(`Role switch "${rName}" -> clicked: ${switchClicked}, title: "${currentTitle}", user: "${activeUserBadge}"`);
    }

    console.log('\n================ SUMMARY OF MUTATION AUDIT ================');
    console.log(`Total Uncaught Console Errors: ${errors.length}`);
    console.log(`Total Failed API Calls: ${failedApis.length}`);
    if (failedApis.length > 0) {
        console.log('Failed APIs:');
        failedApis.forEach(f => console.log(`  [${f.status}] ${f.url}`));
    }
    if (errors.length > 0) {
        console.log('Console Errors:');
        errors.forEach(e => console.log(`  [${e.url}] ${e.text}`));
    }

    await browser.close();
}

testMutations().catch(console.error);
