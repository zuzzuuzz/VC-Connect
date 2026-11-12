const fs = require('fs');
const file = 'public/assets/view-DS3MYUE6.js';
const text = fs.readFileSync(file, 'utf8');

// Search for where no, Fo, yu, _h, Mh, Oh are referenced as components in the render function
// no = EditCaseModal
// Fo = EditPatientModal
// yu = ChangeClientModal
// _h = ChangeCaseIdModal
// Mh = ChangeStatusModal
// Oh = AssignPlannerModal

const comps = ['no', 'Fo', 'yu', '_h', 'Mh', 'Oh'];
comps.forEach(c => {
    let pos = 0;
    console.log(`\n=== Component tag: ${c} ===`);
    while ((pos = text.indexOf(c + '({', pos)) !== -1 || (pos = text.indexOf(c + ',', pos)) !== -1) {
        console.log(`Found around ${pos}:\n${text.slice(Math.max(0, pos - 100), Math.min(text.length, pos + 150))}\n`);
        pos += c.length + 5;
    }
});
