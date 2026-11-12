import re

server_path = r'D:\Antigravity\velourcare-ortho-cloud\server.js'

with open(server_path, 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update SPA middleware to ignore /simulation
old_spa_middleware = """app.use((req, res, next) => {
    if (req.method === 'GET' && 
        !req.path.startsWith('/api/') && 
        !req.path.startsWith('/sanctum/') && 
        !req.path.startsWith('/broadcasting/') &&
        !req.path.startsWith('/assets/') &&
        !req.path.startsWith('/uploads/') &&
        !req.path.includes('.') && 
        req.accepts('html')) {
        return res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
    next();
});"""

new_spa_middleware = """// 3D Simulation Route (Serve standalone WebGL 3D Aligner Viewer)
app.get(['/simulation/:caseId', '/simulation', '/simulation.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'simulation.html'));
});

app.use((req, res, next) => {
    if (req.method === 'GET' && 
        !req.path.startsWith('/api/') && 
        !req.path.startsWith('/sanctum/') && 
        !req.path.startsWith('/broadcasting/') &&
        !req.path.startsWith('/assets/') &&
        !req.path.startsWith('/uploads/') &&
        !req.path.startsWith('/simulation') &&
        !req.path.includes('.') && 
        req.accepts('html')) {
        return res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
    next();
});"""

code = code.replace(old_spa_middleware, new_spa_middleware)

# 2. Update /api/permissions to return grouped object
old_permissions_endpoint = """app.get(['/api/permissions', '/permissions'], (req, res) => {
    res.json({ data: db.allPermissions });
});"""

new_permissions_endpoint = """app.get(['/api/permissions', '/permissions'], (req, res) => {
    const grouped = {};
    db.allPermissions.forEach(p => {
        const grp = p.group || "General";
        if (!grouped[grp]) grouped[grp] = [];
        grouped[grp].push(p);
    });
    res.json({ data: grouped });
});"""

code = code.replace(old_permissions_endpoint, new_permissions_endpoint)

# 3. Update /api/permissions/:id/role to return permissions array and object
old_role_perms = """app.get(['/api/permissions/:id/role', '/permissions/:id/role'], (req, res) => {
    res.json({ data: db.allPermissions });
});"""

new_role_perms = """app.get(['/api/permissions/:id/role', '/permissions/:id/role'], (req, res) => {
    res.json({ 
        data: db.allPermissions,
        permissions: db.allPermissions
    });
});"""

code = code.replace(old_role_perms, new_role_perms)

with open(server_path, 'w', encoding='utf-8') as f:
    f.write(code)

print("Applied simulation, permissions, and role perms patches to server.js!")
