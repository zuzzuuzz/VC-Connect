const puppeteer = require('puppeteer-core');

const BASE_URL = 'http://localhost:8000';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function verifyModalsExact() {
    const browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    await page.goto(`${BASE_URL}/cases/1/view`, { waitUntil: 'networkidle2' });
    await sleep(1500);

    const tests = [
        {
            name: 'Change Case Status Modal',
            clickSelector: () => {
                const el = Array.from(document.querySelectorAll('span, div, h6')).find(e => e.innerText.trim() === 'CASE STATUS');
                const btn = el?.closest('.card-body, div')?.querySelector('button');
                if (btn) btn.click();
            }
        },
        {
            name: 'Assign / Change Planner Modal',
            clickSelector: () => {
                const el = Array.from(document.querySelectorAll('span, div, h6')).find(e => e.innerText.trim() === 'CAD Planner' || e.innerText.trim() === 'Planner');
                const btn = el?.closest('.card-body, div')?.querySelector('button');
                if (btn) btn.click();
            }
        },
        {
            name: 'Change Client Modal',
            clickSelector: () => {
                const el = Array.from(document.querySelectorAll('span, div, strong')).find(e => e.innerText.includes('Clinic:'));
                const btn = el?.parentElement?.querySelector('button');
                if (btn) btn.click();
            }
        },
        {
            name: 'Edit Case (Clinical Details) Modal',
            clickSelector: () => {
                const el = Array.from(document.querySelectorAll('h6')).find(e => e.innerText.includes('Clinical Details'));
                const btn = el?.parentElement?.querySelector('button');
                if (btn) btn.click();
            }
        },
        {
            name: 'Change Case ID Modal',
            clickSelector: () => {
                const el = Array.from(document.querySelectorAll('span')).find(e => e.innerText.trim() === 'VELOUR-0001');
                const btn = el?.parentElement?.querySelector('button');
                if (btn) btn.click();
            }
        },
        {
            name: 'Edit Patient Details Modal',
            clickSelector: () => {
                const el = Array.from(document.querySelectorAll('h6')).find(e => e.innerText.includes('Patient Details'));
                const btn = el?.parentElement?.querySelector('button');
                if (btn) btn.click();
            }
        }
    ];

    for (const t of tests) {
        console.log(`\nTesting exact button for: "${t.name}"...`);
        await page.evaluate(t.clickSelector);
        await sleep(800);

        const res = await page.evaluate(() => {
            const m = document.querySelector('.modal.show, .modal[style*="display: block"]');
            return {
                open: !!m,
                title: m?.querySelector('.modal-title')?.innerText || 'No title found',
                hasForm: !!m?.querySelector('form, .modal-body')
            };
        });
        console.log(`-> Modal opened: ${res.open} | Title: "${res.title}"`);

        if (res.open) {
            await page.evaluate(() => {
                const c = document.querySelector('.modal.show .btn-close, .modal.show [data-bs-dismiss="modal"]');
                if (c) c.click();
            });
            await sleep(500);
        }
    }

    await browser.close();
}

verifyModalsExact().catch(console.error);
