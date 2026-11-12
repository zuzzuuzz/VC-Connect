const fs = require('fs');
const s = fs.readFileSync('server.js', 'utf8');

const routeRegex = /app\.(get|post|put|patch|delete)\(\[?['"`]([^'"`]+)['"`]/g;
const routes = [];
let m;
while ((m = routeRegex.exec(s)) !== null) {
    routes.push({ method: m[1], path: m[2], index: m.index });
}

console.log(`Total routes found: ${routes.length}`);

// Group by prefix (e.g. /api/cases, /api/clients)
const prefixes = ['/api/cases', '/api/clients', '/api/sub-clients', '/api/vendors', '/api/users', '/api/roles', '/api/invoices', '/api/bank-accounts', '/api/settings'];

prefixes.forEach(prefix => {
    const list = routes.filter(r => r.path.startsWith(prefix));
    let paramIndex = -1;
    let paramPath = null;
    list.forEach(r => {
        const segs = r.path.slice(prefix.length).split('/').filter(Boolean);
        if (segs.length === 1 && segs[0].startsWith(':')) {
            if (paramIndex === -1) {
                paramIndex = r.index;
                paramPath = r.path;
            }
        } else if (segs.length === 1 && !segs[0].startsWith(':')) {
            if (paramIndex !== -1 && r.index > paramIndex) {
                console.log(`[SHADOWING BUG] Method: ${r.method.toUpperCase()} ${r.path} is defined AFTER parameterized ${paramPath}!`);
            }
        }
    });
});
