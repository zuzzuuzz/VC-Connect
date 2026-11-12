import re

server_path = r'D:\Antigravity\velourcare-ortho-cloud\server.js'

with open(server_path, 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update db.roles
new_roles = """    roles: [
        { id: 1, name: "super-admin", users_count: 2, permissions_count: 18, created_at: "2026-01-01" },
        { id: 2, name: "admin", users_count: 3, permissions_count: 16, created_at: "2026-01-01" },
        { id: 3, name: "case-coordinator", users_count: 5, permissions_count: 12, created_at: "2026-01-01" },
        { id: 4, name: "planner", users_count: 8, permissions_count: 10, created_at: "2026-01-01" },
        { id: 5, name: "client", users_count: 42, permissions_count: 8, created_at: "2026-01-01" },
        { id: 6, name: "sub-client", users_count: 15, permissions_count: 6, created_at: "2026-01-01" },
        { id: 7, name: "vendor", users_count: 4, permissions_count: 6, created_at: "2026-01-01" }
    ],"""
code = re.sub(r'roles:\s*\[[\s\S]*?\](?=,\s*\n\s*clients:)', new_roles.strip()[:-1], code)

# 2. Update db.subClients
new_sub_clients = """    subClients: [
        {
            id: 1,
            name: "Wright Ortho Jumeirah Branch",
            email: "jumeirah@wrightortho.com",
            phone: "+971 4 344 1122",
            parent_client_id: 1,
            parent_client: { id: 1, name: "Wright Orthodontics Clinic" },
            user: { id: 102, username: "dr.jumeirah", email: "jumeirah@wrightortho.com" },
            status: { label: "Active", color: "success", value: "active" },
            is_sub_clients_allowed: "YES",
            case_id_prefix: "WRIGHTJ",
            cases_count: 14,
            updated_at: { human_readable: "2 days ago", timestamp: "2026-10-23 11:00" },
            created_at: "2026-04-12 09:00"
        }
    ],"""
code = re.sub(r'subClients:\s*\[[\s\S]*?\](?=,\s*\n\s*cases:)', new_sub_clients.strip()[:-1], code)

# 3. Update db.stepFiles
new_step_files = """    stepFiles: [
        {
            id: 1,
            case_id: 1,
            v_tratransfer_link: "https://wetransfer.com/downloads/velourcare-step-files-001",
            description: "<p><strong>Steps 01-22 STL Models</strong>. Precision thermoforming models trimmed at gingival margin + 0.5mm scallop.</p>",
            zip_file_url: "/uploads/sample-treatment-models.zip",
            zip_file_name: "case-0001-aligner-steps.zip",
            status: { value: "approved", label: "Approved", color: "success" },
            created_at: { human_readable: "3 days ago", timestamp: "2026-10-23 11:00" },
            updated_at: { human_readable: "3 days ago", timestamp: "2026-10-23 11:00" }
        }
    ],"""
code = re.sub(r'stepFiles:\s*\[[\s\S]*?\](?=,\s*\n\s*treatmentPlans:)', new_step_files.strip()[:-1], code)

# 4. Update simulation_link in db.treatmentPlans
code = code.replace("https://cloud.smilegenix.ae/simulation/velour-0001", "/simulation/velour-0001")

# 5. Add routes for /api/roles/:id
role_by_id_endpoint = """app.get(['/api/roles/:id', '/roles/:id'], (req, res) => {
    const roleId = parseInt(req.params.id);
    const found = db.roles.find(r => r.id === roleId) || db.roles[0];
    res.json({ data: found });
});"""

if "app.get(['/api/roles/:id'" not in code:
    code = code.replace("app.get(['/api/roles', '/roles'], (req, res) => {", role_by_id_endpoint + "\n\napp.get(['/api/roles', '/roles'], (req, res) => {")

# 6. Add Profile Endpoints
profile_endpoints = """
// ==========================================
// PROFILE API ENDPOINTS
// ==========================================
app.get(['/api/profile', '/profile'], (req, res) => {
    res.json({
        data: {
            id: db.currentUser.id,
            name: db.currentUser.name,
            username: db.currentUser.username,
            email: db.currentUser.email,
            phone: db.currentUser.phone,
            role: db.currentUser.role_slug,
            status: db.currentUser.status,
            profile_pic_url: db.currentUser.profile_pic_url,
            company_name: "VelourCare Orthodontics HQ",
            address: "Building 64, Al Razi Medical Complex, Suite 302",
            city: "Dubai",
            country: "United Arab Emirates",
            timezone: "Asia/Dubai (UTC+4)",
            shipment_addresses: [
                {
                    id: 1,
                    title: "VelourCare Main Headquarters",
                    address_line_1: "Dubai Healthcare City, Building 64",
                    city: "Dubai",
                    country: "United Arab Emirates",
                    phone: "+971 4 800 8356",
                    is_default: true
                }
            ],
            services: [
                { id: 1, name: "Digital Treatment Planning & Staging", status: "active" },
                { id: 2, name: "Automated IPR Sheet Generation", status: "active" },
                { id: 3, name: "Clear Aligner Thermoforming & Laser Trimming", status: "active" }
            ]
        }
    });
});

app.put(['/api/profile', '/profile'], (req, res) => {
    Object.assign(db.currentUser, req.body);
    res.json({
        success: true,
        message: "Profile updated successfully",
        data: db.currentUser
    });
});

app.post(['/api/profile', '/profile'], (req, res) => {
    Object.assign(db.currentUser, req.body);
    res.json({
        success: true,
        message: "Profile updated successfully",
        data: db.currentUser
    });
});
"""

if "PROFILE API ENDPOINTS" not in code:
    code = code.replace("// ==========================================\n// 1. SANCTUM CSRF COOKIE & AUTH", profile_endpoints + "\n// ==========================================\n// 1. SANCTUM CSRF COOKIE & AUTH")

# 7. Add Messages / Chat Endpoints
chat_endpoints = """
// ==========================================
// CHAT & MESSAGES API ENDPOINTS
// ==========================================
app.get(['/api/chat', '/chat'], (req, res) => {
    res.json({
        data: [
            {
                id: 1,
                receiver_id: 2,
                user: {
                    id: 2,
                    name: "Dr. Alexander Wright",
                    username: "dr.wright",
                    profile_pic_url: "/assets/velourcare-square.png",
                    role_name: "Doctor (Clinic)"
                },
                last_message: {
                    id: 101,
                    message: "Treatment plan v1 is reviewed and ready for manufacturing.",
                    created_at: "2026-10-25 14:30",
                    is_read: true
                },
                unread_count: 0
            }
        ],
        additional: {
            contacts: [
                {
                    id: 2,
                    name: "Dr. Alexander Wright",
                    email: "doctor@velourcare.com",
                    role: "client",
                    profile_pic_url: "/assets/velourcare-square.png"
                },
                {
                    id: 3,
                    name: "Sarah Miller (CAD Planner)",
                    email: "planner@velourcare.com",
                    role: "planner",
                    profile_pic_url: "/assets/velourcare-square.png"
                },
                {
                    id: 4,
                    name: "VelourCare 3D Production Lab",
                    email: "lab@velourcare.com",
                    role: "vendor",
                    profile_pic_url: "/assets/velourcare-square.png"
                }
            ]
        },
        meta: {
            current_page: 1,
            last_page: 1,
            per_page: 15,
            total: 1
        }
    });
});

app.get(['/api/chat/:id', '/chat/:id'], (req, res) => {
    res.json({
        data: [
            {
                id: 100,
                sender_id: 2,
                receiver_id: 1,
                message: "Hello, has the IPR chart been finalized for Case #VELOUR-0001?",
                created_at: "2026-10-25 14:15",
                is_read: true
            },
            {
                id: 101,
                sender_id: 1,
                receiver_id: 2,
                message: "Yes, Dr. Wright. The IPR chart is attached to Treatment Plan #1 with total 1.20mm reduction scheduled.",
                created_at: "2026-10-25 14:20",
                is_read: true
            }
        ]
    });
});

app.post(['/api/chat', '/chat'], (req, res) => {
    const newMsg = {
        id: Date.now(),
        sender_id: db.currentUser.id,
        receiver_id: req.body.receiver_id || 2,
        message: req.body.message || "Message sent.",
        created_at: new Date().toISOString().replace('T', ' ').slice(0, 16),
        is_read: true
    };
    res.json({
        success: true,
        data: newMsg
    });
});

app.post(['/api/chat/:id/mark-as-read', '/chat/:id/mark-as-read'], (req, res) => {
    res.json({ success: true, message: "Marked as read" });
});
"""

if "CHAT & MESSAGES API ENDPOINTS" not in code:
    code = code.replace("// ==========================================\n// 5. TREATMENT PLANS & IPR DOCUMENT", chat_endpoints + "\n// ==========================================\n// 5. TREATMENT PLANS & IPR DOCUMENT")

# 8. Add Simulation 3D route
simulation_route = """
// 3D Aligner Simulation Route
app.get(['/simulation/:caseId', '/simulation', '/simulation.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'simulation.html'));
});
"""

if "3D Aligner Simulation Route" not in code:
    code = code.replace("app.use(express.static(path.join(__dirname, 'public')));", "app.use(express.static(path.join(__dirname, 'public')));\n" + simulation_route)

with open(server_path, 'w', encoding='utf-8') as f:
    f.write(code)

print("server.js updated with profile, chat, simulation, and updated database models!")
