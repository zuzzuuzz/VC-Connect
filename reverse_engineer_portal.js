const fs = require('fs');
const path = require('path');

const assetsDir = 'D:\\Antigravity\\velourcare-ortho-cloud\\public\\assets';

console.log('=== STARTING DEEP REVERSE-ENGINEERING OF SMILEGENIX PORTAL ===');

// 1. Scan all JS files in assets
const files = fs.readdirSync(assetsDir).filter(f => f.endsWith('.js'));
console.log(`Found ${files.length} JavaScript asset chunks to analyze.`);

// Data accumulators
const allRoutes = new Set();
const allApiEndpoints = new Set();
const allPermissions = new Set();
const allPiniaStores = new Set();
const allRoles = new Set();
const allTransitions = new Set();

const routeRegex = /path:\s*["']([^"']+)["']/g;
const apiRegex = /["'](\/(?:api|cases|clients|vendors|invoices|users|roles|auth|sanctum)[^"']*)["']/g;
const permRegex = /["']([a-z_]+_[a-z_]+|[a-z]+-[a-z]+) permission["']/g;
const storeRegex = /defineStore\(["']([^"']+)["']/g;
const transitionRegex = /class:\s*["']([^"']*(?:fade|slide|transition|animate|collapse|zoom)[^"']*)["']/gi;

for (const f of files) {
    const fp = path.join(assetsDir, f);
    const content = fs.readFileSync(fp, 'utf8');

    // Extract routes
    let match;
    while ((match = routeRegex.exec(content)) !== null) {
        if (!match[1].includes('{') && match[1].length < 60) {
            allRoutes.add(match[1]);
        }
    }

    // Extract API endpoints
    while ((match = apiRegex.exec(content)) !== null) {
        if (!match[1].includes('${') && !match[1].endsWith('.png') && !match[1].endsWith('.js') && !match[1].endsWith('.css') && match[1].length < 80) {
            allApiEndpoints.add(match[1]);
        }
    }

    // Extract Pinia stores
    while ((match = storeRegex.exec(content)) !== null) {
        allPiniaStores.add(match[1]);
    }

    // Extract transitions/animations
    while ((match = transitionRegex.exec(content)) !== null) {
        match[1].split(' ').forEach(cls => {
            if (/fade|slide|collapse|spin|zoom|pulse|anim/i.test(cls)) {
                allTransitions.add(cls);
            }
        });
    }
}

// Search for permissions in useAuthorization / vendor / main
const authBundle = fs.readFileSync(path.join(assetsDir, 'useAuthorization-y-F_p07I.js'), 'utf8');
const mainBundle = fs.readFileSync(path.join(assetsDir, 'main-C2PpKz4j.js'), 'utf8');

console.log('\n--- EXTRACTED ARCHITECTURAL SIGNATURES ---');
console.log(`Total Routes Discovered: ${allRoutes.size}`);
console.log(`Total API Endpoints Discovered: ${allApiEndpoints.size}`);
console.log(`Total Pinia Stores Discovered: ${allPiniaStores.size}`);
console.log(`Total Animation / Transition Classes: ${allTransitions.size}`);

const output = {
    routes: Array.from(allRoutes).sort(),
    apiEndpoints: Array.from(allApiEndpoints).sort(),
    piniaStores: Array.from(allPiniaStores).sort(),
    animations: Array.from(allTransitions).sort()
};

fs.writeFileSync('D:\\Antigravity\\velourcare-ortho-cloud\\re_portal_analysis.json', JSON.stringify(output, null, 2));
console.log('Saved extracted signatures to D:\\Antigravity\\velourcare-ortho-cloud\\re_portal_analysis.json');
