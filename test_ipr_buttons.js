const puppeteer = require('puppeteer-core');

async function testIprEndpoints() {
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 950 });

    // Test 1: IPR PDF
    console.log('Testing IPR PDF download endpoint...');
    const pdfRes = await page.goto('http://localhost:8000/uploads/velourcare-ipr-chart-sample.pdf');
    console.log('PDF HTTP Status:', pdfRes.status(), 'Content-Type:', pdfRes.headers()['content-type']);

    // Test 2: Document Editor / Interactive Teeth Chart
    console.log('Testing Interactive Teeth Chart & Plan Document Editor...');
    const docErrors = [];
    page.on('console', msg => { if (msg.type() === 'error') docErrors.push(msg.text()); });
    const docRes = await page.goto('http://localhost:8000/cases/1/treatment-plans/1/document', { waitUntil: 'networkidle2' });
    console.log('Doc Editor Status:', docRes.status());
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: 'D:\\Antigravity\\velourcare-ortho-cloud\\ipr_doc_editor_check.png' });
    console.log('Doc Editor Console Errors:', docErrors);

    // Test 3: 3D Simulation
    console.log('Testing 3D Dental Simulation...');
    const simErrors = [];
    page.on('console', msg => { if (msg.type() === 'error') simErrors.push(msg.text()); });
    const simRes = await page.goto('http://localhost:8000/simulation/velour-0001', { waitUntil: 'networkidle2' });
    console.log('Simulation Status:', simRes.status());
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: 'D:\\Antigravity\\velourcare-ortho-cloud\\ipr_simulation_check.png' });
    console.log('Simulation Console Errors:', simErrors);

    await browser.close();
}

testIprEndpoints().catch(console.error);
