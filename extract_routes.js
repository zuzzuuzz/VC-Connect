const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'public', 'assets', 'index-5EUXN9UG.js');
const content = fs.readFileSync(file, 'utf8');

// Find occurrences of path:
const regex = /path:\s*["']([^"']+)["']/g;
const paths = [];
let match;
while ((match = regex.exec(content)) !== null) {
    paths.push(match[1]);
}
console.log('All registered router paths:');
console.log(paths);
