const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'public', 'assets', 'view-DS3MYUE6.js');
const text = fs.readFileSync(file, 'utf8');

// Search for modal refs or click handlers in view-DS3MYUE6.js
const keywords = ['ChangeStatusModal', 'AssignPlannerModal', 'ChangeClientModal', 'EditCaseModal', 'ChangeCaseIdModal', 'EditPatientModal'];

keywords.forEach(kw => {
    let pos = 0;
    console.log(`\n=== Keyword: ${kw} ===`);
    while ((pos = text.indexOf(kw, pos)) !== -1) {
        const snippet = text.slice(Math.max(0, pos - 150), Math.min(text.length, pos + 150));
        console.log(`Found at ${pos}:\n${snippet}\n`);
        pos += kw.length;
    }
});
