const http = require('http');
const puppeteer = require('puppeteer-core');

function postComment(htmlContent) {
    return new Promise((resolve) => {
        const payload = JSON.stringify({
            content: htmlContent,
            attachments: []
        });
        const req = http.request({
            hostname: 'localhost',
            port: 8000,
            path: '/api/cases/1/comments',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        }, res => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => resolve({ status: res.statusCode, body }));
        });
        req.write(payload);
        req.end();
    });
}

async function checkXss() {
    console.log('1. Posting HTML payload to comments API...');
    const postRes = await postComment('<b id="xss-test-bold">BOLD_TEST_ELEMENT</b><img src="x" onerror="window.__XSS_FIRED__=true">');
    console.log('   POST Response:', postRes.status, postRes.body);

    console.log('2. Opening Puppeteer to check if rendered as raw HTML or escaped text...');
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto('http://localhost:8000/cases/1/view', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));

    const xssEvaluation = await page.evaluate(() => {
        const xssFired = window.__XSS_FIRED__ === true;
        const boldEl = document.getElementById('xss-test-bold');
        const hasRawTagInText = document.body.innerText.includes('<b id="xss-test-bold">');
        return {
            xssFired,
            renderedAsHtmlTag: !!boldEl,
            renderedAsEscapedString: hasRawTagInText
        };
    });

    console.log('3. XSS Evaluation Result in DOM:', xssEvaluation);
    await browser.close();
}

checkXss().catch(console.error);
