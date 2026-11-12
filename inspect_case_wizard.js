const fs = require('fs');
const file = 'public/assets/TimeDifference-C0Up6Tht.js';
const text = fs.readFileSync(file, 'utf8');

// Search for CreateCaseModal submit logic
const pos = text.indexOf('CreateCaseModal');
console.log('CreateCaseModal found at:', pos);

// Search for onSubmit or handleSubmit or store-in-pipeline in this file
const match = text.match(/storeInPipeline|store-in-pipeline/g);
console.log('store-in-pipeline matches:', match);

// Let's print the submission function
const pSubmit = text.indexOf('storeInPipeline');
if (pSubmit !== -1) {
    console.log(text.slice(Math.max(0, pSubmit - 200), Math.min(text.length, pSubmit + 300)));
}
