const puppeteer = require('puppeteer-core');

const routes = [
    '/dashboard',
    '/cases',
    '/cases/1/view',
    '/cases/1/treatment-plans/1/document',
    '/clients',
    '/sub-clients',
    '/vendors',
    '/invoices',
    '/invoices/1',
    '/invoices/create',
    '/users',
    '/roles',
    '/roles/1/permissions',
    '/bank-accounts',
    '/settings/stripe-platform',
    '/settings/stripe-connect',
    '/settings/client-api-credentials',
    '/profile',
    '/profile/edit',
    '/profile/account-settings',
    '/messages',
    '/api-documentation'
];

async function audit() {
    console.log('--- STARTING COMPREHENSIVE ROUTE AUDIT ---');
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    const report = [];

    for (const route of routes) {
        const routeErrors = [];
        const failedRequests = [];

        const onConsole = msg => {
            if (msg.type() === 'error') routeErrors.push(msg.text());
        };
        const onResponse = resp => {
            if (resp.status() >= 400) failedRequests.push({ status: resp.status(), url: resp.url() });
        };

        page.on('console', onConsole);
        page.on('response', onResponse);

        try {
            await page.goto(`http://localhost:8000${route}`, { waitUntil: 'networkidle2', timeout: 8000 });
            await new Promise(r => setTimeout(r, 1000));
            const title = await page.title();
            const text = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 300));
            report.push({
                route,
                status: 'OK',
                title,
                textSnippet: text,
                errors: routeErrors,
                failedRequests
            });
        } catch (e) {
            report.push({
                route,
                status: 'FAIL: ' + e.message,
                errors: routeErrors,
                failedRequests
            });
        }

        page.off('console', onConsole);
        page.off('response', onResponse);
    }

    await browser.close();

    console.log('\n================ AUDIT SUMMARY ================');
    report.forEach(r => {
        console.log(`\nRoute: ${r.route} [${r.status}] - Title: "${r.title || 'N/A'}"`);
        if (r.failedRequests && r.failedRequests.length > 0) {
            console.log(`  Failed Requests (${r.failedRequests.length}):`);
            r.failedRequests.forEach(f => console.log(`    [${f.status}] ${f.url}`));
        }
        if (r.errors && r.errors.length > 0) {
            console.log(`  Browser Errors (${r.errors.length}):`);
            r.errors.slice(0, 5).forEach(e => console.log(`    ${e}`));
        }
        console.log(`  Content: ${r.textSnippet ? r.textSnippet.slice(0, 120) : 'None'}...`);
    });
}

audit().catch(console.error);
