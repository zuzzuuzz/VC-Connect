const puppeteer = require('puppeteer-core');
const https = require('https');
const url = require('url');

const TARGET_URL = 'https://cloud.smilegenix.ae';

function fetchHeaders(targetUrl) {
    return new Promise((resolve, reject) => {
        const parsed = url.parse(targetUrl);
        const req = https.request({
            hostname: parsed.hostname,
            path: parsed.path || '/',
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        }, res => {
            resolve({
                statusCode: res.statusCode,
                headers: res.headers,
                httpVersion: res.httpVersion
            });
        });
        req.on('error', reject);
        req.end();
    });
}

async function runDeepAudit() {
    console.log(`=== STARTING DEEP AUDIT OF ${TARGET_URL} ===`);

    // 1. HTTP Protocol & Security Headers Audit
    console.log('\n[1/4] Auditing HTTP Protocol & Security Headers...');
    const headerInfo = await fetchHeaders(TARGET_URL);
    console.log('HTTP Status:', headerInfo.statusCode);
    console.log('HTTP Version:', headerInfo.httpVersion);
    console.log('Headers:', JSON.stringify(headerInfo.headers, null, 2));

    // 2. Headless Browser Deep Runtime & Network Waterfall Audit
    console.log('\n[2/4] Launching Headless Chrome for Deep Runtime & Network Waterfall...');
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    const networkRequests = [];
    const consoleLogs = [];
    const failedRequests = [];

    page.on('console', msg => {
        consoleLogs.push({ type: msg.type(), text: msg.text() });
    });

    page.on('requestfailed', req => {
        failedRequests.push({
            url: req.url(),
            failure: req.failure() ? req.failure().errorText : 'Unknown'
        });
    });

    page.on('response', resp => {
        const req = resp.request();
        const headers = resp.headers();
        networkRequests.push({
            url: resp.url(),
            method: req.method(),
            resourceType: req.resourceType(),
            status: resp.status(),
            contentType: headers['content-type'] || 'unknown',
            contentEncoding: headers['content-encoding'] || 'none',
            cacheControl: headers['cache-control'] || 'none',
            contentLength: headers['content-length'] || 0
        });
    });

    const startTime = Date.now();
    let navResponse;
    try {
        navResponse = await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    } catch (e) {
        console.warn('Navigation timeout/warning:', e.message);
    }
    const loadDuration = Date.now() - startTime;

    await new Promise(r => setTimeout(r, 3000));

    // 3. Runtime DOM, Performance & Storage Audit
    console.log('\n[3/4] Evaluating Runtime DOM, Performance Metrics & Storage...');
    const runtimeMetrics = await page.evaluate(() => {
        const timing = window.performance.timing;
        const navEntries = performance.getEntriesByType('navigation');
        const nav = navEntries.length > 0 ? navEntries[0] : null;

        const domNodeCount = document.querySelectorAll('*').length;
        const scripts = Array.from(document.querySelectorAll('script')).map(s => s.src || s.innerHTML.slice(0, 100));
        const links = Array.from(document.querySelectorAll('link')).map(l => ({ rel: l.rel, href: l.href }));

        const localStorageKeys = Object.keys(localStorage);
        const sessionStorageKeys = Object.keys(sessionStorage);
        const cookies = document.cookie;

        const memory = window.performance.memory ? {
            totalJSHeapSize: window.performance.memory.totalJSHeapSize,
            usedJSHeapSize: window.performance.memory.usedJSHeapSize,
            jsHeapSizeLimit: window.performance.memory.jsHeapSizeLimit
        } : null;

        return {
            pageTitle: document.title,
            currentUrl: window.location.href,
            domNodeCount,
            scriptsCount: scripts.length,
            scripts: scripts.filter(s => s.startsWith('http')),
            linksCount: links.length,
            localStorageKeys,
            sessionStorageKeys,
            cookiesLength: cookies.length,
            memory,
            navMetrics: nav ? {
                dnsTime: nav.domainLookupEnd - nav.domainLookupStart,
                tcpTime: nav.connectEnd - nav.connectStart,
                tlsTime: nav.secureConnectionStart > 0 ? nav.connectEnd - nav.secureConnectionStart : 0,
                ttfb: nav.responseStart - nav.requestStart,
                downloadTime: nav.responseEnd - nav.responseStart,
                domInteractive: nav.domInteractive,
                domContentLoaded: nav.domContentLoadedEventEnd,
                loadEventEnd: nav.loadEventEnd
            } : null
        };
    });

    await page.screenshot({ path: 'D:\\Antigravity\\velourcare-ortho-cloud\\live_smilegenix_audit.png' });
    console.log('Saved screenshot to live_smilegenix_audit.png');

    await browser.close();

    // 4. Summarize Findings
    console.log('\n[4/4] Processing Deep Audit Findings...');
    const totalRequests = networkRequests.length;
    const totalBytes = networkRequests.reduce((sum, r) => sum + (parseInt(r.contentLength) || 0), 0);
    const uncompressedRequests = networkRequests.filter(r => 
        ['script', 'stylesheet', 'document', 'xhr', 'fetch'].includes(r.resourceType) && 
        r.contentEncoding === 'none' && 
        parseInt(r.contentLength) > 1024
    );

    const assetTypes = {};
    networkRequests.forEach(r => {
        assetTypes[r.resourceType] = (assetTypes[r.resourceType] || 0) + 1;
    });

    const results = {
        targetUrl: TARGET_URL,
        timestamp: new Date().toISOString(),
        loadDurationMs: loadDuration,
        httpHeaders: headerInfo.headers,
        runtimeMetrics,
        networkSummary: {
            totalRequests,
            totalBytes,
            totalMegabytes: (totalBytes / (1024 * 1024)).toFixed(2),
            assetBreakdown: assetTypes,
            uncompressedTextAssetsCount: uncompressedRequests.length,
            uncompressedExamples: uncompressedRequests.slice(0, 5).map(u => ({ url: u.url, size: u.contentLength }))
        },
        consoleIssues: {
            total: consoleLogs.length,
            errors: consoleLogs.filter(c => c.type === 'error'),
            warnings: consoleLogs.filter(c => c.type === 'warning'),
            logs: consoleLogs.slice(0, 10)
        },
        failedRequests
    };

    console.log('\n================ DEEP AUDIT JSON OUTPUT ================');
    console.log(JSON.stringify(results, null, 2));

    const fs = require('fs');
    fs.writeFileSync('D:\\Antigravity\\velourcare-ortho-cloud\\smilegenix_deep_audit_results.json', JSON.stringify(results, null, 2));
    console.log('\nResults saved to D:\\Antigravity\\velourcare-ortho-cloud\\smilegenix_deep_audit_results.json');
}

runDeepAudit().catch(console.error);
