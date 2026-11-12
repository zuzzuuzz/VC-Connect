const http = require('http');

function apiRequest(path, method = 'GET', body = null) {
    return new Promise((resolve) => {
        const payload = body ? JSON.stringify(body) : null;
        const req = http.request({
            hostname: 'localhost',
            port: 8000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer velourcare-jwt-bearer-1',
                ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
            }
        }, res => {
            let resBody = '';
            res.on('data', c => resBody += c);
            res.on('end', () => {
                let data = null;
                try { data = JSON.parse(resBody); } catch(e) {}
                resolve({ status: res.statusCode, data });
            });
        });

        req.on('error', err => resolve({ status: 'ERR', error: err.message }));
        if (payload) req.write(payload);
        req.end();
    });
}

async function run() {
    console.log('--- TEST: CLINICAL WORKFLOW STATE MUTATIONS & INVOICING ---');
    let failed = 0;

    // 0. Get initial invoice count and case status
    const initialInvoicesRes = await apiRequest('/api/invoices');
    const initialInvoiceCount = (initialInvoicesRes.data && initialInvoicesRes.data.data) ? initialInvoicesRes.data.data.length : 0;
    console.log(`Initial invoice count: ${initialInvoiceCount}`);

    // 1. Approve Treatment Plan
    const approveRes = await apiRequest('/api/cases/1/treatment-plans/1/approve', 'POST', {});
    console.log(`1. POST /api/cases/1/treatment-plans/1/approve: Status ${approveRes.status}`);
    
    // Check Case Status after approval
    const caseAfterApprove = await apiRequest('/api/cases/1');
    const caseStatusVal = caseAfterApprove.data && caseAfterApprove.data.data && caseAfterApprove.data.data.status && caseAfterApprove.data.data.status.value;
    console.log(`   Case 1 status after approve: ${caseStatusVal}`);
    if (caseStatusVal !== 'plan-approved') {
        console.error(`   ❌ Expected case status 'plan-approved', got: '${caseStatusVal}'`);
        failed++;
    } else {
        console.log('   ✅ PASS (Case status transitioned to plan-approved)');
    }

    // Check Invoices count after approval
    const invoicesAfterApprove = await apiRequest('/api/invoices');
    const newInvoiceCount = (invoicesAfterApprove.data && invoicesAfterApprove.data.data) ? invoicesAfterApprove.data.data.length : 0;
    console.log(`   Invoice count after approval: ${newInvoiceCount}`);
    if (newInvoiceCount !== initialInvoiceCount + 1) {
        console.error(`   ❌ Expected invoice count to increment to ${initialInvoiceCount + 1}, got ${newInvoiceCount}`);
        failed++;
    } else {
        console.log('   ✅ PASS (Itemized invoice generated upon plan approval)');
    }

    // 2. Reject / Request Revision on Treatment Plan
    const rejectRes = await apiRequest('/api/cases/1/treatment-plans/1/reject', 'POST', {
        notes: "Lower anterior crowding needs additional 0.3mm IPR on tooth 31."
    });
    console.log(`2. POST /api/cases/1/treatment-plans/1/reject: Status ${rejectRes.status}`);
    const caseAfterReject = await apiRequest('/api/cases/1');
    const caseStatusAfterReject = caseAfterReject.data && caseAfterReject.data.data && caseAfterReject.data.data.status && caseAfterReject.data.data.status.value;
    console.log(`   Case 1 status after reject: ${caseStatusAfterReject}`);
    if (caseStatusAfterReject !== 'needs-revision') {
        console.error(`   ❌ Expected case status 'needs-revision', got: '${caseStatusAfterReject}'`);
        failed++;
    } else {
        console.log('   ✅ PASS (Case status transitioned to needs-revision)');
    }

    // 3. Dispatch Next Shipment Batch
    const dispatchRes = await apiRequest('/api/cases/1/shipment-batches/start-next', 'POST', {
        courier: "DHL Express Medical",
        tracking_number: "DHL-MED-99482103"
    });
    console.log(`3. POST /api/cases/1/shipment-batches/start-next: Status ${dispatchRes.status}`);
    const caseAfterDispatch = await apiRequest('/api/cases/1');
    const caseData = caseAfterDispatch.data && caseAfterDispatch.data.data;
    const hasTracking = caseData && caseData.latest_tracking && caseData.latest_tracking.tracking_number === "DHL-MED-99482103";
    console.log(`   Case tracking saved: ${hasTracking}`);
    if (!hasTracking) {
        console.error('   ❌ Expected latest_tracking.tracking_number to be DHL-MED-99482103');
        failed++;
    } else {
        console.log('   ✅ PASS (Tracking number and batch metadata saved on case)');
    }

    console.log(`\nResult: ${failed === 0 ? 'ALL PASSED' : failed + ' TESTS FAILED'}`);
    process.exit(failed === 0 ? 0 : 1);
}

run().catch(e => {
    console.error(e);
    process.exit(1);
});
