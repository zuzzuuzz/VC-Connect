const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'public', 'assets');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
const modals = [];

files.forEach(f => {
    const text = fs.readFileSync(path.join(dir, f), 'utf8');
    const matches = text.matchAll(/name:\s*["']([a-zA-Z0-9_]+Modal)["']/g);
    for (const m of matches) {
        modals.push(f + ' -> ' + m[1]);
    }
});

console.log('=== All Modals in the Application ===');
console.log(modals.join('\n'));
