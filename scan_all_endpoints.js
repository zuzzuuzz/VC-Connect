const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'public', 'assets');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

const endpoints = new Set();
const serviceEndpoints = new Set();
const templateEndpoints = new Set();

files.forEach(f => {
    const text = fs.readFileSync(path.join(dir, f), 'utf8');
    
    // BaseService extensions: constructor() { super('/endpoint') }
    const superMatches = text.matchAll(/super\s*\(\s*['"]([^'"]+)['"]\s*\)/g);
    for (const m of superMatches) {
        serviceEndpoints.add(m[1]);
    }
    
    // Direct HTTP calls: (get|post|put|patch|delete)('endpoint')
    const httpMatches = text.matchAll(/\.(get|post|put|patch|delete)\s*\(\s*['"]([^'"]+)['"]/g);
    for (const m of httpMatches) {
        endpoints.add(m[2]);
    }

    // Template string HTTP calls: (get|post|put|patch|delete)(`endpoint`)
    const templateMatches = text.matchAll(/\.(get|post|put|patch|delete)\s*\(\s*`([^`]+)`/g);
    for (const m of templateMatches) {
        templateEndpoints.add(m[2]);
    }
});

console.log('=== BaseService Endpoints ===');
console.log(Array.from(serviceEndpoints).sort());

console.log('\n=== Direct HTTP Endpoints ===');
console.log(Array.from(endpoints).sort());

console.log('\n=== Template String HTTP Endpoints ===');
console.log(Array.from(templateEndpoints).sort());
