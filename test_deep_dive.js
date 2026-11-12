const puppeteer = require('puppeteer-core');
const fs = require('fs');

const BASE_URL = 'http://localhost:8000';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

async function deepDive() {
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
    page.on('pageerror', err => {
        errors.push({ url: page.url(), text: err.toString() });
    });

    console.log('=== TEST 1: Testing Edit Client Route (/clients/1/edit) ===');
    await page.goto(`${BASE_URL}/clients/1/edit`, { waitUntil: 'networkidle2' });
    await sleep(1500);
    const clientEditData = await page.evaluate(() => {
        return {
            title: document.title,
            headerText: document.querySelector('h4, .page-title')?.innerText,
            inputs: Array.from(document.querySelectorAll('input')).map(i => ({ name: i.name || i.id, val: i.value })),
            tabs: Array.from(document.querySelectorAll('.nav-tabs a, .nav-tabs button')).map(t => t.innerText.trim())
        };
    });
    console.log('Client Edit Page details:', clientEditData);

    console.log('\n=== TEST 2: Testing Sub-Client Edit Route (/sub-clients/1/edit) ===');
    await page.goto(`${BASE_URL}/sub-clients/1/edit`, { waitUntil: 'networkidle2' });
    await sleep(1500);
    const subClientEditData = await page.evaluate(() => {
        return {
            title: document.title,
            headerText: document.querySelector('h4, .page-title')?.innerText,
            inputsCount: document.querySelectorAll('input').length
        };
    });
    console.log('Sub-Client Edit Page details:', subClientEditData);

    console.log('\n=== TEST 3: Testing Vendor Edit & Clients Routes ===');
    await page.goto(`${BASE_URL}/vendors/1/edit`, { waitUntil: 'networkidle2' });
    await sleep(1500);
    console.log('Vendor Edit Page title:', await page.title());

    await page.goto(`${BASE_URL}/vendors/1/clients`, { waitUntil: 'networkidle2' });
    await sleep(1500);
    console.log('Vendor Clients Page title:', await page.title());

    console.log('\n=== TEST 4: Case Detail Action Buttons & Dropdowns (/cases/1/view) ===');
    await page.goto(`${BASE_URL}/cases/1/view`, { waitUntil: 'networkidle2' });
    await sleep(1500);

    // Let's inspect all dropdown toggles and action triggers in Case Detail
    const actionElements = await page.evaluate(() => {
        const triggers = Array.from(document.querySelectorAll('.dropdown-toggle, [data-bs-toggle="dropdown"], [data-bs-toggle="modal"], button.btn-soft-primary, button.btn-primary, .card-header button'));
        return triggers.map(t => ({
            tag: t.tagName,
            classes: t.className,
            text: t.innerText.trim(),
            dataToggle: t.getAttribute('data-bs-toggle'),
            dataTarget: t.getAttribute('data-bs-target')
        }));
    });
    console.log('Action elements on Case Detail:', JSON.stringify(actionElements, null, 2));

    // Try clicking dropdown toggles to see what options appear
    const dropdownResults = await page.evaluate(() => {
        const dropdowns = Array.from(document.querySelectorAll('.dropdown'));
        return dropdowns.map(d => {
            const toggle = d.querySelector('.dropdown-toggle');
            const menu = d.querySelector('.dropdown-menu');
            const items = menu ? Array.from(menu.querySelectorAll('a, button')).map(i => i.innerText.trim()) : [];
            return {
                toggleText: toggle?.innerText.trim() || 'No toggle text',
                menuItems: items
            };
        });
    });
    console.log('Dropdowns found on Case Detail:', JSON.stringify(dropdownResults, null, 2));

    console.log('\n=== TEST 5: Treatment Plans 3D Simulation & Plan Document ===');
    // Click on Treatment Plans tab
    await page.evaluate(() => {
        const tabs = Array.from(document.querySelectorAll('.nav-tabs a, .nav-tabs button'));
        const tpTab = tabs.find(t => t.innerText.includes('Treatment Plans'));
        if (tpTab) tpTab.click();
    });
    await sleep(1500);

    const tpContent = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('.tab-content button, .tab-content a.btn')).map(b => ({
            text: b.innerText.trim(),
            href: b.getAttribute('href'),
            classes: b.className
        }));
        return {
            buttons: btns,
            has3DViewer: !!document.querySelector('iframe, canvas, .viewer, [id*="viewer"]'),
            textSummary: document.querySelector('.tab-content')?.innerText.slice(0, 300)
        };
    });
    console.log('Treatment Plans Tab Content:', JSON.stringify(tpContent, null, 2));

    console.log('\n=== TEST 6: IPR Protocol Tab & Interactive Controls ===');
    await page.evaluate(() => {
        const tabs = Array.from(document.querySelectorAll('.nav-tabs a, .nav-tabs button'));
        const iprTab = tabs.find(t => t.innerText.includes('IPR Protocol'));
        if (iprTab) iprTab.click();
    });
    await sleep(1500);

    const iprContent = await page.evaluate(() => {
        const badges = Array.from(document.querySelectorAll('.ipr-table, table, .badge')).map(b => b.innerText.trim()).filter(Boolean);
        const inputs = Array.from(document.querySelectorAll('.tab-content input, .tab-content select')).length;
        const btns = Array.from(document.querySelectorAll('.tab-content button')).map(b => b.innerText.trim());
        return {
            tablesFound: document.querySelectorAll('.tab-content table').length,
            inputsCount: inputs,
            buttons: btns,
            snippet: document.querySelector('.tab-content')?.innerText.slice(0, 400)
        };
    });
    console.log('IPR Tab Content:', JSON.stringify(iprContent, null, 2));

    console.log('\n=== TEST 7: Plan Document Editor Teeth Chart Modal ===');
    await page.goto(`${BASE_URL}/cases/1/treatment-plans/1/document`, { waitUntil: 'networkidle2' });
    await sleep(1500);

    // Let's find why Teeth Chart Modal didn't open
    const teethBtnInfo = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const teethBtn = btns.find(b => b.innerText.includes('Edit Teeth Chart'));
        if (!teethBtn) return { found: false };
        return {
            found: true,
            tagName: teethBtn.tagName,
            disabled: teethBtn.disabled,
            classes: teethBtn.className,
            attributes: Array.from(teethBtn.attributes).map(a => `${a.name}="${a.value}"`)
        };
    });
    console.log('Teeth Chart Button Info:', teethBtnInfo);

    if (teethBtnInfo.found) {
        console.log('Clicking Edit Teeth Chart button...');
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const teethBtn = btns.find(b => b.innerText.includes('Edit Teeth Chart'));
            if (teethBtn) teethBtn.click();
        });
        await sleep(1000);
        const modalDom = await page.evaluate(() => {
            const modals = Array.from(document.querySelectorAll('.modal'));
            return modals.map(m => ({
                id: m.id,
                className: m.className,
                style: m.getAttribute('style'),
                ariaHidden: m.getAttribute('aria-hidden'),
                innerText: m.innerText.slice(0, 100)
            }));
        });
        console.log('Modals in DOM after click:', modalDom);
    }

    console.log('\n=== ERRORS RECORDED DURING DEEP DIVE ===');
    console.log(errors);

    await browser.close();
}

deepDive().catch(console.error);
