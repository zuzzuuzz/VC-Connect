const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'public', 'assets');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

files.forEach(f => {
    const text = fs.readFileSync(path.join(dir, f), 'utf8');
    if (text.includes('test-email') || text.includes('testEmail') || text.includes('send-test-email') || text.includes('sendTestEmail')) {
        console.log('Email endpoint match in:', f);
        // Find axios call or endpoint string
        const regex = /["']([^"']*(?:test-email|testEmail|send-test|mail)[^"']*)["']/gi;
        let m;
        while ((m = regex.exec(text)) !== null) {
            console.log('  ->', m[1]);
        }
    }
});
