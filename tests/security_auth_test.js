const http = require('http');

function req(path, method = 'GET', headers = {}, body = null) {
    return new Promise((resolve) => {
        const payload = body ? JSON.stringify(body) : null;
        const options = {
            hostname: 'localhost',
            port: 8000,
            path: path,
            method: method,
            headers: {
                'Accept': 'application/json',
                ...(payload ? {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(payload)
                } : {}),
                ...headers
            }
        };

        const r = http.request(options, res => {
            let resBody = '';
            res.on('data', c => resBody += c);
            res.on('end', () => {
                let data = null;
                try { data = JSON.parse(resBody); } catch(e) {}
                resolve({ status: res.statusCode, headers: res.headers, body: resBody, data });
            });
        });
        r.on('error', err => resolve({ status: 'ERR', error: err.message }));
        if (payload) r.write(payload);
        r.end();
    });
}

async function runTest() {
    console.log('--- TEST: SECURITY & AUTHENTICATION HARDENING ---');
    let failed = 0;

    // 1. Unauthenticated access to /api/cases must be rejected with 401
    const unauthCases = await req('/api/cases', 'GET');
    console.log(`1. Unauthenticated GET /api/cases: Status ${unauthCases.status}`);
    if (unauthCases.status !== 401) {
        console.error('   ❌ Expected 401 Unauthorized, got:', unauthCases.status);
        failed++;
    } else {
        console.log('   ✅ PASS (401 rejected)');
    }

    // 2. Unauthenticated DELETE /api/bank-accounts/1 must be rejected with 401
    const unauthDelete = await req('/api/bank-accounts/1', 'DELETE');
    console.log(`2. Unauthenticated DELETE /api/bank-accounts/1: Status ${unauthDelete.status}`);
    if (unauthDelete.status !== 401 && unauthDelete.status !== 403) {
        console.error('   ❌ Expected 401/403, got:', unauthDelete.status);
        failed++;
    } else {
        console.log('   ✅ PASS (401/403 rejected)');
    }

    // 3. Forged token must be rejected with 401
    const forged = await req('/api/cases', 'GET', { 'Authorization': 'Bearer FAKE_TOKEN_XYZ_HACKER' });
    console.log(`3. Forged Bearer Token GET /api/cases: Status ${forged.status}`);
    if (forged.status !== 401) {
        console.error('   ❌ Expected 401 Unauthorized, got:', forged.status);
        failed++;
    } else {
        console.log('   ✅ PASS (Forged token rejected)');
    }

    // 4. Fake login with unknown username must NOT fall back to Super Admin
    const fakeLogin = await req('/api/auth/login', 'POST', {}, {
        username: 'nonexistent_user_9999',
        password: 'any_password'
    });
    console.log(`4. Fake login with unknown username: Status ${fakeLogin.status}`);
    const isSuperAdmin = fakeLogin.data?.data?.user?.is_super_admin;
    if (fakeLogin.status === 200 && isSuperAdmin) {
        console.error('   ❌ CRITICAL: Login fell back to Super Admin!');
        failed++;
    } else if (fakeLogin.status === 401 || fakeLogin.status === 422) {
        console.log('   ✅ PASS (Rejected fake credentials)');
    }

    // 5. Security headers presence
    const dash = await req('/dashboard', 'GET');
    const hasNosniff = dash.headers['x-content-type-options'] === 'nosniff';
    const hasFrameOptions = !!dash.headers['x-frame-options'];
    console.log(`5. Security Headers: nosniff=${hasNosniff}, x-frame-options=${hasFrameOptions}`);
    if (!hasNosniff || !hasFrameOptions) {
        console.error('   ❌ Missing security headers');
        failed++;
    } else {
        console.log('   ✅ PASS (Headers present)');
    }

    console.log(`\nResult: ${failed === 0 ? 'ALL PASSED' : failed + ' TESTS FAILED'}`);
    process.exit(failed === 0 ? 0 : 1);
}

runTest().catch(e => {
    console.error(e);
    process.exit(1);
});
