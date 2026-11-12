const http = require('http');

function post(path, body) {
    return new Promise((resolve) => {
        const data = JSON.stringify(body);
        const req = http.request({
            hostname: 'localhost',
            port: 8000,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        }, (res) => {
            let resBody = '';
            res.on('data', chunk => resBody += chunk);
            res.on('end', () => {
                resolve({ status: res.statusCode, body: resBody });
            });
        });
        req.on('error', err => resolve({ status: 'ERR', error: err.message }));
        req.write(data);
        req.end();
    });
}

async function testCreations() {
    console.log('Testing creation endpoints...\n');

    // 1. Create Client
    const clientRes = await post('/api/clients', {
        name: 'QA Test Clinic LLC',
        company_title: 'QA Test Clinic',
        email: 'qa@clinic.ae',
        phone: '+971 55 999 8888',
        case_id_prefix: 'QACLINIC'
    });
    console.log('1. POST /api/clients:', clientRes.status, clientRes.body.slice(0, 150));

    // 2. Create Sub-Client
    const subClientRes = await post('/api/sub-clients', {
        name: 'QA Test Branch 1',
        parent_client_id: 1,
        email: 'branch1@clinic.ae',
        phone: '+971 55 777 6666'
    });
    console.log('2. POST /api/sub-clients:', subClientRes.status, subClientRes.body.slice(0, 150));

    // 3. Create Vendor
    const vendorRes = await post('/api/vendors', {
        name: 'QA Precision Dental Lab',
        username: 'qalab',
        email: 'lab@qaprecision.ae',
        services: ['Aligner Thermoforming', '3D Printing']
    });
    console.log('3. POST /api/vendors:', vendorRes.status, vendorRes.body.slice(0, 150));

    // 4. Create User
    const userRes = await post('/api/users', {
        name: 'Dr. QA Specialist',
        username: 'drqa',
        email: 'dr.qa@velourcare.com',
        role_slug: 'doctor'
    });
    console.log('4. POST /api/users:', userRes.status, userRes.body.slice(0, 150));

    // 5. Create Role
    const roleRes = await post('/api/roles', {
        name: 'Clinical Quality Auditor',
        permissions: ['view_cases', 'view_clients']
    });
    console.log('5. POST /api/roles:', roleRes.status, roleRes.body.slice(0, 150));

    // 6. Create Bank Account
    const bankRes = await post('/api/bank-accounts', {
        label: 'Emirates NBD Operating',
        bank_name: 'Emirates NBD',
        currency: 'AED',
        iban: 'AE000000000000000000000'
    });
    console.log('6. POST /api/bank-accounts:', bankRes.status, bankRes.body.slice(0, 150));

    // 7. Test Email Endpoint
    const emailRes = await post('/api/test-email', {
        email: 'test@velourcare.com',
        subject: 'Test Notification',
        message: 'Hello'
    });
    console.log('7. POST /api/test-email:', emailRes.status, emailRes.body.slice(0, 150));
}

testCreations().catch(console.error);
