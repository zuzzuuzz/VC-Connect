const http = require('http');

function request(path, method = 'GET', body = null) {
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

        const req = http.request(options, (res) => {
            let resBody = '';
            res.on('data', chunk => resBody += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    body: resBody.slice(0, 300)
                });
            });
        });

        req.on('error', (err) => {
            resolve({ status: 'ERR', error: err.message });
        });

        if (data) req.write(data);
        req.end();
    });
}

const testPaths = [
    '/api/auth/verify',
    '/api/dashboard/statistics',
    '/api/cases',
    '/api/cases/filter-options',
    '/api/cases/1',
    '/api/cases/1/activities',
    '/api/clients',
    '/api/clients/as-filter-options',
    '/api/clients/1',
    '/api/clients/1/allocated-vendors',
    '/api/clients/1/billable-preview',
    '/api/sub-clients',
    '/api/sub-clients/1',
    '/api/vendors',
    '/api/vendors/as-filter-options',
    '/api/vendors/manufacturing-filter-options',
    '/api/vendors/1',
    '/api/vendors/1/services',
    '/api/vendors/1/allocated-clients',
    '/api/users',
    '/api/users/filter-options',
    '/api/users/1',
    '/api/roles',
    '/api/roles/1',
    '/api/permissions',
    '/api/permissions/current-user',
    '/api/permissions/1/user',
    '/api/permissions/1/role',
    '/api/invoices',
    '/api/invoices/1',
    '/api/bank-accounts',
    '/api/bank-accounts/1',
    '/api/stripe/platform-status',
    '/api/client-api-credentials',
    '/api/chat/unread-counts',
    '/api/patients'
];

async function run() {
    console.log('Testing all endpoints against localhost:8000...\n');
    for (const p of testPaths) {
        const res = await request(p);
        const icon = (res.status === 200) ? '✅' : '❌';
        console.log(`${icon} [${res.status}] ${p}`);
        if (res.status !== 200) {
            console.log('   Response:', res.body);
        }
    }
}

run();
