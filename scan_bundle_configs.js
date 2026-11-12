const fs = require('fs');
const path = require('path');

// We have downloaded these bundles in our local assets folder!
const jsPath = 'D:\\Antigravity\\velourcare-ortho-cloud\\public\\assets\\index-5EUXN9UG.js';
const content = fs.readFileSync(jsPath, 'utf8');

console.log('--- SCANNING INDEX BUNDLE FOR SYSTEM CONFIGS ---');

// Search Pusher
const pusherMatch = content.match(/pusher[a-zA-Z0-9_\-\.:"']{0,100}/gi);
console.log('Pusher references:', Array.from(new Set(pusherMatch)).slice(0, 5));

// Search API Base URLs
const urlMatches = content.match(/https?:\/\/[a-zA-Z0-9\.\-_:\/]+/gi);
console.log('Hardcoded external URLs:', Array.from(new Set(urlMatches)).filter(u => !u.includes('w3.org') && !u.includes('adobe.com')));

// Search Environment Keys
const envMatches = content.match(/VITE_[A-Z0-9_]+/gi);
console.log('Exposed VITE_ env keys:', Array.from(new Set(envMatches)));

// Search Sentry / Monitoring
const sentryMatches = content.match(/sentry[a-zA-Z0-9_\-\.:"']{0,60}/gi);
console.log('Sentry / Error tracking:', Array.from(new Set(sentryMatches)).slice(0, 5));
