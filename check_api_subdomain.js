const https = require('https');

function testEndpoint(hostname, path) {
    return new Promise(resolve => {
        const req = https.request({
            hostname,
            path,
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Accept': 'application/json'
            }
        }, res => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                resolve({
                    path,
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: body.slice(0, 300)
                });
            });
        });
        req.on('error', err => resolve({ path, error: err.message }));
        req.end();
    });
}

(async () => {
    console.log('Testing api.cloud.smilegenix.ae endpoints...');
    const endpoints = [
        '/',
        '/api',
        '/api/v1',
        '/sanctum/csrf-cookie',
        '/api/documentation',
        '/docs',
        '/swagger',
        '/api/auth/login'
    ];
    for (const ep of endpoints) {
        const r = await testEndpoint('api.cloud.smilegenix.ae', ep);
        console.log(`[${r.statusCode || 'ERR'}] ${ep} -> ${r.body ? r.body.replace(/\s+/g, ' ').slice(0, 100) : r.error}`);
    }
})();
