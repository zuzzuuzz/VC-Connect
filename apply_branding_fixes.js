const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, 'public', 'assets', 'index-5EUXN9UG.js');
let indexContent = fs.readFileSync(indexFile, 'utf8');

let count = 0;

// 1. Replace q2="SmileGenix Admin Portal"
if (indexContent.includes('q2="SmileGenix Admin Portal"')) {
    indexContent = indexContent.replaceAll('q2="SmileGenix Admin Portal"', 'q2="VelourCare Ortho"');
    console.log('Replaced q2="SmileGenix Admin Portal" with "VelourCare Ortho"');
    count++;
}

// 2. Replace wsHost:"api.cloud.smilegenix.ae" with wsHost:(typeof window!=="undefined"?window.location.hostname:"localhost")
if (indexContent.includes('wsHost:"api.cloud.smilegenix.ae"')) {
    indexContent = indexContent.replaceAll('wsHost:"api.cloud.smilegenix.ae"', 'wsHost:(typeof window!=="undefined"?window.location.hostname:"localhost")');
    console.log('Replaced wsHost with dynamic window.location.hostname');
    count++;
}

// 3. Replace SmileGenix Test Notification across all languages
if (indexContent.includes('SmileGenix Test Notification')) {
    indexContent = indexContent.replaceAll('SmileGenix Test Notification', 'VelourCare Ortho Test Notification');
    console.log('Replaced all "SmileGenix Test Notification" with "VelourCare Ortho Test Notification"');
    count++;
}

fs.writeFileSync(indexFile, indexContent, 'utf8');
console.log(`Updated ${indexFile} with ${count} replacements.`);

// Also check index-DSUwJ5hT.js
const emailModalFile = path.join(__dirname, 'public', 'assets', 'index-DSUwJ5hT.js');
if (fs.existsSync(emailModalFile)) {
    let emailContent = fs.readFileSync(emailModalFile, 'utf8');
    if (emailContent.includes('SmileGenix')) {
        emailContent = emailContent.replaceAll('SmileGenix', 'VelourCare Ortho');
        fs.writeFileSync(emailModalFile, emailContent, 'utf8');
        console.log(`Updated ${emailModalFile}`);
    }
}
