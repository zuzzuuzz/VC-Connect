const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'public', 'assets');
fs.readdirSync(dir).filter(f => f.endsWith('.js')).forEach(f => {
    const c = fs.readFileSync(path.join(dir, f), 'utf8');
    if (c.includes('createWebHistory') || c.includes('createRouter') || c.includes('/clients/')) {
        console.log('Matches:', f);
    }
});
