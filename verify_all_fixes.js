const puppeteer = require('puppeteer-core');
const http = require('http');

const BASE_URL = 'http://localhost:8000';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function req(path, method = 'GET', body = null, isMultipart = false) {
    return new Promise((resolve) => {
        let payload = null;
        let headers = {
            'Accept': 'application/json',
            'Authorization': 'Bearer velourcare-jwt-bearer-1'
        };

        if (isMultipart && body) {
            const boundary = '----WebKitFormBoundaryQA123456';
            let data = '';
            for (const [k, v] of Object.entries(body)) {
                data += `--${boundary}\r\nContent-Disposition: form-data; name="${k}"\r\n\r\n${v}\r\n`;
            }
            data += `--${boundary}--\r\n`;
            payload = Buffer.from(data);
            headers['Content-Type'] = `multipart/form-data; boundary=${boundary}`;
            headers['Content-Length'] = payload.length;
        } else if (body) {
            payload = Buffer.from(JSON.stringify(body));
            headers['Content-Type'] = 'application/json';
            headers['Content-Length'] = payload.length;
        }

        const options = {
            hostname: 'localhost',
            port: 8000,
            path: path,
            method: method,
            headers: headers
        };

        const r = http.request(options, (res) => {
            let resBody = '';
            res.on('data', chunk => resBody += chunk);
            res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: resBody }));
        });
        r.on('error', err => resolve({ status: 'ERR', error: err.message }));
        if (payload) r.write(payload);
        r.end();
    });
}

async function verifyAllFixes() {
    console.log('====================================================');
    console.log('VERIFYING ALL FIXES ACROSS VELOURCARE ORTHO CLOUD');
    console.log('====================================================\n');

    const results = [];

    // 1. Verify store-in-pipeline no longer returns VELOUR-NaN
    console.log('1. Testing POST /api/cases/store-in-pipeline...');
    const caseRes = await req('/api/cases/store-in-pipeline', 'POST', {
        patient_name: 'Layla Al-Khatib',
        patient_gender: 'Female',
        patient_age: '30',
        client_id: 1,
        category: 'Aligners'
    });
    const caseData = JSON.parse(caseRes.body || '{}');
    const caseIdValid = caseData.data?.case_id && !caseData.data.case_id.includes('NaN');
    console.log(`   -> Status: ${caseRes.status}, Case ID: "${caseData.data?.case_id}", Patient: "${caseData.data?.patient_name}"`);
    results.push({ test: 'Case Creation Pipeline (No NaN)', pass: caseRes.status === 200 && caseIdValid });

    // 2. Verify Roles CRUD
    console.log('\n2. Testing Roles CRUD Endpoints...');
    const createRoleRes = await req('/api/roles', 'POST', {
        name: 'Chief Clinical Supervisor',
        permissions: ['view_cases', 'view_clients', 'edit_cases']
    });
    console.log(`   -> POST /api/roles: ${createRoleRes.status} (Body: ${createRoleRes.body.slice(0, 100)})`);

    const roleData = JSON.parse(createRoleRes.body || '{}');
    const newRoleId = roleData.data?.id;

    let rolePutStatus = 0;
    let roleDeleteStatus = 0;
    if (newRoleId) {
        const updateRoleRes = await req(`/api/roles/${newRoleId}`, 'PUT', { name: 'Senior Clinical Supervisor' });
        rolePutStatus = updateRoleRes.status;
        console.log(`   -> PUT /api/roles/${newRoleId}: ${updateRoleRes.status}`);

        const deleteRoleRes = await req(`/api/roles/${newRoleId}`, 'DELETE');
        roleDeleteStatus = deleteRoleRes.status;
        console.log(`   -> DELETE /api/roles/${newRoleId}: ${deleteRoleRes.status}`);
    }
    results.push({ test: 'Roles CRUD Complete', pass: createRoleRes.status === 201 && rolePutStatus === 200 && roleDeleteStatus === 200 });

    // 3. Verify Test Email Endpoint
    console.log('\n3. Testing POST /notifications/send-test-email...');
    const emailRes = await req('/notifications/send-test-email', 'POST', {
        email: 'doctor@velourcare.com',
        subject: 'VelourCare Ortho Test Notification',
        message: 'All systems verified'
    });
    console.log(`   -> Status: ${emailRes.status}, Response: ${emailRes.body.slice(0, 120)}`);
    results.push({ test: 'Test Email Notification Endpoint', pass: emailRes.status === 200 });

    // 4. Verify Case Comments with Multipart & Persistence
    console.log('\n4. Testing Case Comments with Multipart POST & GET...');
    const commentPostRes = await req('/api/cases/1/comments', 'POST', {
        content: 'Clinical review completed: lower anterior aligners approved for thermoforming.',
        is_client_specific: 'No',
        is_vendor_specific: 'No'
    }, true);
    console.log(`   -> POST /api/cases/1/comments (Multipart): ${commentPostRes.status}`);

    const commentsGetRes = await req('/api/cases/1/comments', 'GET');
    const getCommentsData = JSON.parse(commentsGetRes.body || '{}');
    const hasPostedComment = (getCommentsData.data || []).some(c => c.content?.includes('lower anterior aligners approved'));
    console.log(`   -> GET /api/cases/1/comments count: ${getCommentsData.data?.length}, Verified in list: ${hasPostedComment}`);
    results.push({ test: 'Comments Multipart Ingestion & Persistence', pass: commentPostRes.status === 201 && hasPostedComment });

    // 5. Verify Direct Client Route Redirect
    console.log('\n5. Testing Direct Client Navigation Redirect (/clients/1 -> /clients/1/edit)...');
    const redirectRes = await new Promise((resolve) => {
        const r = http.request({
            hostname: 'localhost',
            port: 8000,
            path: '/clients/1',
            method: 'GET',
            headers: { 'Accept': 'text/html' }
        }, res => {
            resolve({ status: res.statusCode, location: res.headers.location });
        });
        r.end();
    });
    console.log(`   -> GET /clients/1 returned: ${redirectRes.status}, Location: ${redirectRes.location}`);
    results.push({ test: 'Client Direct Route Redirect', pass: redirectRes.status === 302 && redirectRes.location === '/clients/1/edit' });

    // 6. Verify Browser-side 404 Page Branding & Email Modal in Puppeteer
    console.log('\n6. Testing In-Browser 404 Title & Test Email Modal UI in Puppeteer...');
    const browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: 'new',
        args: ['--no-sandbox']
    });
    const page = await browser.newPage();

    await page.goto(`${BASE_URL}/non-existent-page-404-test`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));
    const pageTitle = await page.title();
    console.log(`   -> 404 Page Title: "${pageTitle}"`);
    const titleClean = !pageTitle.includes('SmileGenix') && pageTitle.includes('VelourCare Ortho');

    // Test Dashboard Test Email Modal UI
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));
    await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Test Email'));
        if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // Fill and submit email modal
    console.log('   Submitting Test Email modal from UI...');
    await page.evaluate(() => {
        const modal = document.querySelector('.modal.show');
        if (modal) {
            const emailInput = modal.querySelector('input[type="email"], input[placeholder*="example.com"]');
            const subjInput = modal.querySelector('input[placeholder*="Notification"], input[id*="subject"]');
            const msgInput = modal.querySelector('textarea');
            if (emailInput) {
                emailInput.value = 'doctor@velourcare.com';
                emailInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
            if (subjInput) {
                subjInput.value = 'QA Verification Notification';
                subjInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
            if (msgInput) {
                msgInput.value = 'Everything is fully working.';
                msgInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
            const sendBtn = Array.from(modal.querySelectorAll('button')).find(b => b.innerText.includes('Send') || b.querySelector('i.ri-mail-send-line'));
            if (sendBtn) sendBtn.click();
        }
    });
    await new Promise(r => setTimeout(r, 1500));

    const swalSuccess = await page.evaluate(() => {
        const s = document.querySelector('.swal2-container, .alert-success');
        return s ? s.innerText.replace(/\s+/g, ' ') : null;
    });
    console.log(`   -> UI Feedback after sending email: "${swalSuccess}"`);
    const emailUiPass = swalSuccess && swalSuccess.toLowerCase().includes('success');

    await browser.close();
    results.push({ test: '404 Title Clean of SmileGenix', pass: titleClean });
    results.push({ test: 'Dashboard Test Email Modal UI Submission', pass: !!emailUiPass });

    console.log('\n================ FINAL RESULTS SUMMARY ================');
    results.forEach(r => {
        console.log(`${r.pass ? '✅ PASS' : '❌ FAIL'}: ${r.test}`);
    });
    const allPassed = results.every(r => r.pass);
    console.log(`\nOverall Verdict: ${allPassed ? 'ALL FIXES 100% VERIFIED & PASSED!' : 'SOME TESTS FAILED'}`);
}

verifyAllFixes().catch(console.error);
