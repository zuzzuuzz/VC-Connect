const http = require('http');

function req(path, method = 'GET', body = null) {
    return new Promise((resolve) => {
        const data = body ? JSON.stringify(body) : null;
        const options = {
            hostname: 'localhost',
            port: 8000,
            path: path,
            method: method,
            headers: {
                'Accept': 'application/json',
                ...(data ? {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(data)
                } : {})
            }
        };

        const r = http.request(options, (res) => {
            let resBody = '';
            res.on('data', chunk => resBody += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: resBody.slice(0, 100) }));
        });
        r.on('error', err => resolve({ status: 'ERR', error: err.message }));
        if (data) r.write(data);
        r.end();
    });
}

async function testAllRemaining() {
    const endpoints = [
        ['GET', '/api/cases/1/treatment-plans'],
        ['GET', '/api/cases/1/treatment-plans/1/document'],
        ['PUT', '/api/cases/1/treatment-plans/1/document', { teeth_chart: {} }],
        ['GET', '/api/cases/1/step-files'],
        ['POST', '/api/cases/1/sync-to-waveatp', {}],
        ['POST', '/api/cases/1/open-in-smile-inspector', {}],
        ['PATCH', '/api/cases/1/shipment-address', { shipment_address_id: 1 }],
        ['GET', '/api/clients/1/allocated-vendors'],
        ['GET', '/api/clients/1/billable-preview'],
        ['POST', '/api/clients/1/shipment-addresses', { title: 'Branch 2', city: 'Dubai' }],
        ['GET', '/api/vendors/1/allocated-clients'],
        ['GET', '/api/vendors/1/allocatable-clients'],
        ['POST', '/api/vendors/1/allocate-clients', { client_ids: [1] }],
        ['POST', '/api/invoices/1/issue', {}],
        ['POST', '/api/invoices/1/checkout', {}],
        ['PATCH', '/api/users/1/change-password', { password: 'newpassword123' }],
        ['POST', '/api/users/1/update-role', { role_id: 1 }],
        ['PATCH', '/api/users/1/update-status', { status: 'active' }],
        ['GET', '/api/chat/unread-counts'],
        ['GET', '/api/stripe/platform-status'],
        ['GET', '/api/clients/1/stripe-connect'],
        ['POST', '/api/clients/1/stripe-connect/onboard', {}]
    ];

    console.log('Testing remaining API endpoints:');
    for (const [method, p, body] of endpoints) {
        const res = await req(p, method, body);
        const icon = res.status < 400 ? '✅' : '❌';
        console.log(`${icon} [${res.status}] ${method} ${p} -> ${res.body}`);
    }
}

testAllRemaining().catch(console.error);
