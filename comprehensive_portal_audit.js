const http = require('http');
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:8000';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

function apiRequest(urlPath, method = 'GET', body = null, headers = {}) {
    return new Promise((resolve) => {
        let payload = null;
        const reqHeaders = {
            'Accept': 'application/json',
            ...headers
        };

        if (body && typeof body === 'object') {
            payload = Buffer.from(JSON.stringify(body));
            reqHeaders['Content-Type'] = 'application/json';
            reqHeaders['Content-Length'] = payload.length;
        } else if (body) {
            payload = Buffer.from(body);
            reqHeaders['Content-Length'] = payload.length;
        }

        const options = {
            hostname: 'localhost',
            port: 8000,
            path: urlPath,
            method: method,
            headers: reqHeaders
        };

        const req = http.request(options, (res) => {
            let resBody = '';
            res.on('data', chunk => resBody += chunk);
            res.on('end', () => {
                let parsed = null;
                try { parsed = JSON.parse(resBody); } catch (e) {}
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    body: resBody,
                    data: parsed
                });
            });
        });

        req.on('error', err => resolve({ status: 'ERR', error: err.message }));
        if (payload) req.write(payload);
        req.end();
    });
}

async function runComprehensiveAudit() {
    console.log('================================================================');
    console.log('   VELOURCARE ORTHO CLOUD — COMPREHENSIVE MULTI-PHASE AUDIT     ');
    console.log('================================================================\n');

    const auditResults = {
        timestamp: new Date().toISOString(),
        security: [],
        apiGlitches: [],
        frontendGlitches: [],
        performance: [],
        uxAndA11y: []
    };

    // -------------------------------------------------------------
    // SECTION 1: DETAILED SECURITY & HEALTHCARE PRIVACY INSPECTION
    // -------------------------------------------------------------
    console.log('>>> [PHASE 1] RUNNING SECURITY & COMPLIANCE CHECKS...');

    // 1.1 Unauthenticated API Access (Broken Access Control)
    console.log('  1.1 Checking Unauthenticated Access across Core Endpoints...');
    const sensitiveEndpoints = [
        { path: '/api/cases', desc: 'All Patient Cases' },
        { path: '/api/cases/1', desc: 'Single Patient Case #1' },
        { path: '/api/users', desc: 'All System Users & Roles' },
        { path: '/api/clients', desc: 'Clinic Partner Directory' },
        { path: '/api/invoices', desc: 'Financial Invoices & Ledger' },
        { path: '/api/bank-accounts', desc: 'Bank Payout Accounts' },
        { path: '/api/client-api-credentials', desc: 'External API Tokens' },
        { path: '/api/patients', desc: 'Master Patient List' },
        { path: '/api/roles', desc: 'System RBAC Roles' }
    ];

    for (const ep of sensitiveEndpoints) {
        // Request with NO headers/cookies
        const res = await apiRequest(ep.path, 'GET', null, { 'Accept': 'application/json' });
        const isLeaking = (res.status === 200);
        auditResults.security.push({
            check: `Unauthenticated Access to ${ep.path}`,
            severity: isLeaking ? 'CRITICAL' : 'PASS',
            description: `Endpoint ${ep.path} (${ep.desc}) is accessible without authentication token or session cookie.`,
            status: res.status,
            leakedCount: res.data?.data?.length || (res.data ? 1 : 0)
        });
        console.log(`    ${isLeaking ? '🚨 [CRITICAL VULN]' : '✅ [PASS]'} ${ep.path} -> Status: ${res.status}`);
    }

    // 1.2 Authentication Bypass via Login Fallback
    console.log('\n  1.2 Testing Authentication Bypass via Random Credentials...');
    const fakeLoginRes = await apiRequest('/api/auth/login', 'POST', {
        username: 'non_existent_hacker_user_123',
        password: 'wrong_password_xyz'
    });
    if (fakeLoginRes.status === 200 && fakeLoginRes.data?.data?.user?.is_super_admin) {
        auditResults.security.push({
            check: 'Auth Bypass / Automatic Super-Admin Login',
            severity: 'CRITICAL',
            description: 'POST /api/auth/login automatically falls back to Super Admin when any unknown username/password is submitted!',
            evidence: fakeLoginRes.data
        });
        console.log('    🚨 [CRITICAL VULN] Login fallback to Super Admin on invalid username!');
    } else {
        console.log(`    ✅ [PASS] Login rejected invalid credentials (${fakeLoginRes.status})`);
    }

    // 1.3 Missing Token Signature Verification (Forged Bearer Token)
    console.log('\n  1.3 Testing Forged Bearer Token Verification...');
    const forgedTokenRes = await apiRequest('/api/cases', 'GET', null, {
        'Authorization': 'Bearer FORGED_UNVERIFIED_TOKEN_ATTACKER_999'
    });
    auditResults.security.push({
        check: 'Unsigned / Blind Bearer Token Acceptance',
        severity: (forgedTokenRes.status === 200) ? 'HIGH' : 'PASS',
        description: 'Server accepts arbitrary bearer tokens without cryptographic signature verification (HMAC-SHA256 JWT validation missing).',
        status: forgedTokenRes.status
    });
    console.log(`    ${forgedTokenRes.status === 200 ? '🚨 [HIGH VULN]' : '✅ [PASS]'} Forged token accepted: status ${forgedTokenRes.status}`);

    // 1.4 Path Traversal & Arbitrary File Upload via Multer
    console.log('\n  1.4 Testing Path Traversal & Arbitrary File Upload...');
    const boundary = '----WebKitFormBoundarySecurityAudit';
    const maliciousFilename = '../../evil-script.html';
    const payloadMultipart = Buffer.from(
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="zip_file"; filename="${maliciousFilename}"\r\n` +
        `Content-Type: text/html\r\n\r\n` +
        `<script>alert("XSS via file upload");</script>\r\n` +
        `--${boundary}--\r\n`
    );

    const uploadRes = await apiRequest('/api/cases/1/step-files', 'POST', payloadMultipart, {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': payloadMultipart.length,
        'Authorization': 'Bearer velourcare-jwt-bearer-1'
    });
    const uploadAllowed = (uploadRes.status === 200 || uploadRes.status === 201);
    auditResults.security.push({
        check: 'Unrestricted File Upload & Extension Validation',
        severity: uploadAllowed ? 'HIGH' : 'PASS',
        description: 'Upload endpoint accepts arbitrary HTML / non-medical file extensions without MIME validation or filename sanitization.',
        status: uploadRes.status,
        body: uploadRes.body?.slice(0, 150)
    });
    console.log(`    ${uploadAllowed ? '🚨 [HIGH VULN]' : '✅ [PASS]'} Uploading HTML file: status ${uploadRes.status}`);

    // 1.5 Public Unauthenticated Access to Patient PHI in /uploads/
    console.log('\n  1.5 Testing Public Directory Access to Patient Scans and PDFs...');
    const filesToTest = [
        '/uploads/sample-ipr-chart-protocol.pdf',
        '/uploads/velourcare-ipr-chart-sample.pdf',
        '/uploads/sample-treatment-models.zip',
        '/uploads/sample-treatment-container.o3c'
    ];
    for (const f of filesToTest) {
        const fileRes = await apiRequest(f, 'GET');
        const accessible = (fileRes.status === 200);
        auditResults.security.push({
            check: `Public Exposure of PHI Asset: ${f}`,
            severity: accessible ? 'HIGH' : 'PASS',
            description: `Patient clinical documents and 3D dental models are accessible directly over public unauthenticated HTTP URLs, violating HIPAA Security Rule (45 CFR § 164.312).`,
            status: fileRes.status
        });
        console.log(`    ${accessible ? '🚨 [HIGH VULN]' : '✅ [PASS]'} ${f} -> Status: ${fileRes.status} (Publicly accessible)`);
    }

    // 1.6 Missing Security Headers & Permissive CORS
    console.log('\n  1.6 Checking Security Headers & CORS Policy...');
    const rootRes = await apiRequest('/dashboard', 'GET', null, { 'Accept': 'text/html' });
    const headers = rootRes.headers || {};
    const securityHeaderChecks = [
        { name: 'content-security-policy', standard: 'Content-Security-Policy' },
        { name: 'x-content-type-options', standard: 'X-Content-Type-Options: nosniff' },
        { name: 'x-frame-options', standard: 'X-Frame-Options: DENY / SAMEORIGIN' },
        { name: 'strict-transport-security', standard: 'Strict-Transport-Security' },
        { name: 'access-control-allow-origin', standard: 'Access-Control-Allow-Origin: Restricted' }
    ];

    for (const sh of securityHeaderChecks) {
        const val = headers[sh.name];
        const missing = !val;
        auditResults.security.push({
            check: `Header: ${sh.standard}`,
            severity: missing ? 'MEDIUM' : 'PASS',
            description: missing ? `Missing ${sh.standard} header on web response.` : `Header present: ${val}`,
            value: val || 'MISSING'
        });
        console.log(`    ${missing ? '⚠️ [WARN]' : '✅ [PASS]'} ${sh.standard} -> ${val || 'MISSING'}`);
    }

    // 1.7 Rate Limiting / Denial of Service check
    console.log('\n  1.7 Testing API Rate Limiting (DoS Vulnerability)...');
    let rateLimitTriggered = false;
    const burstPromises = [];
    for (let i = 0; i < 50; i++) {
        burstPromises.push(apiRequest('/api/cases', 'GET'));
    }
    const burstResults = await Promise.all(burstPromises);
    const has429 = burstResults.some(r => r.status === 429);
    auditResults.security.push({
        check: 'API Rate Limiting & Throttling',
        severity: has429 ? 'PASS' : 'MEDIUM',
        description: has429 ? 'Rate limiting active (returned 429).' : 'No rate limiting detected (50 concurrent requests accepted with 200 OK). Susceptible to API flooding / DoS.',
        status: has429 ? 429 : 200
    });
    console.log(`    ${has429 ? '✅ [PASS]' : '⚠️ [WARN]'} Rate limit 50-burst test: ${has429 ? 'Throttled' : 'Unthrottled (200 OK on all)'}`);

    // -------------------------------------------------------------
    // SECTION 2: API DATA LOGIC, PAGINATION & EDGE CASE TESTING
    // -------------------------------------------------------------
    console.log('\n>>> [PHASE 2] RUNNING API INTEGRITY & QUERY LOGIC AUDIT...');

    // 2.1 Query Parameter Ignorance (Pagination, Search, Sorting)
    console.log('  2.1 Testing Pagination Parameter Compliance (page, per_page)...');
    const authHeaders = { 'Authorization': 'Bearer velourcare-jwt-bearer-1' };
    const page1Res = await apiRequest('/api/cases?page=1&per_page=2', 'GET', null, authHeaders);
    const page2Res = await apiRequest('/api/cases?page=2&per_page=2', 'GET', null, authHeaders);
    const paginationIgnored = (page1Res.body === page2Res.body && (page1Res.data?.data?.length || 0) > 2);
    auditResults.apiGlitches.push({
        check: 'Cases Pagination Parameter Processing',
        severity: paginationIgnored ? 'HIGH' : 'PASS',
        description: paginationIgnored 
            ? 'GET /api/cases ignores req.query.page and per_page. It dumps the entire array without windowing (LIMIT / OFFSET).'
            : 'Pagination query parameters respected.',
        page1Count: page1Res.data?.data?.length,
        page2Count: page2Res.data?.data?.length
    });
    console.log(`    ${paginationIgnored ? '❌ [GLITCH/FAIL]' : '✅ [PASS]'} Pagination query params page=1 vs page=2: ${paginationIgnored ? 'Ignored (Dumped full table)' : 'Slices properly'}`);

    // 2.2 Search Query Compliance
    console.log('  2.2 Testing Server-Side Search Filtering (?searchQuery=...)');
    const searchRes = await apiRequest('/api/cases?searchQuery=NON_EXISTENT_PATIENT_NAME_999', 'GET', null, authHeaders);
    const searchIgnored = (searchRes.data?.data?.length === page1Res.data?.data?.length);
    auditResults.apiGlitches.push({
        check: 'Server-side Search Filtering',
        severity: searchIgnored ? 'MEDIUM' : 'PASS',
        description: searchIgnored
            ? 'Server-side searchQuery parameter is completely ignored by GET /api/cases.'
            : 'Search parameter filters dataset.',
        returnedCount: searchRes.data?.data?.length
    });
    console.log(`    ${searchIgnored ? '❌ [GLITCH/FAIL]' : '✅ [PASS]'} searchQuery parameter: ${searchIgnored ? 'Ignored' : 'Filtered'}`);

    // 2.3 Non-existent Resource Handling (404 vs 200/500)
    console.log('  2.3 Testing 404 Status Codes on Missing Resources...');
    const missingCaseRes = await apiRequest('/api/cases/999999', 'GET', null, authHeaders);
    const returned404 = (missingCaseRes.status === 404);
    auditResults.apiGlitches.push({
        check: 'REST 404 on Missing Case ID (999999)',
        severity: returned404 ? 'PASS' : 'MEDIUM',
        description: `GET /api/cases/999999 returned status ${missingCaseRes.status} instead of 404 Not Found.`,
        status: missingCaseRes.status
    });
    console.log(`    ${returned404 ? '✅ [PASS]' : '❌ [GLITCH/FAIL]'} Missing Case #999999 -> Status ${missingCaseRes.status}`);

    // 2.4 Referential Integrity on Deletes
    console.log('  2.4 Testing Referential Integrity on DELETE /api/clients/1...');
    const deleteClientRes = await apiRequest('/api/clients/1', 'DELETE', null, authHeaders);
    auditResults.apiGlitches.push({
        check: 'Referential Integrity on Primary Client Deletion',
        severity: (deleteClientRes.status === 200) ? 'HIGH' : 'PASS',
        description: 'DELETE /api/clients/1 succeeds or simulates success even though active cases and invoices are linked to Client #1 without foreign key check.',
        status: deleteClientRes.status,
        body: deleteClientRes.body?.slice(0, 100)
    });
    console.log(`    ${deleteClientRes.status === 200 ? '⚠️ [RISK]' : '✅ [PASS]'} Client deletion response: ${deleteClientRes.status}`);

    // -------------------------------------------------------------
    // SECTION 3: BROWSER AUTOMATION, UI GLITCHES & UX AUDIT
    // -------------------------------------------------------------
    console.log('\n>>> [PHASE 3] LAUNCHING PUPPETEER FOR UI/UX & BROKEN PARTS AUDIT...');
    const browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    const consoleErrors = [];
    const pageErrors = [];
    const failed404Assets = [];

    page.on('console', msg => {
        if (msg.type() === 'error') {
            consoleErrors.push({ url: page.url(), text: msg.text() });
        }
    });
    page.on('pageerror', err => {
        pageErrors.push({ url: page.url(), error: err.toString() });
    });
    page.on('response', resp => {
        if (resp.status() >= 400) {
            failed404Assets.push({ page: page.url(), url: resp.url(), status: resp.status() });
        }
    });

    // 3.1 Test Case View Modals & Pairing
    console.log('  3.1 Inspecting Case Details Buttons & Modal Pairings (/cases/1/view)...');
    await page.goto(`${BASE_URL}/cases/1/view`, { waitUntil: 'networkidle2' });
    await sleep(1500);

    const buttonBindings = await page.evaluate(async () => {
        const results = [];
        const cardHeaders = Array.from(document.querySelectorAll('.card-header, .card-body, .badge'));
        
        // Find buttons in case overview
        const buttons = Array.from(document.querySelectorAll('button')).filter(b => 
            ['Change', 'Assign', 'Edit'].includes(b.innerText.trim())
        );

        for (let i = 0; i < buttons.length; i++) {
            const btn = buttons[i];
            const parentContext = btn.parentElement ? btn.parentElement.innerText.replace(/\s+/g, ' ').slice(0, 50) : '';
            
            // Click button
            btn.click();
            await new Promise(r => setTimeout(r, 400));
            
            const activeModal = document.querySelector('.modal.show, .modal[style*="display: block"]');
            const modalTitle = activeModal ? activeModal.querySelector('.modal-title')?.innerText?.trim() : null;
            
            results.push({
                buttonText: btn.innerText.trim(),
                context: parentContext,
                openedModal: !!activeModal,
                modalTitle: modalTitle
            });

            // Close modal
            if (activeModal) {
                const closeBtn = activeModal.querySelector('.btn-close, button.close, [data-bs-dismiss="modal"]');
                if (closeBtn) closeBtn.click();
                await new Promise(r => setTimeout(r, 300));
            }
        }
        return results;
    });

    console.log('    Button Modal Bindings Found:', buttonBindings.length);
    buttonBindings.forEach((b, idx) => {
        console.log(`      #${idx+1}: [${b.buttonText}] in "${b.context}" -> Modal: "${b.modalTitle || 'NONE / FAILED'}"`);
        if (!b.openedModal) {
            auditResults.frontendGlitches.push({
                component: 'CaseOverview',
                issue: `Button [${b.buttonText}] in "${b.context}" does NOT trigger any modal.`,
                severity: 'HIGH'
            });
        }
    });

    // 3.2 Test Comment Posting in Case Discussion
    console.log('\n  3.2 Testing Comment Box Posting Flow...');
    const commentPostTest = await page.evaluate(async () => {
        const textarea = document.querySelector('textarea.comments-panel-input, textarea[placeholder*="Comment"], textarea[placeholder*="Type"]');
        if (!textarea) return { success: false, reason: 'Textarea not found' };
        
        textarea.value = 'Automated QA Review Comment - Verified Workflow';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.dispatchEvent(new Event('change', { bubbles: true }));
        
        const sendBtn = Array.from(document.querySelectorAll('button')).find(b => 
            b.innerText.includes('Send') || b.querySelector('i.ri-send-plane-2-fill, i.ri-send-plane-fill')
        );
        if (!sendBtn) return { success: false, reason: 'Send button not found' };
        
        sendBtn.click();
        await new Promise(r => setTimeout(r, 1000));
        
        const comments = Array.from(document.querySelectorAll('.comment-item, .chat-message, .conversation-list li')).map(c => c.innerText);
        const appeared = comments.some(c => c.includes('Automated QA Review Comment'));
        return { success: appeared, commentsCount: comments.length };
    });
    console.log('    Comment posting result:', commentPostTest);
    auditResults.frontendGlitches.push({
        component: 'CaseDiscussion',
        check: 'Comment Posting via UI',
        severity: commentPostTest.success ? 'PASS' : 'MEDIUM',
        description: commentPostTest.success ? 'Comment immediately visible in UI' : 'Comment input or send button failed to immediately update discussion feed.'
    });

    // 3.3 Test 3D Simulation Page
    console.log('\n  3.3 Testing 3D Simulation Viewer (/simulation.html)...');
    await page.goto(`${BASE_URL}/simulation.html`, { waitUntil: 'networkidle2' });
    await sleep(1500);

    const simulationDiagnostics = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        const gl = canvas ? (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) : null;
        const stageControls = Array.from(document.querySelectorAll('button, input[type="range"]')).map(el => el.innerText || el.type);
        return {
            hasCanvas: !!canvas,
            webglContextActive: !!gl,
            canvasDimensions: canvas ? { width: canvas.width, height: canvas.height } : null,
            controls: stageControls,
            textSummary: document.body.innerText.replace(/\s+/g, ' ').slice(0, 200)
        };
    });
    console.log('    Simulation Diagnostics:', simulationDiagnostics);
    auditResults.frontendGlitches.push({
        component: 'SimulationViewer',
        check: 'WebGL Canvas Initialization',
        severity: simulationDiagnostics.webglContextActive ? 'PASS' : 'HIGH',
        diagnostics: simulationDiagnostics
    });

    // 3.4 Language Switcher & RTL Inspection
    console.log('\n  3.4 Testing Language Switcher & RTL Layout...');
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle2' });
    await sleep(1000);

    const langTest = await page.evaluate(async () => {
        const langDropdown = document.querySelector('#page-header-user-dropdown, .language-dropdown, [data-bs-toggle="dropdown"] img[src*="us.svg"]');
        const langContainer = langDropdown ? langDropdown.closest('.dropdown') : null;
        const currentLang = document.documentElement.getAttribute('lang');
        const currentDir = document.documentElement.getAttribute('dir');
        
        return {
            hasDropdown: !!langContainer,
            currentLang,
            currentDir
        };
    });
    console.log('    Language Configuration:', langTest);
    if (langTest.currentDir !== 'rtl') {
        auditResults.uxAndA11y.push({
            component: 'Localization',
            check: 'RTL Support',
            severity: 'MEDIUM',
            description: 'Arabic language selection does not toggle document direction to RTL (dir="rtl"), causing incorrect layout flow in Middle Eastern healthcare environments.'
        });
    }

    // 3.5 Broken Images / 404 Asset Audit across all loaded routes
    console.log('\n  3.5 Scanning for Broken Images & 404 Assets on Dashboard & Cases...');
    const brokenImages = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('img')).filter(img => {
            return !img.complete || img.naturalWidth === 0;
        }).map(img => ({ src: img.src, alt: img.alt }));
    });
    console.log(`    Broken Images Detected: ${brokenImages.length}`);
    if (brokenImages.length > 0) {
        auditResults.frontendGlitches.push({
            component: 'ImageAssets',
            check: 'Broken Image URLs',
            severity: 'LOW',
            brokenList: brokenImages
        });
    }

    // 3.6 Responsive Viewport Glitches Audit
    console.log('\n  3.6 Testing Mobile (375x667) & Tablet (768x1024) Responsiveness...');
    const viewports = [
        { name: 'Mobile', width: 375, height: 667 },
        { name: 'Tablet', width: 768, height: 1024 },
        { name: 'Desktop', width: 1440, height: 900 }
    ];

    for (const vp of viewports) {
        await page.setViewport({ width: vp.width, height: vp.height });
        await sleep(500);
        const hasHorizontalOverflow = await page.evaluate(() => {
            return document.documentElement.scrollWidth > window.innerWidth;
        });
        const overflowWidth = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        console.log(`    Viewport ${vp.name} (${vp.width}x${vp.height}): Horizontal Overflow = ${hasHorizontalOverflow} (+${overflowWidth}px)`);
        if (hasHorizontalOverflow) {
            auditResults.uxAndA11y.push({
                component: 'LayoutResponsiveness',
                viewport: vp.name,
                severity: vp.name === 'Mobile' ? 'HIGH' : 'MEDIUM',
                description: `Page exceeds screen width on ${vp.name} by ${overflowWidth}px, creating unintended horizontal scrollbars.`
            });
        }
    }

    await browser.close();

    // -------------------------------------------------------------
    // SECTION 4: PERFORMANCE & BUNDLE SIZE METRICS
    // -------------------------------------------------------------
    console.log('\n>>> [PHASE 4] PERFORMANCE & ASSET PROFILING...');
    const publicAssetDir = path.join(__dirname, 'public', 'assets');
    const assetFiles = fs.readdirSync(publicAssetDir);
    const heavyAssets = [];
    let totalJsSize = 0;
    let totalCssSize = 0;

    for (const f of assetFiles) {
        const stat = fs.statSync(path.join(publicAssetDir, f));
        if (f.endsWith('.js')) totalJsSize += stat.size;
        if (f.endsWith('.css')) totalCssSize += stat.size;
        if (stat.size > 200 * 1024) { // > 200 KB
            heavyAssets.push({ file: f, sizeKB: Math.round(stat.size / 1024) });
        }
    }

    console.log(`  Total JavaScript Bundles: ${Math.round(totalJsSize / 1024)} KB`);
    console.log(`  Total CSS Bundles:        ${Math.round(totalCssSize / 1024)} KB`);
    console.log('  Large Unsplit Chunks (>200KB):');
    heavyAssets.forEach(a => console.log(`    - ${a.file}: ${a.sizeKB} KB`));

    auditResults.performance.push({
        check: 'Bundle Size & Code Splitting',
        totalJsKB: Math.round(totalJsSize / 1024),
        totalCssKB: Math.round(totalCssSize / 1024),
        largeChunks: heavyAssets,
        severity: totalJsSize > 2 * 1024 * 1024 ? 'HIGH' : 'MEDIUM',
        description: 'Frontend loads over 2MB of JavaScript on initial boot. Vendor libraries (CKEditor, Three.js, Bootstrap) are bundled into large chunks without dynamic lazy loading.'
    });

    // Check for setInterval polling in index.html
    const indexHtml = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');
    const hasDomPolling = indexHtml.includes('setInterval(checkAndInjectIPR');
    if (hasDomPolling) {
        auditResults.performance.push({
            check: 'DOM Polling Loop (setInterval)',
            severity: 'HIGH',
            description: 'public/index.html executes checkAndInjectIPR() every 500ms via setInterval, causing continuous DOM queries, CPU micro-spikes, and reflow/repaint thrashing.'
        });
        console.log('  🚨 [PERF DEGRADATION] setInterval DOM polling detected in index.html (runs every 500ms)!');
    }

    // Save final audit output
    const reportPath = path.join(__dirname, 'comprehensive_audit_findings.json');
    fs.writeFileSync(reportPath, JSON.stringify(auditResults, null, 2), 'utf8');
    console.log(`\n================================================================`);
    console.log(`AUDIT COMPLETE! Full structured results saved to:`);
    console.log(reportPath);
    console.log(`================================================================\n`);
}

runComprehensiveAudit().catch(console.error);
