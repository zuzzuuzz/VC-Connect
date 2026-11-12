const puppeteer = require('puppeteer-core');
const fs = require('fs');

const BASE_URL = 'http://localhost:8000';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

async function testCaseInteractions() {
    console.log('--- TESTING CASE DETAIL MODALS & ACTIONS ---');
    const browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') errors.push({ url: page.url(), text: msg.text() });
    });
    page.on('pageerror', err => errors.push({ url: page.url(), text: err.toString() }));

    await page.goto(`${BASE_URL}/cases/1/view`, { waitUntil: 'networkidle2' });
    await sleep(1500);

    // 1. Find all action buttons with text "Change", "Assign", "Edit"
    const actionButtons = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const targets = btns.filter(b => ['Change', 'Assign', 'Edit', 'Refresh Case'].includes(b.innerText.trim()));
        return targets.map((b, idx) => ({
            idx,
            text: b.innerText.trim(),
            classes: b.className,
            parentText: b.parentElement?.innerText?.slice(0, 50)
        }));
    });
    console.log('Action buttons found:', actionButtons);

    // Click each action button and observe if a modal opens
    for (let i = 0; i < actionButtons.length; i++) {
        const item = actionButtons[i];
        if (item.text === 'Refresh Case') continue;

        console.log(`\nClicking button #${i}: "${item.text}" (Parent: ${item.parentText.replace(/\n/g, ' ')})...`);
        await page.evaluate((index) => {
            const btns = Array.from(document.querySelectorAll('button'));
            const targets = btns.filter(b => ['Change', 'Assign', 'Edit'].includes(b.innerText.trim()));
            if (targets[index]) targets[index].click();
        }, i);
        await sleep(800);

        const modalStatus = await page.evaluate(() => {
            const m = document.querySelector('.modal.show, .modal[style*="display: block"]');
            if (!m) return { open: false };
            return {
                open: true,
                id: m.id,
                title: m.querySelector('.modal-title')?.innerText || 'No title',
                inputsCount: m.querySelectorAll('input, select, textarea').length
            };
        });
        console.log(`Result for button #${i}:`, modalStatus);

        if (modalStatus.open) {
            // Close modal
            await page.evaluate(() => {
                const closeBtn = document.querySelector('.modal.show .btn-close, .modal.show [data-bs-dismiss="modal"]');
                if (closeBtn) closeBtn.click();
            });
            await sleep(500);
        }
    }

    // 2. Test Comment Posting
    console.log('\n--- Testing Comment Composer ---');
    const commentBox = await page.evaluate(() => {
        const editable = document.querySelector('.comment-composer [contenteditable="true"], .comment-composer textarea, [placeholder*="Comment"], .ck-editor__editable');
        const sendBtn = document.querySelector('.comment-composer__send, button.comment-send');
        return {
            hasEditable: !!editable,
            editableTag: editable?.tagName,
            editableClass: editable?.className,
            hasSendBtn: !!sendBtn
        };
    });
    console.log('Comment Composer Info:', commentBox);

    if (commentBox.hasEditable) {
        console.log('Typing test comment into composer...');
        await page.evaluate(() => {
            const el = document.querySelector('.comment-composer [contenteditable="true"], .comment-composer textarea, [placeholder*="Comment"], .ck-editor__editable');
            if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
                el.value = 'Automated QA Test Comment';
                el.dispatchEvent(new Event('input', { bubbles: true }));
            } else {
                el.innerText = 'Automated QA Test Comment';
                el.dispatchEvent(new Event('input', { bubbles: true }));
            }
            const send = document.querySelector('.comment-composer__send');
            if (send) send.click();
        });
        await sleep(1500);
        const commentPosted = await page.evaluate(() => {
            return document.body.innerText.includes('Automated QA Test Comment');
        });
        console.log('Comment posted successfully visible:', commentPosted);
    }

    // 3. Test 3D Simulation
    console.log('\n--- Testing Simulation Page (/simulation.html) ---');
    await page.goto(`${BASE_URL}/simulation.html`, { waitUntil: 'networkidle2' });
    await sleep(1500);
    const simTitle = await page.title();
    const simCanvas = await page.evaluate(() => {
        return {
            title: document.title,
            hasCanvas: !!document.querySelector('canvas'),
            canvasCount: document.querySelectorAll('canvas').length,
            threeJsLoaded: typeof window.THREE !== 'undefined',
            text: document.body.innerText.slice(0, 200)
        };
    });
    console.log('Simulation page inspection:', simCanvas);

    console.log('\nErrors recorded:', errors);
    await browser.close();
}

testCaseInteractions().catch(console.error);
