const fs = require('fs');
const path = require('path');

async function run() {
    console.log('--- TEST: FRONTEND UI GLITCHES, DOM POLLING & UX POLISH ---');
    let failed = 0;

    const indexPath = path.join(__dirname, '..', 'public', 'index.html');
    const indexContent = fs.readFileSync(indexPath, 'utf8');

    // 1. Verify elimination of DOM polling setInterval(checkAndInjectIPR, 500)
    console.log('1. Checking for removal of setInterval(checkAndInjectIPR, 500)...');
    if (indexContent.includes('setInterval(checkAndInjectIPR')) {
        console.error('   ❌ Found setInterval(checkAndInjectIPR) polling DOM tree every 500ms!');
        failed++;
    } else if (indexContent.includes('MutationObserver')) {
        console.log('   ✅ PASS (Replaced with MutationObserver)');
    } else {
        console.error('   ❌ MutationObserver not found in index.html');
        failed++;
    }

    // 2. Verify WebSocket/Pusher mock to prevent net::ERR_CONNECTION_REFUSED console storm
    console.log('2. Checking for WebSocket / Pusher mock interceptor...');
    if (indexContent.includes('mockWs') && indexContent.includes('pusher:connection_established')) {
        console.log('   ✅ PASS (WebSocket / Pusher mock installed)');
    } else {
        console.error('   ❌ WebSocket / Pusher mock interceptor missing from index.html');
        failed++;
    }

    // 3. Verify Role Switcher collapsible toggle
    console.log('3. Checking for role switcher minimize/toggle UI...');
    if (indexContent.includes('role-switcher-toggle') || indexContent.includes('toggleRoleSwitcher')) {
        console.log('   ✅ PASS (Role switcher minimize toggle present)');
    } else {
        console.error('   ❌ Role switcher minimize toggle missing');
        failed++;
    }

    // 4. Verify RTL language synchronization hook
    console.log('4. Checking for RTL direction synchronization hook...');
    if (indexContent.includes('syncDirWithLocale') || indexContent.includes("setAttribute('dir', 'rtl')")) {
        console.log('   ✅ PASS (RTL synchronization hook present)');
    } else {
        console.error('   ❌ RTL synchronization hook missing from index.html');
        failed++;
    }

    // 5. Verify simulation.html event deprecation fix and THREE offline fallback
    console.log('5. Checking simulation.html event and THREE fallback...');
    const simPath = path.join(__dirname, '..', 'public', 'simulation.html');
    const simContent = fs.readFileSync(simPath, 'utf8');
    if (simContent.includes('if (event && event.target)')) {
        console.error('   ❌ simulation.html still uses deprecated global event object');
        failed++;
    } else if (simContent.includes('typeof THREE ===') || simContent.includes('typeof THREE !==')) {
        console.log('   ✅ PASS (event cleaned up and THREE fallback present)');
    } else {
        console.error('   ❌ simulation.html missing THREE fallback check');
        failed++;
    }

    console.log(`\nResult: ${failed === 0 ? 'ALL PASSED' : failed + ' TESTS FAILED'}`);
    process.exit(failed === 0 ? 0 : 1);
}

run().catch(e => {
    console.error(e);
    process.exit(1);
});
