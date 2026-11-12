const http = require('http');

function req(path, method = 'GET') {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: 8000,
            path: path,
            method: method,
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer velourcare-jwt-bearer-1' // Admin
            }
        };

        const r = http.request(options, res => {
            let resBody = '';
            res.on('data', c => resBody += c);
            res.on('end', () => {
                let data = null;
                try { data = JSON.parse(resBody); } catch(e) {}
                resolve({ status: res.statusCode, data });
            });
        });
        r.on('error', err => resolve({ status: 'ERR', error: err.message }));
        r.end();
    });
}

async function run() {
    console.log('--- TEST: REST 404 INTEGRITY & QUERY PROCESSING ---');
    let failed = 0;

    // 1. Missing Case 999999 -> 404
    const cRes = await req('/api/cases/999999');
    console.log(`1. GET /api/cases/999999: Status ${cRes.status}`);
    if (cRes.status !== 404) {
        console.error('   ❌ Expected 404, got:', cRes.status);
        failed++;
    } else {
        console.log('   ✅ PASS (404)');
    }

    // 2. Missing Invoice 999999 -> 404
    const iRes = await req('/api/invoices/999999');
    console.log(`2. GET /api/invoices/999999: Status ${iRes.status}`);
    if (iRes.status !== 404) {
        console.error('   ❌ Expected 404, got:', iRes.status);
        failed++;
    } else {
        console.log('   ✅ PASS (404)');
    }

    // 3. Missing Bank Account 999999 -> 404
    const bRes = await req('/api/bank-accounts/999999');
    console.log(`3. GET /api/bank-accounts/999999: Status ${bRes.status}`);
    if (bRes.status !== 404) {
        console.error('   ❌ Expected 404, got:', bRes.status);
        failed++;
    } else {
        console.log('   ✅ PASS (404)');
    }

    // 4. Missing Role 999999 -> 404
    const rRes = await req('/api/roles/999999');
    console.log(`4. GET /api/roles/999999: Status ${rRes.status}`);
    if (rRes.status !== 404) {
        console.error('   ❌ Expected 404, got:', rRes.status);
        failed++;
    } else {
        console.log('   ✅ PASS (404)');
    }

    // 5. Pagination: page=1&per_page=2 vs page=2&per_page=2
    const p1 = await req('/api/cases?page=1&per_page=2');
    const p2 = await req('/api/cases?page=2&per_page=2');
    const p1Len = p1.data?.data?.length || 0;
    const p2Len = p2.data?.data?.length || 0;
    console.log(`5. Pagination page 1 (${p1Len} items), page 2 (${p2Len} items)`);
    if (p1Len > 2 || p1.data?.current_page !== 1 || p2.data?.current_page !== 2) {
        console.error('   ❌ Pagination ignored or length exceeded per_page');
        failed++;
    } else {
        console.log('   ✅ PASS (Pagination sliced)');
    }

    // 6. Search filtering: searchQuery=Fatima vs searchQuery=XYZNONEXISTENT
    const searchFound = await req('/api/cases?searchQuery=Fatima');
    const searchNone = await req('/api/cases?searchQuery=XYZNONEXISTENT999');
    const foundCount = searchFound.data?.data?.length || 0;
    const noneCount = searchNone.data?.data?.length || 0;
    console.log(`6. Search Fatima (${foundCount} found), Non-existent (${noneCount} found)`);
    if (foundCount === 0 || noneCount !== 0) {
        console.error('   ❌ Search filtering failed');
        failed++;
    } else {
        console.log('   ✅ PASS (Search filtering works)');
    }

    console.log(`\nResult: ${failed === 0 ? 'ALL PASSED' : failed + ' TESTS FAILED'}`);
    process.exit(failed === 0 ? 0 : 1);
}

run().catch(e => {
    console.error(e);
    process.exit(1);
});
