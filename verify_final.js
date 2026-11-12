const puppeteer = require('puppeteer-core');

async function verifyAllEnhancements() {
    console.log('--- STARTING COMPREHENSIVE FINAL VERIFICATION ---');
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 950 });

    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(`[${page.url()}] ${msg.text()}`);
            console.log(`[BROWSER ERROR] ${msg.text()}`);
        }
    });

    // 1. Check /cases/1/view with IPR Section
    console.log('\n1. Verifying /cases/1/view and IPR Section...');
    await page.goto('http://localhost:8000/cases/1/view', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: 'D:\\Antigravity\\velourcare-ortho-cloud\\final_case_ipr_verified.png' });
    
    const iprFound = await page.evaluate(() => {
        const el = document.getElementById('velourcare-ipr-section');
        return el ? { found: true, text: el.innerText.slice(0, 300) } : { found: false };
    });
    console.log('IPR Section on Case View:', iprFound);

    // 2. Check 3D Simulation
    console.log('\n2. Verifying 3D Simulation at /simulation/velour-0001 ...');
    await page.goto('http://localhost:8000/simulation/velour-0001', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: 'D:\\Antigravity\\velourcare-ortho-cloud\\final_3d_simulation_verified.png' });
    const simTitle = await page.title();
    console.log('3D Simulation Page Title:', simTitle);

    // 3. Check /profile
    console.log('\n3. Verifying /profile ...');
    await page.goto('http://localhost:8000/profile', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: 'D:\\Antigravity\\velourcare-ortho-cloud\\final_profile_verified.png' });
    const profileText = await page.evaluate(() => document.body.innerText.slice(0, 250));
    console.log('Profile page snippet:', profileText.replace(/\s+/g, ' '));

    // 4. Check /roles/1/permissions
    console.log('\n4. Verifying /roles/1/permissions ...');
    await page.goto('http://localhost:8000/roles/1/permissions', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: 'D:\\Antigravity\\velourcare-ortho-cloud\\final_roles_permissions_verified.png' });
    const permsText = await page.evaluate(() => document.body.innerText.slice(0, 250));
    console.log('Role Permissions snippet:', permsText.replace(/\s+/g, ' '));

    // 5. Check /messages
    console.log('\n5. Verifying /messages ...');
    await page.goto('http://localhost:8000/messages', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: 'D:\\Antigravity\\velourcare-ortho-cloud\\final_messages_verified.png' });
    const msgsText = await page.evaluate(() => document.body.innerText.slice(0, 250));
    console.log('Messages snippet:', msgsText.replace(/\s+/g, ' '));

    console.log('\nTotal Browser Errors across all 5 checks:', errors.length);

    await browser.close();
}

verifyAllEnhancements().catch(console.error);
