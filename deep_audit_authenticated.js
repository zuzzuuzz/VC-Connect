const puppeteer = require('puppeteer-core');
const fs = require('fs');

async function auditProfile(username, password, label) {
    console.log(`\n======================================================`);
    console.log(`  DEEP LIVE AUDIT: ${label} (${username})`);
    console.log(`======================================================`);

    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 950 });

    const consoleIssues = [];
    const failedNetwork = [];
    const apiEndpointsCalled = [];

    page.on('console', msg => {
        if (msg.type() === 'error' || msg.type() === 'warning') {
            consoleIssues.push({ type: msg.type(), text: msg.text() });
        }
    });

    page.on('response', resp => {
        const url = resp.url();
        const status = resp.status();
        if (status >= 400) {
            failedNetwork.push({ url, status, statusText: resp.statusText() });
        }
        if (url.includes('/api/')) {
            apiEndpointsCalled.push({
                url,
                method: resp.request().method(),
                status
            });
        }
    });

    // 1. Login
    await page.goto('https://cloud.smilegenix.ae/login', { waitUntil: 'networkidle2' });
    await page.type('input[type="text"]', username);
    await page.type('input[type="password"]', password);
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) await submitBtn.click();

    try {
        await page.waitForNavigation({ timeout: 8000 });
    } catch {}
    await new Promise(r => setTimeout(r, 3000));

    console.log('Post-login URL:', page.url());
    console.log('Post-login Title:', await page.title());

    // 2. Discover Navigation Menu Links & Sidebar
    const navLinks = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a, button[role="tab"], .nav-link, .menu-link, .nav-item a')).map(el => ({
            tag: el.tagName,
            text: el.innerText.trim(),
            href: el.getAttribute('href'),
            class: el.className
        })).filter(l => l.href && !l.href.startsWith('javascript'));
    });
    console.log(`Discovered ${navLinks.length} navigation links:`, navLinks);

    // Take screenshot of main dashboard
    await page.screenshot({ path: `D:\\Antigravity\\velourcare-ortho-cloud\\live_audit_${label}_dashboard.png` });

    // 3. Visit Key Routes
    const routesToTest = [
        '/dashboard',
        '/cases',
        '/profile',
        '/messages',
        '/roles',
        '/clients',
        '/invoices'
    ];

    const visitedResults = [];

    for (const route of routesToTest) {
        console.log(`\nNavigating to ${route} ...`);
        const preErrorsCount = consoleIssues.length;
        const preFailedCount = failedNetwork.length;

        try {
            await page.goto(`https://cloud.smilegenix.ae${route}`, { waitUntil: 'networkidle2', timeout: 15000 });
            await new Promise(r => setTimeout(r, 2500));

            const currentUrl = page.url();
            const title = await page.title();
            const bodySnippet = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 300));
            const hasCases = await page.evaluate(() => document.querySelectorAll('table tbody tr').length);

            const result = {
                requestedRoute: route,
                actualUrl: currentUrl,
                title,
                tableRowsCount: hasCases,
                bodySnippet: bodySnippet.slice(0, 150),
                newErrors: consoleIssues.slice(preErrorsCount),
                newFailedRequests: failedNetwork.slice(preFailedCount)
            };
            visitedResults.push(result);
            console.log(`Result for ${route}: [${title}] URL=${currentUrl} Rows=${hasCases}`);

            // If we are on /cases, let's see if there's a case to click and view!
            if (route === '/cases' && hasCases > 0) {
                console.log('Inspecting first case on /cases...');
                await page.screenshot({ path: `D:\\Antigravity\\velourcare-ortho-cloud\\live_audit_${label}_cases_list.png` });

                const caseLink = await page.evaluate(() => {
                    const firstLink = Array.from(document.querySelectorAll('a')).find(a => a.href && a.href.includes('/cases/') && a.href.includes('/view'));
                    return firstLink ? firstLink.href : null;
                });

                if (caseLink) {
                    console.log(`Navigating to case view: ${caseLink}`);
                    await page.goto(caseLink, { waitUntil: 'networkidle2', timeout: 15000 });
                    await new Promise(r => setTimeout(r, 3000));
                    await page.screenshot({ path: `D:\\Antigravity\\velourcare-ortho-cloud\\live_audit_${label}_case_view.png` });

                    // Check if IPR section exists on live site!
                    const iprInfo = await page.evaluate(() => {
                        const bodyText = document.body.innerText;
                        return {
                            hasIprText: bodyText.includes('IPR') || bodyText.includes('Interproximal Reduction'),
                            hasIprTab: Array.from(document.querySelectorAll('button, a')).some(b => b.innerText.includes('IPR')),
                            tabs: Array.from(document.querySelectorAll('ul.nav-tabs li, .nav-item')).map(li => li.innerText.trim())
                        };
                    });
                    console.log('Live Case View IPR Check:', iprInfo);
                }
            }

        } catch (e) {
            console.error(`Failed navigating to ${route}:`, e.message);
        }
    }

    await browser.close();

    return {
        label,
        username,
        visitedResults,
        consoleIssues,
        failedNetwork,
        apiEndpointsCalled
    };
}

async function main() {
    const report1 = await auditProfile('Ibrar@smilegenix', 'Password123!', 'planner_ibrar');
    const report2 = await auditProfile('3Dalignerplanner@smilegenix', 'Password123!', 'planner_3daligner');

    const combined = {
        timestamp: new Date().toISOString(),
        profile1: report1,
        profile2: report2
    };

    fs.writeFileSync('D:\\Antigravity\\velourcare-ortho-cloud\\live_authenticated_audit.json', JSON.stringify(combined, null, 2));
    console.log('\nAudit complete! Saved to D:\\Antigravity\\velourcare-ortho-cloud\\live_authenticated_audit.json');
}

main().catch(console.error);
