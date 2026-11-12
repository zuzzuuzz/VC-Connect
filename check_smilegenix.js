const fs = require('fs');
const file = 'public/assets/index-5EUXN9UG.js';
const content = fs.readFileSync(file, 'utf8');
let idx = 0;
while ((idx = content.indexOf('SmileGenix', idx)) !== -1) {
    const start = Math.max(0, idx - 100);
    const end = Math.min(content.length, idx + 100);
    console.log(`[Found at ${idx}]:\n...${content.slice(start, end)}...\n`);
    idx += 'SmileGenix'.length;
}
