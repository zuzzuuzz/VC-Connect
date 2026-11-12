const puppeteer = require('puppeteer-core');
const BASE_URL = 'http://localhost:8000';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testPostComment() {
    const browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: 'new',
        args: ['--no-sandbox']
    });

    const page = await browser.newPage();
    const reqs = [];
    page.on('request', req => {
        if (req.url().includes('comment') || req.method() === 'POST') {
            reqs.push({ method: req.method(), url: req.url(), postData: req.postData() });
        }
    });

    await page.goto(`${BASE_URL}/cases/1/view`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));

    // Type into comment box
    await page.evaluate(() => {
        const textarea = document.querySelector('.case-discussion-col textarea, .case-chat-section textarea');
        if (textarea) {
            textarea.value = 'Hello from automated comment test!';
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
        }
    });
    await new Promise(r => setTimeout(r, 500));

    // Click send
    await page.evaluate(() => {
        const sendBtn = document.querySelector('.case-discussion-col .comment-composer__send, .case-chat-section .comment-composer__send');
        if (sendBtn) sendBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    console.log('Requests captured:', reqs);

    const isCommentPresent = await page.evaluate(() => {
        return document.querySelector('.case-chat-section')?.innerText.includes('Hello from automated comment test!');
    });
    console.log('Is new comment present in chat stream?', isCommentPresent);

    await browser.close();
}

testPostComment().catch(console.error);
