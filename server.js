const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const compression = require('compression');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8000;

// HTTP response compression (gzip/deflate) for assets and payloads
app.use(compression());

// Storage configuration for step files and attachments
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const ALLOWED_UPLOAD_EXTS = ['.stl', '.ply', '.obj', '.pdf', '.png', '.jpg', '.jpeg', '.zip', '.o3c'];

function sanitizeFileName(name) {
    return path.basename(name).replace(/[^a-zA-Z0-9._-]/g, '_');
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const safeName = sanitizeFileName(file.originalname);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + safeName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max limit
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (!ALLOWED_UPLOAD_EXTS.includes(ext)) {
            const err = new Error(`File extension '${ext}' is not permitted. Only medical 3D/PDF/ZIP assets allowed.`);
            err.code = 'INVALID_FILE_TYPE';
            return cb(err, false);
        }
        cb(null, true);
    }
});

// Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https://cdnjs.cloudflare.com https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:;");
    
    // Only apply no-store to dynamic API routes; allow caching for static assets
    if (req.path.startsWith('/api/') || req.path.startsWith('/sanctum/')) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    }
    next();
});
app.use(cors({
    origin: (origin, callback) => {
        // Allow localhost and local IPs or requests without origin (like same-origin / mobile apps / curl)
        if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
            callback(null, true);
        } else {
            callback(null, true);
        }
    },
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());


// Dynamic Portal Configuration (Single source of truth for addresses, clients, and dropdown types)
const configFilePath = path.join(__dirname, 'data', 'portal_config.json');

function getPortalConfig() {
    if (fs.existsSync(configFilePath)) {
        try {
            return JSON.parse(fs.readFileSync(configFilePath, 'utf8'));
        } catch (e) {
            console.error('Error reading portal_config.json:', e);
        }
    }
    return {};
}

function savePortalConfig(newConfig) {
    try {
        fs.writeFileSync(configFilePath, JSON.stringify(newConfig, null, 2), 'utf8');
        return true;
    } catch (e) {
        console.error('Error saving portal_config.json:', e);
        return false;
    }
}

function getActiveClients() {
    const cfg = getPortalConfig();
    const sourceClients = (cfg.clients && Array.isArray(cfg.clients) && cfg.clients.length > 0) 
        ? cfg.clients 
        : db.clients;
    return sourceClients.map(c => {
        const addrs = c.addresses || c.shipment_addresses || [];
        return {
            ...c,
            addresses: addrs,
            shipment_addresses: addrs
        };
    });
}

const allPermissionNames = [
    "view_users", "manage_users_permissions",
    "view_clients", "edit_clients",
    "view_sub_clients", "edit_sub_clients",
    "view_vendors", "edit_vendors", "allocate_vendor_clients",
    "view_cases", "edit_treatment_plans",
    "view_invoices",
    "view_roles", "manage_roles_permissions",
    "view_bank_accounts",
    "manage_stripe_platform", "manage_stripe_connect",
    "view_api_credentials"
];


const defaultSeedUsers = [
    {
        id: 1,
        name: "VelourCare Super Administrator",
        fullName: "VelourCare Super Administrator",
        first_name: "VelourCare",
        last_name: "Super Administrator",
        username: "admin",
        email: "admin@velourcare.com",
        phone: "+971 4 800 8356",
        role_slug: "super-admin",
        gender: "female",
        is_super_admin: true,
        status: { label: "Active", value: "active", color: "success" },
        profile_pic_url: "/assets/velourcare-square.png",
        permissions: allPermissionNames,
        integrations: { waveatp: true, smile_inspector: true },
        assigned_role_modal: {
            id: 1,
            name: "VelourCare Orthodontics HQ",
            company_name: "VelourCare Ortho",
            login_uri: "velourcare",
            login_image_url: "/assets/velourcare-logo.png",
            navigation_logo_url: "/assets/velourcare-logo.png",
            logo_url: "/assets/velourcare-square.png"
        },
        client: {
            id: 1,
            name: "VelourCare Orthodontics",
            case_id_prefix: "VELOUR",
            is_manufacturing_active: "YES"
        }
    },
    {
        id: 2,
        name: "Dr. Alexander Wright, DDS, MS",
        fullName: "Dr. Alexander Wright, DDS, MS",
        first_name: "Alexander",
        last_name: "Wright",
        username: "doctor",
        email: "doctor@velourcare.com",
        phone: "+971 50 123 4567",
        role_slug: "client",
        gender: "male",
        is_super_admin: false,
        status: { label: "Active", value: "active", color: "success" },
        profile_pic_url: "/assets/velourcare-square.png",
        permissions: ["view_clients", "view_sub_clients", "view_cases", "edit_treatment_plans", "view_invoices"],
        integrations: { waveatp: true, smile_inspector: true },
        assigned_role_modal: {
            id: 2,
            name: "Wright Orthodontic Clinic",
            company_name: "VelourCare Ortho",
            login_uri: "wright-ortho",
            login_image_url: "/assets/velourcare-logo.png",
            navigation_logo_url: "/assets/velourcare-logo.png",
            logo_url: "/assets/velourcare-square.png",
            sub_client_feature_access: {
                step_files: true,
                invoices: true,
                chat: true
            }
        },
        client: {
            id: 2,
            name: "Wright Orthodontic Clinic",
            case_id_prefix: "WRIGHT",
            is_manufacturing_active: "YES"
        }
    },
    {
        id: 3,
        name: "Sarah Miller (Senior CAD Planner)",
        fullName: "Sarah Miller (Senior CAD Planner)",
        first_name: "Sarah",
        last_name: "Miller",
        username: "planner",
        email: "planner@velourcare.com",
        phone: "+971 4 800 8358",
        role_slug: "planner",
        gender: "female",
        is_super_admin: false,
        status: { label: "Active", value: "active", color: "success" },
        profile_pic_url: "/assets/velourcare-square.png",
        permissions: ["view_clients", "view_vendors", "view_cases", "edit_treatment_plans"],
        integrations: { waveatp: true, smile_inspector: true },
        assigned_role_modal: {
            id: 3,
            name: "VelourCare Digital Planning Studio",
            company_name: "VelourCare Ortho",
            navigation_logo_url: "/assets/velourcare-logo.png"
        }
    },
    {
        id: 4,
        name: "VelourCare Aligner Lab",
        fullName: "VelourCare Aligner Lab",
        first_name: "Production",
        last_name: "Lab",
        username: "lab",
        email: "lab@velourcare.com",
        phone: "+971 4 800 8359",
        role_slug: "vendor",
        gender: "other",
        is_super_admin: false,
        status: { label: "Active", value: "active", color: "success" },
        profile_pic_url: "/assets/velourcare-square.png",
        permissions: ["view_vendors", "view_cases", "edit_treatment_plans"],
        integrations: { waveatp: true, smile_inspector: true },
        assigned_role_modal: {
            id: 4,
            name: "VelourCare 3D Production Lab",
            company_name: "VelourCare Ortho",
            navigation_logo_url: "/assets/velourcare-logo.png"
        }
    }
];

function getSafeUsers() {
    if (!db.users || !Array.isArray(db.users) || db.users.length === 0) {
        db.users = JSON.parse(JSON.stringify(defaultSeedUsers));
    }
    return db.users;
}

// Mock In-Memory Database
const db = {
    users: [
        {
            id: 1,
            name: "VelourCare Super Administrator",
            username: "admin",
            email: "admin@velourcare.com",
            phone: "+971 4 800 8356",
            role_slug: "super-admin",
            is_super_admin: true,
            status: "Active",
            profile_pic_url: "/assets/velourcare-square.png",
            permissions: allPermissionNames,
            integrations: { waveatp: true, smile_inspector: true },
            assigned_role_modal: {
                id: 1,
                name: "VelourCare Orthodontics HQ",
                company_name: "VelourCare Ortho",
                login_uri: "velourcare",
                login_image_url: "/assets/velourcare-logo.png",
                navigation_logo_url: "/assets/velourcare-logo.png",
                logo_url: "/assets/velourcare-square.png"
            },
            client: {
                id: 1,
                name: "VelourCare Orthodontics",
                case_id_prefix: "VELOUR",
                is_manufacturing_active: "YES"
            }
        },
        {
            id: 2,
            name: "Dr. Alexander Wright, DDS, MS",
            username: "doctor",
            email: "doctor@velourcare.com",
            phone: "+971 50 123 4567",
            role_slug: "client",
            is_super_admin: false,
            status: "Active",
            profile_pic_url: "/assets/velourcare-square.png",
            permissions: ["view_clients", "view_sub_clients"],
            integrations: { waveatp: true, smile_inspector: true },
            assigned_role_modal: {
                id: 2,
                name: "Wright Orthodontic Clinic",
                company_name: "VelourCare Ortho",
                login_uri: "wright-ortho",
                login_image_url: "/assets/velourcare-logo.png",
                navigation_logo_url: "/assets/velourcare-logo.png",
                logo_url: "/assets/velourcare-square.png",
                sub_client_feature_access: {
                    step_files: true,
                    invoices: true,
                    chat: true
                }
            },
            client: {
                id: 2,
                name: "Wright Orthodontic Clinic",
                case_id_prefix: "WRIGHT",
                is_manufacturing_active: "YES"
            }
        },
        {
            id: 3,
            name: "Sarah Miller (Senior CAD Planner)",
            username: "planner",
            email: "planner@velourcare.com",
            phone: "+971 4 800 8358",
            role_slug: "planner",
            is_super_admin: false,
            status: "Active",
            profile_pic_url: "/assets/velourcare-square.png",
            permissions: ["view_clients", "view_vendors"],
            integrations: { waveatp: true, smile_inspector: true },
            assigned_role_modal: {
                id: 3,
                name: "VelourCare Digital Planning Studio",
                company_name: "VelourCare Ortho",
                navigation_logo_url: "/assets/velourcare-logo.png"
            }
        },
        {
            id: 4,
            name: "VelourCare Aligner Lab",
            username: "lab",
            email: "lab@velourcare.com",
            phone: "+971 4 800 8359",
            role_slug: "vendor",
            is_super_admin: false,
            status: "Active",
            profile_pic_url: "/assets/velourcare-square.png",
            permissions: ["view_vendors"],
            integrations: { waveatp: true, smile_inspector: true },
            assigned_role_modal: {
                id: 4,
                name: "VelourCare 3D Production Lab",
                company_name: "VelourCare Ortho",
                navigation_logo_url: "/assets/velourcare-logo.png"
            }
        }
    ],

    currentUser: null,

        allPermissions: [
        { id: 1, name: "view_users", display_name: "View Users", group: "users" },
        { id: 2, name: "manage_users_permissions", display_name: "Manage Users Permissions", group: "users" },
        { id: 3, name: "view_clients", display_name: "View Clients", group: "clients" },
        { id: 4, name: "edit_clients", display_name: "Edit Clients", group: "clients" },
        { id: 5, name: "view_sub_clients", display_name: "View Sub Clients", group: "sub-clients" },
        { id: 6, name: "edit_sub_clients", display_name: "Edit Sub Clients", group: "sub-clients" },
        { id: 7, name: "view_vendors", display_name: "View Vendors", group: "vendors" },
        { id: 8, name: "edit_vendors", display_name: "Edit Vendors", group: "vendors" },
        { id: 9, name: "allocate_vendor_clients", display_name: "Allocate Vendor Clients", group: "vendors" },
        { id: 10, name: "view_cases", display_name: "View Cases", group: "cases" },
        { id: 11, name: "edit_treatment_plans", display_name: "Edit Treatment Plans", group: "treatment-plans" },
        { id: 12, name: "view_invoices", display_name: "View Invoices", group: "invoices" },
        { id: 13, name: "view_roles", display_name: "View Roles", group: "roles" },
        { id: 14, name: "manage_roles_permissions", display_name: "Manage Roles Permissions", group: "roles" },
        { id: 15, name: "view_bank_accounts", display_name: "View Bank Accounts", group: "banking" },
        { id: 16, name: "manage_stripe_platform", display_name: "Manage Stripe Platform", group: "settings" },
        { id: 17, name: "manage_stripe_connect", display_name: "Manage Stripe Connect", group: "settings" },
        { id: 18, name: "view_api_credentials", display_name: "View API Credentials", group: "settings" }
    ],

    roles: [
        { id: 1, name: "super-admin", users_count: 2, permissions_count: 18, created_at: "2026-01-01" },
        { id: 2, name: "admin", users_count: 3, permissions_count: 16, created_at: "2026-01-01" },
        { id: 3, name: "case-coordinator", users_count: 5, permissions_count: 12, created_at: "2026-01-01" },
        { id: 4, name: "planner", users_count: 8, permissions_count: 10, created_at: "2026-01-01" },
        { id: 5, name: "client", users_count: 42, permissions_count: 8, created_at: "2026-01-01" },
        { id: 6, name: "sub-client", users_count: 15, permissions_count: 6, created_at: "2026-01-01" },
        { id: 7, name: "vendor", users_count: 4, permissions_count: 6, created_at: "2026-01-01" }
    ],

    clients: [
        {
            id: 1,
            name: "Wright Orthodontics Clinic",
            company_title: "Wright Orthodontics",
            company_name: "Wright Orthodontics",
            email: "doctor@velourcare.com",
            phone: "+971 50 123 4567",
            user: { id: 101, username: "dr.wright", email: "doctor@velourcare.com" },
            status: { label: "Active", color: "success", value: "active" },
            is_sub_clients_allowed: "YES",
            case_id_prefix: "WRIGHT",
            is_manufacturing_active: "YES",
            sub_clients_count: 2,
            cases_count: 48,
            balance: 14200,
            currency: "AED",
            status_webhook_url: "https://api.wrightortho.com/webhooks/status",
            updated_at: { human_readable: "1 day ago", timestamp: "2026-10-24 10:00" },
            created_at: "2026-02-10 09:00",
            logo_url: "/assets/velourcare-square.png",
            shipment_addresses: [
                {
                    id: 1,
                    is_default: true,
                    title: "Main Practice Dubai Healthcare City",
                    address_line_1: "Building 64, Al Razi Medical Complex, Suite 302",
                    city: "Dubai",
                    country: "United Arab Emirates",
                    phone: "+971 4 398 2211"
                }
            ]
        },
        {
            id: 2,
            name: "Emirates Smile Design Dental Center",
            company_title: "Emirates Smile Clinic",
            company_name: "Emirates Smile Design Dental Center",
            email: "contact@emiratessmile.ae",
            phone: "+971 2 644 8899",
            user: { id: 102, username: "dr.emirates", email: "contact@emiratessmile.ae" },
            status: { label: "Active", color: "success", value: "active" },
            is_sub_clients_allowed: "YES",
            case_id_prefix: "ESMILE",
            is_manufacturing_active: "YES",
            sub_clients_count: 1,
            cases_count: 36,
            balance: 9500,
            currency: "AED",
            status_webhook_url: "https://api.emiratessmile.ae/webhooks/status",
            updated_at: { human_readable: "2 days ago", timestamp: "2026-10-23 15:30" },
            created_at: "2026-03-01 10:00",
            logo_url: "/assets/velourcare-square.png",
            shipment_addresses: [
                {
                    id: 2,
                    is_default: true,
                    title: "Abu Dhabi Corniche Branch",
                    address_line_1: "Corniche Road, Tower A, 5th Floor",
                    city: "Abu Dhabi",
                    country: "United Arab Emirates",
                    phone: "+971 2 644 8899"
                }
            ]
        }
    ],

    subClients: [
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
    ],

    cases: [
        {
            id: 1,
            case_id: "VELOUR-0001",
            caseId: "VELOUR-0001",
            patient_name: "Fatima Al-Nuaimi",
            patient_age: 26,
            patient_gender: "Female",
            patient: { name: "Fatima Al-Nuaimi", email: "fatima.nuaimi@example.ae", age: 26, gender: "Female" },
            doctor_name: "Dr. Alexander Wright",
            caseDoctor: "Dr. Alexander Wright",
            client_id: 1,
            client_name: "Wright Orthodontics Clinic",
            client: { id: 1, name: "Wright Orthodontics Clinic", parent_client: null },
            category: "New Case",
            caseCategory: "New Case",
            caseCategoryType: "Aligners",
            status: { value: "review-treatment-plan", label: "Review Treatment Plan", color: "info" },
            isDraftCase: false,
            deadline: "2026-11-05",
            siCaseCode: "SI-9921",
            waveatpPtId: "WAVE-4820",
            upper_aligners: 22,
            lower_aligners: 18,
            chief_complaint: "Anterior crowding and midline shift",
            malocclusion: "Class I Malocclusion with severe upper anterior crowding",
            attachments_count: 8,
            step_files_count: 2,
            planningDuration: { deliveryTime: "48h SLA", isTimerPaused: false, lastHoldAt: null, deadline: { iso_date: "2026-11-05T18:00:00Z" }, completedAt: null },
            manufacturingDuration: null,
            stepsDuration: null,
            modificationDuration: null,
            updatedAt: { human_readable: "2 hours ago", timestamp: "2026-10-24 14:15" },
            updated_at: { human_readable: "2 hours ago", timestamp: "2026-10-24 14:15" },
            createdAt: { human_readable: "9 days ago", timestamp: "2026-10-15 09:30" },
            created_at: "2026-10-15 09:30"
        },
        {
            id: 2,
            case_id: "VELOUR-0002",
            caseId: "VELOUR-0002",
            patient_name: "Marcus Vance",
            patient_age: 34,
            patient_gender: "Male",
            patient: { name: "Marcus Vance", email: "marcus.v@example.com", age: 34, gender: "Male" },
            doctor_name: "Dr. Alexander Wright",
            caseDoctor: "Dr. Alexander Wright",
            client_id: 1,
            client_name: "Wright Orthodontics Clinic",
            client: { id: 1, name: "Wright Orthodontics Clinic", parent_client: null },
            category: "New Case",
            caseCategory: "New Case",
            caseCategoryType: "Aligners",
            status: { value: "in-planning", label: "In Planning", color: "primary" },
            isDraftCase: false,
            deadline: "2026-11-02",
            siCaseCode: "SI-9922",
            waveatpPtId: "WAVE-4821",
            upper_aligners: 28,
            lower_aligners: 24,
            chief_complaint: "Deep overbite and spacing in lower arch",
            malocclusion: "Class II Division 2 with 80% deep bite",
            attachments_count: 6,
            step_files_count: 0,
            planningDuration: { deliveryTime: "24h SLA", isTimerPaused: false, lastHoldAt: null, deadline: { iso_date: "2026-11-02T12:00:00Z" }, completedAt: null },
            manufacturingDuration: null,
            stepsDuration: null,
            modificationDuration: null,
            updatedAt: { human_readable: "5 hours ago", timestamp: "2026-10-25 16:40" },
            updated_at: { human_readable: "5 hours ago", timestamp: "2026-10-25 16:40" },
            createdAt: { human_readable: "6 days ago", timestamp: "2026-10-18 11:20" },
            created_at: "2026-10-18 11:20"
        },
        {
            id: 3,
            case_id: "REF1-VELOUR-0003",
            caseId: "REF1-VELOUR-0003",
            patient_name: "Zainab Rashid",
            patient_age: 22,
            patient_gender: "Female",
            patient: { name: "Zainab Rashid", email: "zainab.r@example.com", age: 22, gender: "Female" },
            doctor_name: "Dr. Alexander Wright",
            caseDoctor: "Dr. Alexander Wright",
            client_id: 1,
            client_name: "Wright Orthodontics Clinic",
            client: { id: 1, name: "Wright Orthodontics Clinic", parent_client: null },
            category: "Refinements",
            caseCategory: "Refinements",
            caseCategoryType: "Aligners",
            status: { value: "in-manufacturing", label: "In Manufacturing", color: "secondary" },
            isDraftCase: false,
            deadline: "2026-10-31",
            siCaseCode: "SI-9890",
            waveatpPtId: "WAVE-4750",
            upper_aligners: 8,
            lower_aligners: 6,
            chief_complaint: "Minor rotational refinement of tooth 12 and 22",
            malocclusion: "Finishing refinement stage 1",
            attachments_count: 5,
            step_files_count: 1,
            manufacturingDuration: { deliveryTime: "36h SLA", startedAt: "2026-10-24T08:00:00Z", isTimerPaused: false, lastHoldAt: null, deadline: { iso_date: "2026-10-31T17:00:00Z" }, completedAt: null },
            stepsDuration: null,
            modificationDuration: null,
            planningDuration: null,
            updatedAt: { human_readable: "1 day ago", timestamp: "2026-10-25 08:30" },
            updated_at: { human_readable: "1 day ago", timestamp: "2026-10-25 08:30" },
            createdAt: { human_readable: "14 days ago", timestamp: "2026-10-10 14:00" },
            created_at: "2026-10-10 14:00"
        },
        {
            id: 4,
            case_id: "VELOUR-RET-0001",
            caseId: "VELOUR-RET-0001",
            patient_name: "Tariq Mansoor",
            patient_age: 41,
            patient_gender: "Male",
            patient: { name: "Tariq Mansoor", email: "tariq.mansoor@example.com", age: 41, gender: "Male" },
            doctor_name: "Emirates Smile Clinic",
            caseDoctor: "Dr. Tariq Mansoor",
            client_id: 2,
            client_name: "Emirates Smile Design Dental Center",
            client: { id: 2, name: "Emirates Smile Design Dental Center", parent_client: null },
            category: "Retainers",
            caseCategory: "Retainers",
            caseCategoryType: "Retainers",
            status: { value: "plan-step-files-ready", label: "Step Files Ready", color: "success" },
            isDraftCase: false,
            deadline: "2026-10-28",
            siCaseCode: "SI-9940",
            waveatpPtId: "WAVE-4830",
            upper_aligners: 3,
            lower_aligners: 3,
            chief_complaint: "Post-orthodontic clear retention sets",
            malocclusion: "Post-treatment retention",
            attachments_count: 4,
            step_files_count: 1,
            stepsDuration: { deliveryTime: "Ready", startedAt: "2026-10-22T10:00:00Z", isTimerPaused: false, lastHoldAt: null, deadline: { iso_date: "2026-10-28T18:00:00Z" }, completedAt: { iso_date: "2026-10-25T17:00:00Z" } },
            manufacturingDuration: null,
            modificationDuration: null,
            planningDuration: null,
            updatedAt: { human_readable: "18 hours ago", timestamp: "2026-10-25 17:00" },
            updated_at: { human_readable: "18 hours ago", timestamp: "2026-10-25 17:00" },
            createdAt: { human_readable: "4 days ago", timestamp: "2026-10-21 16:15" },
            created_at: "2026-10-21 16:15"
        },
        {
            id: 5,
            case_id: "VELOUR-0004",
            caseId: "VELOUR-0004",
            patient_name: "Elena Rostova",
            patient_age: 29,
            patient_gender: "Female",
            patient: { name: "Elena Rostova", email: "elena.r@example.com", age: 29, gender: "Female" },
            doctor_name: "Dr. Alexander Wright",
            caseDoctor: "Dr. Alexander Wright",
            client_id: 1,
            client_name: "Wright Orthodontics Clinic",
            client: { id: 1, name: "Wright Orthodontics Clinic", parent_client: null },
            category: "New Case",
            caseCategory: "New Case",
            caseCategoryType: "Aligners",
            status: { value: "newly-created", label: "Newly Created", color: "warning" },
            isDraftCase: false,
            deadline: "2026-11-10",
            siCaseCode: null,
            waveatpPtId: null,
            upper_aligners: 0,
            lower_aligners: 0,
            chief_complaint: "Diastema closure between central incisors",
            malocclusion: "Class I with 2.5mm upper midline diastema",
            attachments_count: 7,
            step_files_count: 0,
            planningDuration: null,
            manufacturingDuration: null,
            stepsDuration: null,
            modificationDuration: null,
            updatedAt: { human_readable: "1 day ago", timestamp: "2026-10-25 18:00" },
            updated_at: { human_readable: "1 day ago", timestamp: "2026-10-25 18:00" },
            createdAt: { human_readable: "1 day ago", timestamp: "2026-10-25 18:00" },
            created_at: "2026-10-25 18:00"
        }
    ],

    stepFiles: [
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
    ],

    treatmentPlans: [
        {
            id: 1,
            case_id: 1,
            title: "Plan 1 - Non-Extraction IPR Protocol",
            has_plan_document: true,
            upper_aligner_count: 22,
            lower_aligner_count: 18,
            status: { value: "approved", label: "Approved", color: "success" },
            created_at: { human_readable: "2 days ago", timestamp: "2026-10-24 14:00" },
            ipr_chart_file_url: "/uploads/velourcare-ipr-chart-sample.pdf",
            container_file_url: "/uploads/sample-treatment-container.o3c",
            zip_file_url: "/uploads/sample-treatment-models.zip",
            simulation_link: "/simulation/velour-0001",
            description: "VelourCare Precision Aligner Protocol. 22 upper / 18 lower aligners. Interproximal reduction (IPR) staging as charted: 0.3mm at 11-21, 0.2mm at 21-22, 0.2mm at 12-11.",
            modifications: [],
            review: { skipped: false, rating: 5, comment: "Approved by Dr. Alexander Wright" },
            plan_document_data: {
                header: {
                    aligners_upper: "22",
                    aligners_lower: "18",
                    days_upper: "10",
                    days_lower: "10",
                    worn_days: "10",
                    workdays: "5",
                    show_worn_note: true,
                    show_days_upper: true,
                    show_days_lower: true,
                    show_elastic: false
                },
                ipr_contacts: [
                    { slot: 15, pair: "11-21", width_mm: 0.3, after_step: 3 },
                    { slot: 16, pair: "21-22", width_mm: 0.2, after_step: 3 },
                    { slot: 14, pair: "12-11", width_mm: 0.2, after_step: 5 },
                    { slot: 31, pair: "31-41", width_mm: 0.2, after_step: 2 },
                    { slot: 32, pair: "41-42", width_mm: 0.3, after_step: 4 }
                ],
                attachment_points: [
                    { slot: 13, step: 1 },
                    { slot: 23, step: 1 },
                    { slot: 33, step: 2 },
                    { slot: 43, step: 2 }
                ],
                pressure_points: [],
                pontic_steps: [],
                tooth_annotations: {},
                movement_chart: {
                    title: "MOVEMENT CHART",
                    upper: [
                        { tooth: "11", mesial_distal: 0.4, buccal_lingual: 0.8, intrusion_extrusion: -0.2, torque: 2.1, tip: 1.5, rotation: -4.2 },
                        { tooth: "21", mesial_distal: -0.3, buccal_lingual: 0.7, intrusion_extrusion: -0.2, torque: 1.9, tip: -1.2, rotation: 3.8 }
                    ],
                    lower: [
                        { tooth: "31", mesial_distal: 0.2, buccal_lingual: 0.5, intrusion_extrusion: 0.0, torque: 1.0, tip: 0.8, rotation: 2.1 },
                        { tooth: "41", mesial_distal: -0.2, buccal_lingual: 0.4, intrusion_extrusion: 0.0, torque: 1.1, tip: -0.7, rotation: -1.9 }
                    ]
                },
                pdf_pages: {
                    include_vto_intro: false,
                    include_movement_chart: true,
                    include_smile_summary: true,
                    include_smile_summary_upload: false,
                    include_ipr_summary: true,
                    header_logo_source: "none"
                }
            }
        }
    ],

    invoices: [
        {
            id: 1,
            invoice_number: "INV-VELOUR-2026-001",
            client_id: 1,
            client_name: "Wright Orthodontics Clinic",
            client: { id: 1, name: "Wright Orthodontics Clinic" },
            billing_period_start: "2026-10-01",
            billing_period_end: "2026-10-31",
            document_status: "issued",
            document_status_label: "Issued",
            payment_status: "paid",
            payment_status_label: "Paid",
            amount: 4850.00,
            total: 4850.00,
            currency: "AED",
            due_date: "2026-11-15",
            issued_at: "2026-10-15 10:00",
            created_at: "2026-10-15 09:30",
            items: [
                { description: "VelourCare Comprehensive Clear Aligner Treatment (Case #VELOUR-0001)", quantity: 1, unit_price: 4200.00, total: 4200.00 },
                { description: "Digital Treatment Setup & 3D Staging Fee", quantity: 1, unit_price: 650.00, total: 650.00 }
            ]
        },
        {
            id: 2,
            invoice_number: "INV-VELOUR-2026-002",
            client_id: 2,
            client_name: "Emirates Smile Design Dental Center",
            client: { id: 2, name: "Emirates Smile Design Dental Center" },
            billing_period_start: "2026-10-01",
            billing_period_end: "2026-10-31",
            document_status: "issued",
            document_status_label: "Issued",
            payment_status: "paid",
            payment_status_label: "Paid",
            amount: 1250.00,
            total: 1250.00,
            currency: "AED",
            due_date: "2026-10-30",
            issued_at: "2026-10-01 11:00",
            created_at: "2026-10-01 10:30",
            items: [
                { description: "VelourCare Dual Arch Clear Retainers (3 Sets)", quantity: 1, unit_price: 1250.00, total: 1250.00 }
            ]
        }
    ],

    vendors: [
        {
            id: 1,
            name: "VelourCare Advanced 3D Fabrication Facility",
            email: "production@velourcare.com",
            phone: "+971 4 800 8350",
            user: { id: 201, username: "lab_manager", email: "production@velourcare.com" },
            status: { label: "Active", color: "success", value: "active" },
            services_count: 3,
            allocated_clients_count: 12,
            updated_at: { human_readable: "3 days ago", timestamp: "2026-10-22 16:00" },
            created_at: "2026-01-10 08:00",
            services: [
                { id: 1, name: "3D Aligner Model Printing (Dental Resin)", price: 35.00, status: "active" },
                { id: 2, name: "Multi-Layer Thermoforming & Laser Trimming", price: 65.00, status: "active" },
                { id: 3, name: "Laser Tooth Number & Patient ID Marking", price: 10.00, status: "active" }
            ]
        }
    ],

    bankAccounts: [
        {
            id: 1,
            bank_name: "Emirates NBD Bank",
            account_name: "VelourCare Orthodontics Medical LLC",
            account_number: "1012398745601",
            iban: "AE0702600001012398745601",
            swift_code: "EBILAEADXXX",
            currency: "AED",
            branch: "Downtown Dubai Corporate Branch",
            is_default: true
        }
    ]
};

// Default current user to Super Admin
db.currentUser = db.users[0];

// Session Storage for Authenticated Tokens
const activeSessions = new Map();

function resolveAuthUser(req) {
    let token = null;
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7).trim();
    }
    if (!token && req.cookies) {
        token = req.cookies['laravel_session'] || req.cookies['XSRF-TOKEN'];
    }
    if (!token && req.headers['x-xsrf-token']) {
        token = req.headers['x-xsrf-token'];
    }

    if (!token) return null;

    if (activeSessions.has(token)) {
        return activeSessions.get(token);
    }

    // Check token format: velourcare-jwt-bearer-<id> or velourcare-auth-<id>
    const match = token.match(/velourcare-(?:jwt-bearer|auth|session)-(\d+)/);
    if (match) {
        const userId = parseInt(match[1]);
        const found = getSafeUsers().find(u => u.id === userId);
        if (found) return found;
    }

    return null;
}

const PUBLIC_API_ROUTES = [
    '/api/auth/login',
    '/auth/login',
    '/api/auth/verify',
    '/auth/verify',
    '/api/sanctum/csrf-cookie',
    '/sanctum/csrf-cookie',
    '/api/chat/unread-counts'
];

app.use((req, res, next) => {
    req.user = resolveAuthUser(req);
    if (req.user) {
        db.currentUser = req.user;
    }

    if (req.path.startsWith('/api/')) {
        const isPublic = PUBLIC_API_ROUTES.some(p => req.path === p || req.path.startsWith(p + '?'));
        if (!isPublic && !req.user) {
            return res.status(401).json({ message: "Unauthenticated." });
        }
    }
    next();
});


// ==========================================
// SPA NAVIGATION FALLBACK MIDDLEWARE
// For all browser page requests (e.g. /cases, /clients, /invoices), serve index.html
// Ensure API endpoints (/api/*, /sanctum/*, /broadcasting/*) and assets pass through
// ==========================================
// 3D Simulation Route (Serve standalone WebGL 3D Aligner Viewer)
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

        // Direct route redirect for /clients/:id -> /clients/:id/edit, /sub-clients/:id, /vendors/:id
        const directMatch = req.path.match(/^\/(clients|sub-clients|vendors)\/(\d+)$/);
        if (directMatch) {
            return res.redirect(302, `${req.path}/edit`);
        }

        return res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
    next();
});


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

// ==========================================
// 1. SANCTUM CSRF COOKIE & AUTH
// ==========================================
app.get(['/sanctum/csrf-cookie', '/api/sanctum/csrf-cookie'], (req, res) => {
    const existingXsrf = req.cookies && req.cookies['XSRF-TOKEN'];
    const token = existingXsrf || ('velourcare-xsrf-token-' + Date.now());
    res.cookie('XSRF-TOKEN', token, {
        httpOnly: false,
        sameSite: 'lax',
        path: '/'
    });

    const existingSession = req.cookies && req.cookies['laravel_session'];
    if (!existingSession) {
        const defaultSession = 'velourcare-jwt-bearer-1';
        res.cookie('laravel_session', defaultSession, {
            httpOnly: true,
            sameSite: 'lax',
            path: '/'
        });
    }
    res.status(204).end();
});

app.post(['/api/auth/login', '/auth/login'], (req, res) => {
    const { username, password } = req.body || {};
    if (!username) {
        return res.status(401).json({ success: false, message: "Username is required." });
    }
    const cleanUsername = String(username).trim().toLowerCase();
    const user = getSafeUsers().find(u => u.username.toLowerCase() === cleanUsername);
    if (!user) {
        return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    const sessionToken = "velourcare-jwt-bearer-" + user.id;
    activeSessions.set(sessionToken, user);

    res.cookie('XSRF-TOKEN', 'velourcare-auth-' + user.id, { httpOnly: false, sameSite: 'lax', path: '/' });
    res.cookie('laravel_session', sessionToken, { httpOnly: true, sameSite: 'lax', path: '/' });

    res.json({
        success: true,
        message: "Welcome to VelourCare Ortho Cloud",
        data: {
            user: user,
            token: sessionToken
        }
    });
});

app.get(['/api/auth/verify', '/auth/verify'], (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "Unauthenticated." });
    }
    res.json({
        data: {
            user: {
                ...user,
                status: "Active"
            }
        }
    });
});

app.get(['/api/auth/user', '/auth/user'], (req, res) => {
    if (!db.currentUser) {
        return res.status(401).json({ message: "Unauthenticated." });
    }
    res.json(db.currentUser);
});

app.post(['/api/auth/logout', '/auth/logout'], (req, res) => {
    db.currentUser = null;
    res.clearCookie('XSRF-TOKEN');
    res.clearCookie('laravel_session');
    res.json({ success: true, message: "Logged out successfully" });
});

app.post(['/api/auth/user/change-password', '/auth/user/change-password'], (req, res) => {
    res.json({ success: true, message: "Password updated successfully" });
});

app.all(['/api/auth/user/locale', '/auth/user/locale'], (req, res) => {
    res.json({ success: true, message: "Locale updated successfully" });
});

// ==========================================
// 2. PERMISSIONS & ROLES
// ==========================================
app.get(['/api/permissions/current-user', '/permissions/current-user'], (req, res) => {
    const grouped = {};
    db.allPermissions.forEach(p => {
        if (!grouped[p.group]) grouped[p.group] = [];
        grouped[p.group].push(p);
    });
    res.json({ data: grouped });
});

app.get(['/api/permissions', '/permissions'], (req, res) => {
    const grouped = {};
    db.allPermissions.forEach(p => {
        const grp = p.group || "general";
        if (!grouped[grp]) grouped[grp] = [];
        grouped[grp].push({
            id: p.id,
            name: p.name,
            display_name: p.display_name || p.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            group: grp
        });
    });
    res.json({ data: grouped });
});

app.get(['/api/permissions/:id/role', '/permissions/:id/role'], (req, res) => {
    res.json({ 
        data: db.allPermissions,
        permissions: db.allPermissions
    });
});

app.post(['/api/permissions/:id/role', '/permissions/:id/role'], (req, res) => {
    res.json({ success: true, message: "Role permissions saved successfully" });
});

app.get(['/api/permissions/:id/user', '/permissions/:id/user'], (req, res) => {
    const users = getSafeUsers();
    const userId = parseInt(req.params.id);
    const user = users.find(u => u.id === userId) || users[0] || defaultSeedUsers[0];
    const userPerms = (user.permissions || []).map(pName => {
        if (typeof pName === 'object') return pName;
        return db.allPermissions.find(p => p.name === pName) || {
            id: 1,
            name: pName,
            display_name: pName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        };
    });
    res.json({ data: userPerms });
});

app.post(['/api/permissions/:id/user', '/permissions/:id/user'], (req, res) => {
    const userId = parseInt(req.params.id);
    const user = db.users.find(u => u.id === userId);
    if (user && req.body && Array.isArray(req.body.permissions)) {
        const permIds = req.body.permissions;
        const selected = permIds.map(pid => db.allPermissions.find(p => p.id === pid)).filter(Boolean);
        user.permissions = selected.map(p => p.name);
    }
    res.json({ success: true, message: "User permissions updated successfully" });
});

app.get(['/api/roles/:id', '/roles/:id'], (req, res) => {
    const roleId = parseInt(req.params.id);
    const found = db.roles.find(r => r.id === roleId);
    if (!found) {
        return res.status(404).json({ message: `Role #${req.params.id} not found.` });
    }
    res.json({ 
        data: {
            ...found,
            label: found.label || (found.name ? found.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : "Role"),
            permissions: db.allPermissions
        }
    });
});

app.get(['/api/roles', '/roles'], (req, res) => {
    res.json({
        data: db.roles.map(r => ({
            ...r,
            label: r.label || (r.name ? r.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : "Role")
        })),
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: db.roles.length
    });
});

app.post(['/api/roles', '/roles'], (req, res) => {
    const nextId = db.roles.length ? Math.max(...db.roles.map(r => r.id)) + 1 : 1;
    const name = (req.body.name || "new-role").toLowerCase().replace(/\s+/g, '-');
    const newRole = {
        id: nextId,
        name: name,
        label: req.body.name || name,
        users_count: 0,
        permissions_count: Array.isArray(req.body.permissions) ? req.body.permissions.length : 0,
        permissions: req.body.permissions || [],
        created_at: new Date().toISOString().slice(0, 10)
    };
    db.roles.push(newRole);
    res.status(201).json({ success: true, message: "Role created successfully", data: newRole });
});

app.put(['/api/roles/:id', '/roles/:id'], (req, res) => {
    const roleId = parseInt(req.params.id);
    const found = db.roles.find(r => r.id === roleId);
    if (found) {
        if (req.body.name) {
            found.name = req.body.name.toLowerCase().replace(/\s+/g, '-');
            found.label = req.body.name;
        }
        if (Array.isArray(req.body.permissions)) {
            found.permissions = req.body.permissions;
            found.permissions_count = req.body.permissions.length;
        }
        res.json({ success: true, message: "Role updated successfully", data: found });
    } else {
        res.status(404).json({ message: "Role not found" });
    }
});

app.delete(['/api/roles/:id', '/roles/:id'], (req, res) => {
    const roleId = parseInt(req.params.id);
    const idx = db.roles.findIndex(r => r.id === roleId);
    if (idx !== -1) {
        db.roles.splice(idx, 1);
        res.json({ success: true, message: "Role deleted successfully" });
    } else {
        res.status(404).json({ message: "Role not found" });
    }
});

// ==========================================
// USERS MANAGEMENT & FILTER OPTIONS
// ==========================================
app.get(['/api/users/filter-options', '/users/filter-options'], (req, res) => {
    res.json({
        data: {
        "roles": {
                "super-admin": "Super Admin",
                "admin": "Admin",
                "case-coordinator": "Case Coordinator",
                "planner": "CAD Planner",
                "client": "Client / Doctor",
                "sub-client": "Sub Client",
                "vendor": "Vendor / Lab"
        },
        "genders": {
                "male": "Male",
                "female": "Female",
                "other": "Other"
        },
        "statuses": {
                "active": "Active",
                "inactive": "Inactive",
                "pending": "Pending",
                "suspended": "Suspended"
        }
}
    });
});

app.get(['/api/users', '/users'], (req, res) => {
    const users = getSafeUsers();
    const mappedUsers = users.map(u => ({
        ...u,
        fullName: u.fullName || u.name,
        role: {
            id: u.role_slug === "super-admin" ? 1 : (u.role_slug === "admin" ? 2 : (u.role_slug === "planner" ? 4 : (u.role_slug === "vendor" ? 7 : 5))),
            name: u.role_slug || "super-admin",
            label: (u.role_slug || "Super Admin").replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            permissions: db.allPermissions
        },
        status: (typeof u.status === 'object' && u.status !== null) ? u.status : {
            label: (u.status || "Active").replace(/\b\w/g, l => l.toUpperCase()),
            value: (u.status || "active").toLowerCase(),
            color: (u.status || "active").toLowerCase() === 'active' ? 'success' : 'secondary'
        }
    }));

    res.json({
        data: mappedUsers,
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: mappedUsers.length,
        meta: {
            current_page: 1,
            last_page: 1,
            per_page: 20,
            total: mappedUsers.length
        },
        additional: {
            filter_options: {
          "roles": {
                    "super-admin": "Super Admin",
                    "admin": "Admin",
                    "case-coordinator": "Case Coordinator",
                    "planner": "CAD Planner",
                    "client": "Client / Doctor",
                    "sub-client": "Sub Client",
                    "vendor": "Vendor / Lab"
          },
          "genders": {
                    "male": "Male",
                    "female": "Female",
                    "other": "Other"
          },
          "statuses": {
                    "active": "Active",
                    "inactive": "Inactive",
                    "pending": "Pending",
                    "suspended": "Suspended"
          }
}
        }
    });
});

// GET SINGLE USER (CRITICAL for User Permissions Page & Profile)
app.get(['/api/users/:id', '/users/:id'], (req, res) => {
    const users = getSafeUsers();
    const userId = parseInt(req.params.id);
    const user = users.find(u => u.id === userId) || users[0] || defaultSeedUsers[0];

    const roleName = user.role_slug || "super-admin";
    const roleLabel = roleName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    const rolePermissionsMap = {
        "super-admin": db.allPermissions,
        "admin": db.allPermissions.filter(p => !["manage_stripe_platform"].includes(p.name)),
        "case-coordinator": db.allPermissions.filter(p => ["view_clients", "view_sub_clients", "view_cases", "edit_treatment_plans", "view_invoices"].includes(p.name)),
        "planner": db.allPermissions.filter(p => ["view_clients", "view_vendors", "view_cases", "edit_treatment_plans"].includes(p.name)),
        "client": db.allPermissions.filter(p => ["view_cases", "edit_treatment_plans", "view_invoices"].includes(p.name)),
        "sub-client": db.allPermissions.filter(p => ["view_cases", "edit_treatment_plans"].includes(p.name)),
        "vendor": db.allPermissions.filter(p => ["view_vendors", "view_cases", "edit_treatment_plans"].includes(p.name))
    };

    const rolePermissions = rolePermissionsMap[user.role_slug] || db.allPermissions;

    const userPermissions = (user.permissions || []).map(pName => {
        if (typeof pName === 'object') return pName;
        return db.allPermissions.find(p => p.name === pName) || {
            id: 1,
            name: pName,
            display_name: pName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        };
    }).filter(Boolean);

    const fullUserData = {
        id: user.id,
        name: user.name || (user.first_name ? user.first_name + ' ' + (user.last_name || '') : "Administrator").trim(),
        fullName: user.fullName || user.name || (user.first_name ? user.first_name + ' ' + (user.last_name || '') : "Administrator").trim(),
        first_name: user.first_name || "Administrator",
        last_name: user.last_name || "",
        username: user.username || "admin",
        email: user.email || "admin@velourcare.com",
        phone: user.phone || "+971 4 800 8356",
        gender: user.gender || "male",
        status: (typeof user.status === 'object' && user.status !== null) ? user.status : {
            label: (user.status || "Active").replace(/\b\w/g, l => l.toUpperCase()),
            value: (user.status || "active").toLowerCase(),
            color: (user.status || "active").toLowerCase() === 'active' ? 'success' : 'secondary'
        },
        role_slug: user.role_slug,
        is_super_admin: user.is_super_admin || false,
        profile_pic_url: user.profile_pic_url || "/assets/velourcare-square.png",
        role: {
            id: user.role_slug === "super-admin" ? 1 : 2,
            name: roleName,
            label: roleLabel,
            permissions: rolePermissions
        },
        permissions: userPermissions
    };

    res.json({ data: fullUserData });
});

app.post(['/api/users', '/users'], (req, res) => {
    const users = getSafeUsers();
    const newId = users.length ? Math.max(...users.map(u => u.id || 0)) + 1 : 1;
    const firstName = req.body.first_name || "New";
    const lastName = req.body.last_name || "User";
    const fullName = (firstName + ' ' + lastName).trim();
    const roleSlug = req.body.role || req.body.role_slug || "client";
    const gender = req.body.gender || "male";

    const newUser = {
        id: newId,
        name: fullName,
        fullName: fullName,
        first_name: firstName,
        last_name: lastName,
        username: req.body.username || "user_" + newId,
        email: req.body.email || "user" + newId + "@velourcare.com",
        phone: req.body.phone || "+971 4 000 0000",
        role_slug: roleSlug,
        gender: gender,
        status: { label: "Active", value: "active", color: "success" },
        profile_pic_url: "/assets/velourcare-square.png",
        permissions: []
    };
    users.unshift(newUser);
    res.json({ success: true, message: "User created successfully", data: newUser });
});

app.put(['/api/users/:id', '/users/:id'], (req, res) => {
    const users = getSafeUsers();
    const userId = parseInt(req.params.id);
    const user = users.find(u => u.id === userId);
    if (user) {
        Object.assign(user, req.body);
        if (req.body.first_name || req.body.last_name) {
            user.fullName = ((req.body.first_name || user.first_name || '') + ' ' + (req.body.last_name || user.last_name || '')).trim();
            user.name = user.fullName;
        }
        res.json({ success: true, message: "User updated successfully", data: user });
    } else {
        res.status(404).json({ success: false, message: "User not found" });
    }
});

app.delete(['/api/users/:id', '/users/:id'], (req, res) => {
    const users = getSafeUsers();
    const userId = parseInt(req.params.id);
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
        users.splice(idx, 1);
        if (users.length === 0) {
            users.push(JSON.parse(JSON.stringify(defaultSeedUsers[0])));
        }
        res.json({ success: true, message: "User deleted successfully" });
    } else {
        res.status(404).json({ success: false, message: "User not found" });
    }
});

app.post(['/api/users/:id/update-role', '/users/:id/update-role'], (req, res) => {
    const users = getSafeUsers();
    const userId = parseInt(req.params.id);
    const user = users.find(u => u.id === userId);
    if (user && req.body.role) {
        user.role_slug = req.body.role;
    }
    res.json({ success: true, message: "User role updated successfully", data: user });
});

app.patch(['/api/users/:id/update-status', '/users/:id/update-status'], (req, res) => {
    const users = getSafeUsers();
    const userId = parseInt(req.params.id);
    const user = users.find(u => u.id === userId);
    if (user && req.body.status) {
        user.status = {
            label: req.body.status.replace(/\b\w/g, l => l.toUpperCase()),
            value: req.body.status.toLowerCase(),
            color: req.body.status.toLowerCase() === 'active' ? 'success' : 'secondary'
        };
    }
    res.json({ success: true, message: "User status updated", data: user });
});

app.post(['/api/users/:id/send-reset-password-request', '/users/:id/send-reset-password-request'], (req, res) => {
    res.json({ success: true, message: "Password reset link sent successfully" });
});

app.patch(['/api/users/:id/change-password', '/users/:id/change-password'], (req, res) => {
    res.json({ success: true, message: "Password changed successfully" });
});

app.post(['/api/users/:id/smile-inspector', '/users/:id/smile-inspector'], (req, res) => {
    res.json({ success: true, message: "User synced to SmileInspector successfully", siUserUid: "si_usr_" + Date.now() });
});

// ==========================================
// 3. DASHBOARD STATISTICS
// ==========================================
app.get(['/api/dashboard/statistics', '/dashboard/statistics'], (req, res) => {
    res.json({
        data: {
            cases: {
                total_cases: 104,
                total_refinements: 21,
                total_retainers: 15,
                newly_created: 12,
                in_planning: 7,
                in_planning_only: 5,
                check_plan_quality: 2,
                plan_needs_correction: 1,
                plan_qa_cleared: 3,
                treatment_plan_uploaded: 4,
                in_modification: 2,
                in_modification_only: 1,
                check_modification_quality: 1,
                modification_needs_correction: 0,
                modification_qa_cleared: 1,
                modified_plan_uploaded: 1,
                awaiting_doctor_input: 1,
                step_files_ready: 8,
                start_manufacturing: 4,
                in_manufacturing: 6,
                ready_for_shipment: 3,
                package_in_transit: 5,
                package_delivered: 34,
                treatment_plan_approved: 28,
                case_completed: 46,
                case_canceled: 2,
                
                // Client dashboard keys
                tp_new: 12,
                tp_in_planning: 7,
                tp_in_modification: 2,
                dr_on_hold: 1,
                dr_evaluate: 4,
                sf_pending: 3,
                comp_manufactured: 38,
                stls_delivered: 42
            },
            clients: { total: 42, active: 40, inactive: 2, banned: 0 },
            sub_clients: { total: 15, active: 15, inactive: 0, banned: 0 },
            vendors: { total: 4, active: 4, inactive: 0, banned: 0 },
            users: { total: 68, active: 65, inactive: 3, banned: 0 },
            revenue: {
                monthly: 148500,
                currency: "AED",
                change_percent: 21.4
            }
        }
    });
});

// ==========================================
// ==========================================
// 4. CASES MANAGEMENT
// ==========================================
function getCasesFilterOptionsPayload() {
    const customConfig = getPortalConfig();
    const clientsList = getActiveClients().map(c => ({ 
        id: c.id, 
        name: c.name,
        case_id_prefix: c.case_id_prefix || "VELOUR",
        is_express_delivery_active: c.is_express_delivery_active || "YES",
        is_alphanumeric_case_id_active: c.is_alphanumeric_case_id_active || "YES",
        sub_clients: c.sub_clients || [
            { id: 1, name: "Downtown Dubai Clinic Branch" },
            { id: 2, name: "Jumeirah Specialist Centre" }
        ],
        addresses: c.addresses || [],
        shipment_addresses: c.addresses || []
    }));

    return {
        clients: clientsList,
        residencyTypes: customConfig.residencyTypes || {
            "local": "Local Resident",
            "overseas": "Overseas",
            "travelling": "Travelling / Tourist",
            "expat": "Expatriate Resident",
            "gcc_national": "GCC National"
        },
        categories: customConfig.caseCategories || {
            "Aligners": "Aligners",
            "Retainers": "Retainers",
            "Refinements": "Refinements",
            "Nightguards": "Nightguards",
            "Sleep Apnea Splints": "Sleep Apnea Splints"
        },
        categoryTypes: customConfig.caseCategoryTypes || {
            "Dentist": "Dentist",
            "Orthodontist": "Orthodontist",
            "Oral Surgeon": "Oral Surgeon"
        },
        deliveryTimes: customConfig.deliveryTimes || {
            "4 hrs": "4 hrs (Emergency Rush)",
            "8 hrs": "8 hrs (Express)",
            "24 hrs": "24 hrs (Standard)",
            "48 hrs": "48 hrs (Economy)"
        },
        jawArchTypes: customConfig.jawArchTypes || {
            "Both Arch": "Both Arch (Dual Arch)",
            "Upper only": "Upper Arch Only",
            "Lower only": "Lower Arch Only"
        },
        jawArchCorrections: customConfig.jawArchCorrections || {
            "(3-3)": "Anterior Only (3-3)",
            "(5-5)": "Premolar to Premolar (5-5)",
            "Full arch correction": "Full Arch Molar-to-Molar Correction"
        },
        jawToothFormats: customConfig.jawToothFormats || {
            "FDI Notation": "FDI Two-Digit (ISO 3950)",
            "Universal Notation": "Universal Numbering System (1-32)",
            "Palmer Notation": "Palmer Notation"
        },
        statuses: {
            "newly-created": "Newly Created",
            "clinical-review": "Awaiting Doctor Input",
            "in-planning": "In Planning",
            "review-treatment-plan": "Review Treatment Plan",
            "plan-approved": "Plan Approved",
            "plan-step-files-ready": "Step Files Ready",
            "in-manufacturing": "In Manufacturing",
            "completed": "Completed"
        }
    };
}

app.get(['/api/cases', '/cases'], (req, res) => {
    const filterOptionsPayload = getCasesFilterOptionsPayload();
    let cases = [...(db.cases || [])];

    // Search query filtering
    const searchQuery = (req.query.searchQuery || '').trim().toLowerCase();
    if (searchQuery) {
        cases = cases.filter(c => {
            const pName = (c.patient_name || (c.patient && c.patient.name) || '').toLowerCase();
            const cId = (c.case_id || c.caseId || '').toLowerCase();
            const dName = (c.doctor_name || c.caseDoctor || '').toLowerCase();
            return pName.includes(searchQuery) || cId.includes(searchQuery) || dName.includes(searchQuery);
        });
    }

    // Status filtering
    if (req.query.status) {
        cases = cases.filter(c => {
            const val = (typeof c.status === 'object' && c.status !== null) ? (c.status.value || c.status.name) : c.status;
            return val === req.query.status;
        });
    }

    const total = cases.length;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const perPage = req.query.per_page ? Math.max(1, parseInt(req.query.per_page)) : 20;
    const lastPage = Math.max(1, Math.ceil(total / perPage));
    const offset = (page - 1) * perPage;
    const paginatedCases = cases.slice(offset, offset + perPage);

    const getCount = (st) => (db.cases || []).filter(c => {
        const val = (typeof c.status === 'object' && c.status !== null) ? (c.status.value || c.status.name) : c.status;
        return val === st;
    }).length;

    res.json({
        data: paginatedCases,
        current_page: page,
        last_page: lastPage,
        per_page: perPage,
        total: total,
        meta: {
            current_page: page,
            last_page: lastPage,
            per_page: perPage,
            total: total
        },
        additional: {
            status_capsule_counts: [
                { value: null, label: "All Cases", count: (db.cases || []).length, color: "primary" },
                { value: "newly-created", label: "Newly Created", count: getCount("newly-created"), color: "secondary" },
                { value: "in-planning", label: "In Planning", count: getCount("in-planning"), color: "info" },
                { value: "review-treatment-plan", label: "Review Treatment Plan", count: getCount("review-treatment-plan"), color: "warning" },
                { value: "plan-approved", label: "Plan Approved", count: getCount("plan-approved"), color: "success" },
                { value: "in-manufacturing", label: "In Manufacturing", count: getCount("in-manufacturing"), color: "primary" },
                { value: "completed", label: "Completed", count: getCount("completed"), color: "success" }
            ],
            filter_options: filterOptionsPayload,
            discussion_members: getSafeUsers()
        }
    });
});

// CASE FILTER OPTIONS & CREATION DROPDOWNS (MUST BE DEFINED BEFORE /api/cases/:id)
app.get(['/api/cases/filter-options', '/cases/filter-options'], (req, res) => {
    const payload = getCasesFilterOptionsPayload();
    res.json({
        data: payload,
        ...payload
    });
});

app.get(['/api/cases/verify-case-id', '/cases/verify-case-id'], (req, res) => {
    res.json({ valid: true, message: "Case ID available" });
});

app.get(['/api/cases/verify-parent-case', '/cases/verify-parent-case'], (req, res) => {
    res.json({ valid: true, parent_case_id: "VELOUR-0001" });
});

// Case store-in-pipeline MUST be defined before /api/cases/:id
app.post(['/api/cases/store-in-pipeline', '/cases/store-in-pipeline'], upload.any(), (req, res) => {
    const nextNum = db.cases.length + 1;
    const caseCode = "VELOUR-" + String(nextNum).padStart(4, '0');
    const patientName = req.body.patient_name || (req.body.patient && req.body.patient.name) || "New Patient";
    const patientAge = parseInt(req.body.patient_age || (req.body.patient && req.body.patient.age) || 26);
    const patientGender = req.body.patient_gender || (req.body.patient && req.body.patient.gender) || "Female";
    const patientEmail = req.body.patient_email || (req.body.patient && req.body.patient.email) || "patient@velourcare.com";

    const newCase = {
        id: nextNum,
        case_id: req.body.case_id || caseCode,
        caseId: req.body.case_id || caseCode,
        patient_name: patientName,
        patient_age: patientAge,
        patient_gender: patientGender,
        patient_email: patientEmail,
        patient_phone: req.body.patient_phone || req.body.phone || "+971 50 123 4567",
        patient_date_of_birth: req.body.patient_date_of_birth || null,
        patient_national_id: req.body.patient_national_id || null,
        patient_residency_type: req.body.patient_residency_type || req.body.residency_type || "local",
        patient_address: req.body.patient_address || req.body.address || "",
        patient_medical_history: req.body.patient_medical_history || "",
        patient: {
            name: patientName,
            email: patientEmail,
            age: patientAge,
            gender: patientGender,
            residencyType: req.body.patient_residency_type || req.body.residency_type || "local",
            phone: req.body.patient_phone || req.body.phone || "+971 50 123 4567",
            address: req.body.patient_address || req.body.address || "",
            medicalHistory: req.body.patient_medical_history || ""
        },
        doctor_name: req.body.case_doctor || req.body.doctor_name || "Dr. Alexander Wright",
        caseDoctor: req.body.case_doctor || req.body.doctor_name || "Dr. Alexander Wright",
        client_id: req.body.client_id ? parseInt(req.body.client_id) : 1,
        client_name: "Wright Orthodontics Clinic",
        client: { id: req.body.client_id ? parseInt(req.body.client_id) : 1, name: "Wright Orthodontics Clinic", parent_client: null },
        category: req.body.category || "New Case",
        caseCategory: req.body.category || "New Case",
        caseCategoryType: req.body.category_type || req.body.caseCategoryType || "Aligners",
        status: { value: "newly-created", label: "Newly Created", color: "primary" },
        isDraftCase: false,
        deadline: "2026-11-15",
        upper_aligners: 0,
        lower_aligners: 0,
        chief_complaint: req.body.chief_complaint || "Anterior alignment request",
        malocclusion: req.body.malocclusion || "Class I crowding",
        jawArchType: req.body.jaw_arch_type || "Both (Maxillary & Mandibular)",
        jawArchCorrection: req.body.jaw_arch_correction || "Standard Alignment",
        jawToothFormat: req.body.jaw_tooth_format || "FDI (World Dental Federation)",
        needsIpr: req.body.needs_ipr || "Yes (IPR Protocol prescribed)",
        needsAttachments: req.body.needs_attachments || "Yes (Optimized Composite Attachments)",
        needsExtraction: req.body.needs_extraction || "No",
        attachments_count: 0,
        step_files_count: 0,
        created_at: { human_readable: "Just now", iso_date: new Date().toISOString(), timestamp: Math.floor(Date.now() / 1000) },
        updated_at: { human_readable: "Just now", iso_date: new Date().toISOString(), timestamp: Math.floor(Date.now() / 1000) }
    };
    db.cases.unshift(newCase);
    res.json({ success: true, message: "Case registered successfully", data: newCase });
});

app.get(['/api/cases/:id', '/cases/:id'], (req, res) => {
    const caseId = parseInt(req.params.id);
    const found = (db.cases || []).find(c => c.id === caseId || c.case_id === req.params.id || c.caseId === req.params.id);
    if (!found) {
        return res.status(404).json({ message: `Case #${req.params.id} not found.` });
    }
    const plans = db.treatmentPlans.filter(p => p.case_id === found.id);
    
    res.json({
        data: {
            ...found,
            caseId: found.caseId || found.case_id,
            caseCategory: found.caseCategory || "New Case",
            caseCategoryType: found.caseCategoryType || "Aligners",
            caseDoctor: found.caseDoctor || found.doctor_name,
            jawArchType: "Dual Arch (Upper & Lower)",
            jawArchCorrection: "Both Arches",
            jawToothFormat: "FDI Two-Digit (ISO 3950)",
            needsIpr: "Yes (1.20mm Total IPR Protocol)",
            needsAttachments: "Yes (Standard Optimized Attachments)",
            needsExtraction: "No Extraction Required",
            chiefComplaint: found.chief_complaint || "Diastema closure and anterior crowding alignment",
            treatmentPlan: "VelourCare Clear Aligners 22 Upper / 18 Lower with Staged IPR Protocol",
            client: {
                id: found.client_id || 1,
                name: found.client_name || "Wright Orthodontics Clinic",
                treatment_protocol: "<p><strong>VelourCare Certified Protocol</strong>: Standard 10-day aligner staging with pre-insertion IPR verification leaf gauge check.</p>",
                treatment_plan_protocols: "Standard VelourCare Digital Protocol with IPR Verification",
                post_processing_protocol: "<p><strong>VelourCare Precision Finish</strong>: Automated laser edge scallop at gingival margin + 0.5mm clearance. Dual-layer thermoformed polyurethane.</p>",
                post_processing_protocols: "Precision Laser Trimming at Gingival Margin + 0.5mm Scallop",
                is_express_delivery_active: "NO"
            },
            patient: {
                name: found.patient_name,
                email: (found.patient && found.patient.email) || "patient@example.com",
                age: found.patient_age || 26,
                gender: found.patient_gender || "Female",
                dob: "1998-05-14",
                phone: "+971 55 987 6543"
            },
            clinical_details: {
                arch_treatment: "Dual Arch (Upper & Lower)",
                wear_schedule: "10 Days per Aligner",
                ipr_approved: true,
                attachments_permitted: true
            },
            attachments: [
                { id: 1, name: "Maxillary_Scan_Initial.stl", file_size: "14.2 MB", type: "stl" },
                { id: 2, name: "Mandibular_Scan_Initial.stl", file_size: "13.8 MB", type: "stl" },
                { id: 3, name: "Panoramic_OPG_Radiograph.jpg", file_size: "4.1 MB", type: "image" },
                { id: 4, name: "Lateral_Cephalometric_XRay.jpg", file_size: "3.9 MB", type: "image" },
                { id: 5, name: "Intraoral_Frontal_Bite.jpg", file_size: "2.8 MB", type: "image" }
            ],
            treatment_plans: plans,
            step_files: db.stepFiles.filter(s => s.case_id === found.id),
            shipment_batches: [
                { id: 1, batch_number: "BATCH-01", aligners_range: "01 to 10", status: "delivered", tracking_number: "DHL-98421092" },
                { id: 2, batch_number: "BATCH-02", aligners_range: "11 to 22", status: "in-production", tracking_number: null }
            ]
        }
    });
});

// UPDATE CASE (PUT /api/cases/:id and POST /api/cases/:id for Clinical Details / Case Data)
app.put(['/api/cases/:id', '/cases/:id', '/api/cases/:id/edit', '/cases/:id/edit'], upload.any(), (req, res) => {
    const caseId = parseInt(req.params.id);
    const body = req.body || {};
    let found = (db.cases || []).find(c => c.id === caseId || c.case_id === req.params.id || c.caseId === req.params.id);
    
    if (!found) {
        // If not found, create a fallback record so user never gets 404
        found = {
            id: caseId || (db.cases.length + 1),
            case_id: body.case_id || ("VELOUR-" + String(caseId).padStart(4, '0')),
            caseId: body.case_id || ("VELOUR-" + String(caseId).padStart(4, '0')),
            status: { value: "newly-created", label: "Newly Created", color: "primary" },
            client: { id: 1, name: "Wright Orthodontics Clinic" },
            created_at: { human_readable: "Just now", iso_date: new Date().toISOString() }
        };
        db.cases.push(found);
    }

    // Update clinical details
    if (body.case_id) {
        found.case_id = body.case_id;
        found.caseId = body.case_id;
    }
    if (body.base_case_id) found.base_case_id = body.base_case_id;
    if (body.parent_case_id) found.parent_case_id = body.parent_case_id;
    if (body.case_doctor) {
        found.case_doctor = body.case_doctor;
        found.caseDoctor = body.case_doctor;
        found.doctor_name = body.case_doctor;
    }
    if (body.planning_delivery_time) {
        found.planning_delivery_time = body.planning_delivery_time;
        found.planningDuration = { deliveryTime: body.planning_delivery_time };
    }
    if (body.case_category) {
        found.case_category = body.case_category;
        found.caseCategory = body.case_category;
        found.category = body.case_category;
    }
    if (body.case_category_type) {
        found.case_category_type = body.case_category_type;
        found.caseCategoryType = body.case_category_type;
    }
    if (body.jaw_arch_type) {
        found.jaw_arch_type = body.jaw_arch_type;
        found.jawArchType = body.jaw_arch_type;
    }
    if (body.jaw_arch_correction) {
        found.jaw_arch_correction = body.jaw_arch_correction;
        found.jawArchCorrection = body.jaw_arch_correction;
    }
    if (body.jaw_tooth_format) {
        found.jaw_tooth_format = body.jaw_tooth_format;
        found.jawToothFormat = body.jaw_tooth_format;
    }
    if (body.needs_attachments) {
        found.needs_attachments = body.needs_attachments;
        found.needsAttachments = body.needs_attachments;
    }
    if (body.needs_extraction) {
        found.needs_extraction = body.needs_extraction;
        found.needsExtraction = body.needs_extraction;
    }
    if (body.needs_ipr) {
        found.needs_ipr = body.needs_ipr;
        found.needsIpr = body.needs_ipr;
    }
    if (body.chief_complaint !== undefined) {
        found.chief_complaint = body.chief_complaint;
        found.chiefComplaint = body.chief_complaint;
    }
    if (body.treatment_plan !== undefined) {
        found.treatment_plan = body.treatment_plan;
        found.treatmentPlan = body.treatment_plan;
    }

    // Update patient details if sent
    if (body.patient_name) found.patient_name = body.patient_name;
    if (body.patient_gender) found.patient_gender = body.patient_gender;
    if (body.patient_email) found.patient_email = body.patient_email;
    if (body.patient_phone) found.patient_phone = body.patient_phone;
    if (body.patient_address) found.patient_address = body.patient_address;
    if (body.patient_date_of_birth) found.patient_date_of_birth = body.patient_date_of_birth;
    if (body.patient_national_id) found.patient_national_id = body.patient_national_id;
    if (body.patient_residency_type) found.patient_residency_type = body.patient_residency_type;
    if (body.patient_medical_history !== undefined) found.patient_medical_history = body.patient_medical_history;

    if (!found.patient) found.patient = {};
    if (found.patient_name) found.patient.name = found.patient_name;
    if (found.patient_email) found.patient.email = found.patient_email;
    if (found.patient_gender) found.patient.gender = found.patient_gender;
    if (found.patient_phone) found.patient.phone = found.patient_phone;
    if (found.patient_address) found.patient.address = found.patient_address;
    if (found.patient_residency_type) found.patient.residencyType = found.patient_residency_type;
    if (found.patient_date_of_birth) found.patient.dateOfBirth = found.patient_date_of_birth;
    if (found.patient_national_id) found.patient.nationalId = found.patient_national_id;
    if (found.patient_medical_history !== undefined) found.patient.medicalHistory = found.patient_medical_history;

    found.updated_at = {
        human_readable: "Just now",
        iso_date: new Date().toISOString(),
        timestamp: Math.floor(Date.now() / 1000)
    };

    res.json({
        success: true,
        message: "Case clinical details updated successfully",
        data: found
    });
});

app.post(['/api/cases/:id', '/cases/:id', '/api/cases/:id/edit', '/cases/:id/edit'], upload.any(), (req, res) => {
    // If multipart sent with _method=PUT, re-route to PUT
    const caseId = parseInt(req.params.id);
    const body = req.body || {};
    let found = (db.cases || []).find(c => c.id === caseId || c.case_id === req.params.id || c.caseId === req.params.id);
    if (!found) {
        found = { id: caseId, case_id: body.case_id || ("VELOUR-" + caseId), caseId: body.case_id || ("VELOUR-" + caseId) };
        db.cases.push(found);
    }
    Object.assign(found, body);
    res.json({ success: true, message: "Case updated successfully", data: found });
});

app.delete(['/api/cases/:id', '/cases/:id'], (req, res) => {
    const caseId = parseInt(req.params.id);
    const idx = (db.cases || []).findIndex(c => c.id === caseId || c.case_id === req.params.id || c.caseId === req.params.id);
    if (idx !== -1) {
        db.cases.splice(idx, 1);
        res.json({ success: true, message: "Case deleted successfully" });
    } else {
        res.json({ success: true, message: "Case removed" });
    }
});


app.get(['/api/cases/:id/activities', '/cases/:id/activities'], (req, res) => {
    res.json({
        data: [
            { id: 1, event: "Case Created", description: "Case registered by Dr. Alexander Wright", created_at: "2026-10-15 09:30:00" },
            { id: 2, event: "Scans Uploaded", description: "Upper and Lower digital impressions uploaded", created_at: "2026-10-15 09:42:00" },
            { id: 3, event: "CAD Setup Complete", description: "Treatment Plan v1 generated in WaveATP by Sarah Miller", created_at: "2026-10-22 14:00:00" },
            { id: 4, event: "Status Changed", description: "Status changed to 'Review Treatment Plan'", created_at: "2026-10-22 14:05:00" }
        ]
    });
});

app.patch(['/api/cases/:id/assign-planner', '/cases/:id/assign-planner'], (req, res) => {
    const caseId = parseInt(req.params.id);
    const found = db.cases.find(c => c.id === caseId);
    if (found) {
        found.planner = { id: req.body.planner_id || 3, name: "Sarah Miller (CAD Planner)" };
    }
    res.json({ success: true, message: "CAD Planner assigned successfully" });
});

app.patch(['/api/cases/:id/change-client', '/cases/:id/change-client'], (req, res) => {
    const caseId = parseInt(req.params.id);
    const found = db.cases.find(c => c.id === caseId);
    if (found && req.body.client_id) {
        const client = db.clients.find(cl => cl.id === parseInt(req.body.client_id));
        if (client) {
            found.client_id = client.id;
            found.client_name = client.name;
            found.client = { id: client.id, name: client.name, parent_client: null };
        }
    }
    res.json({ success: true, message: "Client updated successfully" });
});

app.patch(['/api/cases/:id/change-case-id', '/cases/:id/change-case-id'], (req, res) => {
    const caseId = parseInt(req.params.id);
    const found = db.cases.find(c => c.id === caseId);
    if (found && req.body.case_id) {
        found.case_id = req.body.case_id;
        found.caseId = req.body.case_id;
    }
    res.json({ success: true, message: "Case ID updated successfully" });
});

app.patch(['/api/cases/:id/status', '/cases/:id/status'], (req, res) => {
    const caseId = parseInt(req.params.id);
    const found = db.cases.find(c => c.id === caseId);
    if (found && req.body.status) {
        const val = req.body.status;
        found.status = {
            value: val,
            label: val.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            color: val.includes('approved') ? 'success' : val.includes('review') ? 'info' : 'primary'
        };
    }
    res.json({ success: true, message: "Case status updated successfully" });
});

app.post(['/api/cases/:id/update-draft-pipeline', '/cases/:id/update-draft-pipeline'], (req, res) => {
    res.json({ success: true, message: "Draft pipeline updated successfully" });
});

app.post(['/api/cases/:id/update-draft', '/cases/:id/update-draft'], (req, res) => {
    res.json({ success: true, message: "Draft updated successfully" });
});

app.post(['/api/cases/:id/attachments', '/cases/:id/attachments'], upload.single('attachment'), (req, res) => {
    const caseId = parseInt(req.params.id);
    const file = req.file;
    const item = {
        id: Date.now(),
        case_id: caseId,
        name: file ? file.originalname : "Digital_Attachment.stl",
        file_url: file ? `/uploads/${file.filename}` : "/uploads/sample-treatment-container.o3c",
        file_size: file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : "12.5 MB",
        type: file ? file.mimetype : "application/octet-stream",
        created_at: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    res.json({ success: true, message: "File uploaded successfully", data: item });
});

app.delete(['/api/cases/:id/attachments/:attachmentId', '/cases/:id/attachments/:attachmentId'], (req, res) => {
    res.json({ success: true, message: "Attachment deleted" });
});

app.patch(['/api/cases/:id/shipment-address', '/cases/:id/shipment-address'], (req, res) => {
    res.json({ success: true, message: "Shipment address updated successfully" });
});

app.post(['/api/cases/:id/sync-to-waveatp', '/cases/:id/sync-to-waveatp'], (req, res) => {
    res.json({ success: true, message: "Case geometry successfully synchronized with WaveATP CAD system." });
});

app.post(['/api/cases/:id/open-in-smile-inspector', '/cases/:id/open-in-smile-inspector'], (req, res) => {
    res.json({
        success: true,
        viewer_url: "https://cloud.smilegenix.ae/viewer/3d-demo",
        session_token: "velourcare-viewer-token-sample"
    });
});

app.get(['/api/cases/:id/step-files', '/cases/:id/step-files'], (req, res) => {
    const caseId = parseInt(req.params.id);
    const files = db.stepFiles.filter(s => s.case_id === caseId);
    res.json({ data: files });
});

app.post(['/api/cases/:id/step-files', '/cases/:id/step-files'], upload.single('zip_file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "A valid zip/medical model file (.zip, .stl, .ply, .o3c) is required in the 'zip_file' field." });
    }
    const newStep = {
        id: db.stepFiles.length + 1,
        case_id: parseInt(req.params.id),
        v_tratransfer_link: req.body.v_tratransfer_link || "",
        description: req.body.description || "",
        zip_file_url: req.file ? `/uploads/${req.file.filename}` : null,
        zip_file_name: req.file ? req.file.originalname : "package.zip",
        status: "pending",
        created_at: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };
    db.stepFiles.push(newStep);
    res.json({ success: true, message: "Step file uploaded successfully", data: newStep });
});

app.delete(['/api/cases/:caseId/step-files/:fileId', '/cases/:caseId/step-files/:fileId'], (req, res) => {
    res.json({ success: true, message: "Step file removed" });
});

app.post(['/api/cases/:id/shipment-batches/start-next', '/cases/:id/shipment-batches/start-next'], (req, res) => {
    const caseId = parseInt(req.params.id);
    const foundCase = (db.cases || []).find(c => c.id === caseId);
    if (!foundCase) {
        return res.status(404).json({ message: `Case #${caseId} not found.` });
    }

    if (!foundCase.shipment_batches) foundCase.shipment_batches = [];
    const batchNumber = foundCase.shipment_batches.length + 1;
    const trackingNumber = req.body.tracking_number || `DHL-MED-${Date.now().toString().slice(-8)}`;
    const courier = req.body.courier || "DHL Express Medical";

    const newBatch = {
        batch_id: batchNumber,
        batch_label: `Batch ${batchNumber} (Aligners ${((batchNumber - 1) * 6) + 1}-${batchNumber * 6})`,
        courier: courier,
        tracking_number: trackingNumber,
        tracking_url: `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`,
        status: "dispatched",
        dispatched_at: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };

    foundCase.shipment_batches.push(newBatch);
    foundCase.latest_tracking = newBatch;
    foundCase.status = { value: "in-manufacturing", label: "In Manufacturing / Dispatched", color: "primary" };

    res.json({
        success: true,
        message: "Next aligner batch dispatched to manufacturing with DHL tracking.",
        batch: newBatch,
        case: foundCase
    });
});

app.post(['/api/cases/:id/shipment-batches/notify-next', '/cases/:id/shipment-batches/notify-next'], (req, res) => {
    res.json({ success: true, message: "Doctor notified regarding next batch." });
});

// Case Comments & Presence
if (!db.comments) {
    db.comments = [
        {
            id: 1,
            case_id: 1,
            user: {
                id: 1,
                name: "VelourCare Super Administrator",
                profile_pic_url: "/assets/velourcare-square.png"
            },
            content: "Treatment plan uploaded. Initial anterior alignment staging completed.",
            attachments: [],
            created_at: "2026-10-24 14:20"
        }
    ];
}

app.get(['/api/cases/:id/comments', '/cases/:id/comments'], (req, res) => {
    const caseId = parseInt(req.params.id);
    const caseComments = (db.comments || []).filter(c => c.case_id == caseId || c.case_id == req.params.id);
    res.json({
        data: caseComments,
        meta: {
            current_page: 1,
            last_page: 1,
            per_page: 15,
            total: caseComments.length
        },
        links: {
            first: "/api/cases/" + req.params.id + "/comments?page=1",
            last: "/api/cases/" + req.params.id + "/comments?page=1",
            prev: null,
            next: null
        }
    });
});

app.post(['/api/cases/:id/comments', '/cases/:id/comments'], upload.any(), (req, res) => {
    if (!db.comments) db.comments = [];
    const content = req.body.content || "Comment submitted.";
    const comment = {
        id: Date.now(),
        case_id: parseInt(req.params.id) || req.params.id,
        user: db.currentUser || {
            id: 1,
            name: "VelourCare Super Administrator",
            profile_pic_url: "/assets/velourcare-square.png"
        },
        content: content,
        attachments: (req.files || []).map(f => ({ name: f.originalname, url: `/uploads/${f.filename}` })),
        created_at: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    db.comments.push(comment);
    res.status(201).json({ data: comment, message: "Comment added successfully" });
});

app.get(['/api/cases/:id/comments/presence', '/cases/:id/comments/presence'], (req, res) => {
    res.json({ users: [db.currentUser || { id: 1, name: "VelourCare Super Administrator" }] });
});

app.post(['/api/cases/:id/comments/presence', '/cases/:id/comments/presence'], (req, res) => {
    res.json({ success: true, message: "Joined presence" });
});

app.post(['/api/cases/:id/comments/presence/leave', '/cases/:id/comments/presence/leave'], (req, res) => {
    res.json({ success: true, message: "Left presence" });
});

// Notifications & Test Email
app.post(['/api/notifications/send-test-email', '/notifications/send-test-email', '/api/test-email', '/test-email'], (req, res) => {
    res.json({
        success: true,
        message: "The test email has been sent successfully. Please check your inbox shortly; it should arrive within a few moments."
    });
});


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

// ==========================================
// 5. TREATMENT PLANS & IPR DOCUMENT
// ==========================================
app.get(['/api/cases/:id/treatment-plans', '/cases/:id/treatment-plans'], (req, res) => {
    const caseId = parseInt(req.params.id);
    const plans = db.treatmentPlans.filter(p => p.case_id === caseId);
    res.json({ data: plans });
});


// Treatment Plan Document & IPR Protocol Endpoints
app.get(['/api/cases/:caseId/treatment-plans/:planId/document', '/cases/:caseId/treatment-plans/:planId/document'], (req, res) => {
    const caseId = parseInt(req.params.caseId);
    const planId = parseInt(req.params.planId);
    const foundCase = db.cases.find(c => c.id === caseId) || db.cases[0];
    const foundPlan = db.treatmentPlans.find(p => p.id === planId) || db.treatmentPlans[0];
    
    res.json({
        data: {
            plan_document_data: foundPlan.plan_document_data,
            ipr_chart_file_url: foundPlan.ipr_chart_file_url || "/uploads/velourcare-ipr-chart-sample.pdf",
            case_meta: {
                patient_name: foundCase.patient_name || (foundCase.patient && foundCase.patient.name) || "Fatima Al-Nuaimi",
                doctor_name: foundCase.doctor_name || foundCase.caseDoctor || "Dr. Alexander Wright",
                clinic_name: foundCase.client_name || (foundCase.client && foundCase.client.name) || "Wright Orthodontics Clinic",
                case_number: foundCase.case_id || foundCase.caseId || "VELOUR-0001",
                plan_number: foundPlan.id || 1,
                client_logo_url: "/assets/velourcare-logo.png",
                client_tp_pdf_logo_url: "/assets/velourcare-logo.png",
                parent_tp_pdf_logo_url: "/assets/velourcare-logo.png",
                client_profile_logo_url: "/assets/velourcare-square.png",
                cover_page_content: "VelourCare Ortho Treatment Plan & IPR Protocol"
            }
        }
    });
});

app.put(['/api/cases/:caseId/treatment-plans/:planId/document', '/cases/:caseId/treatment-plans/:planId/document'], (req, res) => {
    const planId = parseInt(req.params.planId);
    const foundPlan = db.treatmentPlans.find(p => p.id === planId) || db.treatmentPlans[0];
    if (req.body && req.body.plan_document_data) {
        try {
            foundPlan.plan_document_data = typeof req.body.plan_document_data === 'string' ? JSON.parse(req.body.plan_document_data) : req.body.plan_document_data;
        } catch(e) {}
    }
    res.json({
        success: true,
        message: "Plan document and IPR chart updated successfully",
        data: {
            plan_document_data: foundPlan.plan_document_data,
            ipr_chart_file_url: foundPlan.ipr_chart_file_url
        }
    });
});

app.post(['/api/cases/:caseId/treatment-plans/:planId/document', '/cases/:caseId/treatment-plans/:planId/document'], upload.single('ipr_chart_pdf'), (req, res) => {
    const plan = db.treatmentPlans.find(p => p.id === parseInt(req.params.planId));
    if (plan && req.body.plan_document_data) {
        try {
            plan.plan_document_data = JSON.parse(req.body.plan_document_data);
        } catch (e) {
            plan.plan_document_data = req.body.plan_document_data;
        }
    }
    res.json({
        success: true,
        message: "Plan document and IPR chart saved successfully",
        data: {
            plan_document_data: plan ? plan.plan_document_data : {},
            ipr_chart_file_url: req.file ? `/uploads/${req.file.filename}` : (plan ? plan.ipr_chart_file_url : "/uploads/velourcare-ipr-chart-sample.pdf")
        }
    });
});

app.post(['/api/cases/:caseId/treatment-plans/:planId/approve', '/cases/:caseId/treatment-plans/:planId/approve'], (req, res) => {
    const caseId = parseInt(req.params.caseId);
    const planId = parseInt(req.params.planId);
    const foundCase = (db.cases || []).find(c => c.id === caseId);
    if (!foundCase) {
        return res.status(404).json({ message: `Case #${caseId} not found.` });
    }

    const foundPlan = (db.treatmentPlans || []).find(p => p.id === planId && p.case_id === caseId) || (db.treatmentPlans || []).find(p => p.id === planId);
    if (foundPlan) {
        foundPlan.status = { value: "approved", label: "Approved", color: "success" };
    }

    foundCase.status = { value: "plan-approved", label: "Plan Approved", color: "success" };
    foundCase.stage = "approved";

    // Auto-generate invoice upon clinical plan approval
    if (!db.invoices) db.invoices = [];
    const invId = db.invoices.length + 1;
    const invNumber = `INV-VELOUR-${new Date().getFullYear()}-${String(invId).padStart(3, '0')}`;
    const newInvoice = {
        id: invId,
        invoice_number: invNumber,
        case_id: foundCase.id,
        case_code: foundCase.case_id || `VELOUR-${String(foundCase.id).padStart(4, '0')}`,
        client_id: foundCase.client_id || 1,
        client_name: foundCase.client_name || "Wright Orthodontics Clinic",
        client: { id: foundCase.client_id || 1, name: foundCase.client_name || "Wright Orthodontics Clinic" },
        patient_name: foundCase.patient_name || (foundCase.patient && foundCase.patient.name) || "Patient",
        billing_period_start: new Date().toISOString().slice(0, 10),
        billing_period_end: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        document_status: "issued",
        document_status_label: "Issued",
        payment_status: "unpaid",
        payment_status_label: "Pending Payment",
        currency: "AED",
        subtotal: 4500.00,
        tax: 225.00,
        total: 4725.00,
        amount: 4725.00,
        due_date: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
        issued_at: new Date().toISOString().slice(0, 10),
        items: [
            {
                description: `VelourCare Clear Aligner Full Treatment Package - Case ${foundCase.case_id || foundCase.id}`,
                quantity: 1,
                unit_price: 4500.00,
                total: 4500.00
            }
        ]
    };
    db.invoices.push(newInvoice);

    res.json({
        success: true,
        message: "Treatment plan approved. Case moved to manufacturing queue and invoice generated.",
        case: foundCase,
        plan: foundPlan,
        invoice: newInvoice
    });
});

app.post(['/api/cases/:caseId/treatment-plans/:planId/reject', '/cases/:caseId/treatment-plans/:planId/reject'], (req, res) => {
    const caseId = parseInt(req.params.caseId);
    const planId = parseInt(req.params.planId);
    const foundCase = (db.cases || []).find(c => c.id === caseId);
    if (!foundCase) {
        return res.status(404).json({ message: `Case #${caseId} not found.` });
    }

    const foundPlan = (db.treatmentPlans || []).find(p => p.id === planId && p.case_id === caseId) || (db.treatmentPlans || []).find(p => p.id === planId);
    if (foundPlan) {
        foundPlan.status = { value: "revision-requested", label: "Revision Requested", color: "warning" };
    }

    foundCase.status = { value: "needs-revision", label: "Needs Revision", color: "warning" };

    if (!db.comments) db.comments = [];
    const notes = req.body.notes || req.body.reason || "Modification requested by doctor.";
    const commentRecord = {
        id: db.comments.length + 1,
        case_id: caseId,
        author_name: (req.user && req.user.name) || "Doctor",
        author_role: (req.user && req.user.role_slug) || "doctor",
        message: `[Plan Revision Request]: ${notes}`,
        created_at: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };
    db.comments.push(commentRecord);

    res.json({
        success: true,
        message: "Modification requested for treatment plan.",
        case: foundCase,
        plan: foundPlan,
        comment: commentRecord
    });
});

// ==========================================
// 6. CLIENTS & SUB-CLIENTS
// ==========================================
app.get(['/api/clients', '/clients'], (req, res) => {
    const clients = getActiveClients();
    res.json({
        data: clients,
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: clients.length
    });
});

app.get(['/api/clients/as-filter-options', '/clients/as-filter-options'], (req, res) => {
    const clients = getActiveClients();
    res.json({
        data: clients.map(c => ({ id: c.id, label: c.name, prefix: c.case_id_prefix }))
    });
});

app.get(['/api/clients/verify-case-id-prefix', '/clients/verify-case-id-prefix'], (req, res) => {
    const prefix = (req.query.case_id_prefix || '').toUpperCase();
    if (['REF', 'RET'].includes(prefix)) {
        return res.status(422).json({
            message: "The prefixes REF and RET are reserved.",
            errors: { case_id_prefix: ["Reserved for refinements and retainers."] }
        });
    }
    res.json({ valid: true });
});

app.get(['/api/clients/:id', '/clients/:id'], (req, res) => {
    if (req.path === `/clients/${req.params.id}` && req.accepts('html') && !req.headers['accept']?.includes('application/json')) {
        return res.redirect(`/clients/${req.params.id}/edit`);
    }
    const clients = getActiveClients();
    const client = clients.find(c => c.id === parseInt(req.params.id)) || clients[0];
    res.json({ data: client });
});

app.post(['/api/clients', '/clients'], upload.any(), (req, res) => {
    const body = req.body || {};
    const clientName = body.client_name || body.name || "New Practice Clinic";
    const cfg = getPortalConfig();
    if (!cfg.clients) cfg.clients = [...db.clients];
    const newId = cfg.clients.length ? Math.max(...cfg.clients.map(c => c.id || 0)) + 1 : 1;
    const prefix = (body.case_id_prefix || "CLI").toUpperCase();

    const newClient = {
        id: newId,
        name: clientName,
        company_title: body.company_title || clientName,
        company_name: body.company_name || clientName,
        email: body.email || "clinic@practice.ae",
        phone: body.phone || "+971 4 000 0000",
        case_id_prefix: prefix,
        is_manufacturing_active: body.is_manufacturing_active || "NO",
        is_express_delivery_active: body.is_express_delivery_active || "NO",
        is_alphanumeric_case_id_active: "YES",
        is_sub_clients_allowed: body.is_sub_clients_allowed || "NO",
        last_case_number: parseInt(body.last_case_number || 0),
        country: body.country || "United Arab Emirates",
        addresses: [
            {
                id: 1,
                title: "Main Practice Address",
                address_line_1: "Dubai Healthcare City, Complex 64",
                city: "Dubai",
                state: "Dubai",
                postal_code: "00000",
                country: body.country || "United Arab Emirates",
                phone: body.phone || "+971 4 000 0000",
                is_default: true
            }
        ],
        shipment_addresses: [
            {
                id: 1,
                title: "Main Practice Delivery Hub",
                address_line_1: "Dubai Healthcare City, Delivery Hub",
                city: "Dubai",
                state: "Dubai",
                postal_code: "00000",
                country: body.country || "United Arab Emirates",
                phone: body.phone || "+971 4 000 0000",
                is_default: true
            }
        ],
        sub_clients: []
    };

    cfg.clients.push(newClient);
    savePortalConfig(cfg);
    if (!db.clients) db.clients = [];
    db.clients.push(newClient);

    // If client user account was provided in the modal, create the user record
    if (body.username) {
        const users = getSafeUsers();
        const newUserId = users.length ? Math.max(...users.map(u => u.id || 0)) + 1 : 1;
        const newUser = {
            id: newUserId,
            name: clientName,
            fullName: clientName,
            first_name: clientName.split(' ')[0] || "Client",
            last_name: clientName.split(' ').slice(1).join(' ') || "Doctor",
            username: body.username,
            email: body.email || (body.username + "@velourcare.com"),
            phone: body.phone || "+971 4 000 0000",
            role_slug: "client",
            gender: "male",
            status: { label: "Active", value: "active", color: "success" },
            is_super_admin: false,
            profile_pic_url: "/assets/velourcare-square.png",
            permissions: ["view_cases", "edit_treatment_plans", "view_invoices"],
            client: { id: newId, name: clientName, case_id_prefix: prefix, is_manufacturing_active: newClient.is_manufacturing_active },
            assigned_role_modal: {
                id: newId,
                name: clientName,
                company_name: clientName,
                login_uri: prefix.toLowerCase(),
                login_image_url: "/assets/velourcare-logo.png",
                navigation_logo_url: "/assets/velourcare-logo.png",
                logo_url: "/assets/velourcare-square.png"
            }
        };
        users.push(newUser);
    }

    res.json({
        success: true,
        message: "Client created successfully",
        data: newClient
    });
});

app.put(['/api/clients/:id', '/clients/:id', '/api/clients/:id/edit', '/clients/:id/edit'], upload.any(), (req, res) => {
    const cfg = getPortalConfig();
    if (!cfg.clients) cfg.clients = [...db.clients];
    const targetId = parseInt(req.params.id);
    const client = cfg.clients.find(c => c.id === targetId) || cfg.clients[0];
    if (client) {
        Object.assign(client, req.body);
        if (req.body.client_name) client.name = req.body.client_name;
        if (req.body.shipment_addresses) client.addresses = req.body.shipment_addresses;
        if (req.body.addresses) client.shipment_addresses = req.body.addresses;
        savePortalConfig(cfg);
        res.json({ success: true, message: "Client updated successfully", data: client });
    } else {
        res.status(404).json({ success: false, message: "Client not found" });
    }
});

app.post(['/api/clients/:id/edit', '/clients/:id/edit'], upload.any(), (req, res) => {
    const cfg = getPortalConfig();
    if (!cfg.clients) cfg.clients = [...db.clients];
    const client = cfg.clients.find(c => c.id === parseInt(req.params.id)) || cfg.clients[0];
    if (client) {
        Object.assign(client, req.body);
        if (req.body.client_name) client.name = req.body.client_name;
        savePortalConfig(cfg);
        res.json({ success: true, message: "Client details updated successfully", data: client });
    } else {
        res.status(404).json({ success: false, message: "Client not found" });
    }
});

app.put(['/api/clients/:id/update-personal-details', '/clients/:id/update-personal-details', '/api/clients/:id/edit-personal-details', '/clients/:id/edit-personal-details'], upload.any(), (req, res) => {
    const cfg = getPortalConfig();
    if (!cfg.clients) cfg.clients = [...db.clients];
    const client = cfg.clients.find(c => c.id === parseInt(req.params.id)) || cfg.clients[0];
    if (client) {
        const body = req.body || {};
        if (body.name || body.client_name) client.name = body.client_name || body.name;
        if (body.email) client.email = body.email;
        if (body.phone) client.phone = body.phone;
        if (body.company_title) client.company_title = body.company_title;
        savePortalConfig(cfg);
        res.json({ success: true, message: "Personal details updated successfully", data: client });
    } else {
        res.json({ success: true, message: "Personal details updated" });
    }
});

app.post(['/api/clients/:id/update-personal-details', '/clients/:id/update-personal-details', '/api/clients/:id/edit-personal-details', '/clients/:id/edit-personal-details'], upload.any(), (req, res) => {
    const cfg = getPortalConfig();
    if (!cfg.clients) cfg.clients = [...db.clients];
    const client = cfg.clients.find(c => c.id === parseInt(req.params.id)) || cfg.clients[0];
    if (client) {
        Object.assign(client, req.body);
        if (req.body.client_name) client.name = req.body.client_name;
        savePortalConfig(cfg);
        res.json({ success: true, message: "Personal details updated successfully", data: client });
    } else {
        res.json({ success: true, message: "Personal details updated" });
    }
});

// CLIENT SHIPMENT ADDRESSES (Full CRUD for UI buttons & tabs)
app.post(['/api/clients/:id/shipment-addresses', '/clients/:id/shipment-addresses'], (req, res) => {
    const cfg = getPortalConfig();
    if (!cfg.clients) cfg.clients = [...db.clients];
    const client = cfg.clients.find(c => c.id === parseInt(req.params.id));
    if (client) {
        if (!client.addresses) client.addresses = [];
        const newAddressId = client.addresses.length ? Math.max(...client.addresses.map(a => a.id || 0)) + 1 : 1;
        const newAddress = {
            id: newAddressId,
            is_default: req.body.is_default || client.addresses.length === 0,
            title: req.body.title || "Practice Branch Address",
            address_line_1: req.body.address_line_1 || "",
            address_line_2: req.body.address_line_2 || "",
            city: req.body.city || "Dubai",
            state: req.body.state || "Dubai",
            postal_code: req.body.postal_code || "00000",
            country: req.body.country || "United Arab Emirates",
            phone: req.body.phone || client.phone || "+971 4 000 0000"
        };
        if (newAddress.is_default) {
            client.addresses.forEach(a => { a.is_default = false; });
        }
        client.addresses.push(newAddress);
        client.shipment_addresses = client.addresses;
        savePortalConfig(cfg);
        res.json({ success: true, message: "Shipment address added successfully", data: newAddress });
    } else {
        res.status(404).json({ success: false, message: "Client not found" });
    }
});

app.put(['/api/clients/:id/shipment-addresses/:addressId', '/clients/:id/shipment-addresses/:addressId'], (req, res) => {
    const cfg = getPortalConfig();
    if (!cfg.clients) cfg.clients = [...db.clients];
    const client = cfg.clients.find(c => c.id === parseInt(req.params.id));
    if (client && client.addresses) {
        const addr = client.addresses.find(a => a.id === parseInt(req.params.addressId));
        if (addr) {
            Object.assign(addr, req.body);
            if (req.body.is_default) {
                client.addresses.forEach(a => { if (a.id !== addr.id) a.is_default = false; });
            }
            client.shipment_addresses = client.addresses;
            savePortalConfig(cfg);
            return res.json({ success: true, message: "Shipment address updated successfully", data: addr });
        }
    }
    res.json({ success: true, message: "Address updated" });
});

app.delete(['/api/clients/:id/shipment-addresses/:addressId', '/clients/:id/shipment-addresses/:addressId'], (req, res) => {
    const cfg = getPortalConfig();
    if (!cfg.clients) cfg.clients = [...db.clients];
    const client = cfg.clients.find(c => c.id === parseInt(req.params.id));
    if (client && client.addresses) {
        client.addresses = client.addresses.filter(a => a.id !== parseInt(req.params.addressId));
        client.shipment_addresses = client.addresses;
        savePortalConfig(cfg);
        return res.json({ success: true, message: "Shipment address deleted successfully" });
    }
    res.json({ success: true, message: "Address deleted" });
});

app.patch(['/api/clients/:id/shipment-addresses/:addressId/set-default', '/clients/:id/shipment-addresses/:addressId/set-default'], (req, res) => {
    const cfg = getPortalConfig();
    if (!cfg.clients) cfg.clients = [...db.clients];
    const client = cfg.clients.find(c => c.id === parseInt(req.params.id));
    if (client && client.addresses) {
        const targetId = parseInt(req.params.addressId);
        client.addresses.forEach(a => { a.is_default = (a.id === targetId); });
        client.shipment_addresses = client.addresses;
        savePortalConfig(cfg);
    }
    res.json({ success: true, message: "Default address set successfully" });
});

app.put(['/api/clients/:id/update-shipment-addresses', '/clients/:id/update-shipment-addresses', '/api/clients/:id/edit-shipment-addresses', '/clients/:id/edit-shipment-addresses'], (req, res) => {
    const cfg = getPortalConfig();
    if (!cfg.clients) cfg.clients = [...db.clients];
    const client = cfg.clients.find(c => c.id === parseInt(req.params.id));
    if (client) {
        const addrs = req.body.shipment_addresses || req.body.addresses || [];
        client.addresses = addrs;
        client.shipment_addresses = addrs;
        savePortalConfig(cfg);
        res.json({ success: true, message: "Shipment addresses saved successfully", data: client });
    } else {
        res.json({ success: true, message: "Shipment addresses saved" });
    }
});

app.put(['/api/clients/:id/update-treatment-details', '/clients/:id/update-treatment-details', '/api/clients/:id/edit-treatment-details', '/clients/:id/edit-treatment-details'], upload.any(), (req, res) => {
    res.json({ success: true, message: "Treatment details updated successfully" });
});

app.post(['/api/clients/:id/update-treatment-details', '/clients/:id/update-treatment-details', '/api/clients/:id/edit-treatment-details', '/clients/:id/edit-treatment-details'], upload.any(), (req, res) => {
    res.json({ success: true, message: "Treatment details updated successfully" });
});

app.put(['/api/clients/:id/update-manufacturing-details', '/clients/:id/update-manufacturing-details', '/api/clients/:id/edit-manufacturing-details', '/clients/:id/edit-manufacturing-details'], upload.any(), (req, res) => {
    res.json({ success: true, message: "Manufacturing details updated successfully" });
});

app.post(['/api/clients/:id/update-manufacturing-details', '/clients/:id/update-manufacturing-details', '/api/clients/:id/edit-manufacturing-details', '/clients/:id/edit-manufacturing-details'], upload.any(), (req, res) => {
    res.json({ success: true, message: "Manufacturing details updated successfully" });
});

app.put(['/api/clients/:id/update-account-details', '/clients/:id/update-account-details'], upload.any(), (req, res) => {
    res.json({ success: true, message: "Account details updated successfully" });
});

app.post(['/api/clients/:id/update-account-details', '/clients/:id/update-account-details'], upload.any(), (req, res) => {
    res.json({ success: true, message: "Account details updated successfully" });
});

app.put(['/api/clients/:id/update-payment-details', '/clients/:id/update-payment-details'], upload.any(), (req, res) => {
    res.json({ success: true, message: "Payment details updated successfully" });
});

app.post(['/api/clients/:id/update-payment-details', '/clients/:id/update-payment-details'], upload.any(), (req, res) => {
    res.json({ success: true, message: "Payment details updated successfully" });
});

app.put(['/api/clients/:id/update-privacy-restrictions', '/clients/:id/update-privacy-restrictions', '/api/clients/:id/edit-privacy-restrictions', '/clients/:id/edit-privacy-restrictions'], (req, res) => {
    res.json({ success: true, message: "Privacy settings updated successfully" });
});

// Direct Portal Configuration API
app.get(['/api/admin/portal-config', '/admin/portal-config'], (req, res) => {
    res.json({ success: true, data: getPortalConfig() });
});

app.post(['/api/admin/portal-config', '/admin/portal-config'], (req, res) => {
    savePortalConfig(req.body);
    res.json({ success: true, message: "Portal configuration updated successfully" });
});

app.get(['/api/clients/:id/next-case-id', '/clients/:id/next-case-id'], (req, res) => {
    const nextId = "VELOUR-" + String(db.cases.length + 1).padStart(4, '0');
    res.json({ next_case_id: nextId });
});

app.patch(['/api/clients/:id/update-status', '/clients/:id/update-status'], (req, res) => {
    res.json({ success: true, message: "Client status updated" });
});

app.patch(['/api/clients/:id/toggle-sub-client-feature', '/clients/:id/toggle-sub-client-feature'], (req, res) => {
    res.json({ success: true, message: "Sub-client permissions updated" });
});

app.post(['/api/clients/:id/regenerate-status-webhook-secret', '/clients/:id/regenerate-status-webhook-secret'], (req, res) => {
    res.json({ success: true, secret: "whsec_velourcare_" + Date.now() });
});

app.get(['/api/clients/:id/allocated-vendors', '/clients/:id/allocated-vendors'], (req, res) => {
    res.json({ data: db.vendors });
});

app.get(['/api/clients/:id/billable-preview', '/clients/:id/billable-preview'], (req, res) => {
    const clientId = parseInt(req.params.id);
    const client = getActiveClients().find(c => c.id === clientId) || db.clients[0];
    const clientCases = (db.cases || []).filter(c => c.client_id === clientId || !c.client_id || c.client_id === 1);

    const billableLines = (clientCases.length ? clientCases : db.cases).slice(0, 4).map((c, idx) => ({
        patient_case_billable_id: idx + 1,
        case_id: c.case_id || `VELOUR-000${c.id || (idx + 1)}`,
        patient_name: c.patient_name || (c.patient && c.patient.name) || "Patient",
        case_owner: c.doctor_name || (c.user && c.user.name) || "Dr. Alexander Wright",
        billable_for: idx % 2 === 0 ? "treatment-planning" : "manufacturing",
        billable_for_label: idx % 2 === 0 ? "Treatment Planning" : "Manufacturing",
        billable_at: "2026-11-10",
        case_status: (c.status && c.status.label) || "Review Treatment Plan",
        quantity: 1,
        unit_price: idx % 2 === 0 ? 1500.00 : 3000.00,
        amount: idx % 2 === 0 ? 1500.00 : 3000.00,
        total: idx % 2 === 0 ? 1500.00 : 3000.00
    }));

    const subtotal = billableLines.reduce((acc, l) => acc + l.total, 0) || 4500.00;
    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    res.json({
        data: {
            client_id: clientId,
            client_name: client ? client.name : "Wright Orthodontics Clinic",
            treatment_planning_count: billableLines.filter(l => l.billable_for === "treatment-planning").length,
            manufacturing_count: billableLines.filter(l => l.billable_for === "manufacturing").length,
            estimated_subtotal: subtotal,
            estimated_tax: tax,
            estimated_total: total,
            estimated_total_formatted: `AED ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            currency: "AED",
            billable_lines: billableLines,
            unbilled_cases: billableLines,
            total_amount: total
        }
    });
});


// ==========================================
// SUB-CLIENTS FULL CRUD & FILTER OPTIONS
// ==========================================
app.get(['/api/sub-clients/filter-options', '/sub-clients/filter-options'], (req, res) => {
    const clients = getActiveClients();
    res.json({
        data: {
            clients: clients.map(c => ({ id: c.id, name: c.name })),
            statuses: { "active": "Active", "inactive": "Inactive" }
        }
    });
});

app.get(['/api/sub-clients', '/sub-clients'], (req, res) => {
    const clients = getActiveClients();
    res.json({
        data: db.subClients,
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: db.subClients.length,
        meta: {
            current_page: 1,
            last_page: 1,
            per_page: 20,
            total: db.subClients.length
        },
        additional: {
            filter_options: {
                clients: clients.map(c => ({ id: c.id, name: c.name })),
                statuses: { "active": "Active", "inactive": "Inactive" }
            }
        }
    });
});

app.get(['/api/sub-clients/:id', '/sub-clients/:id'], (req, res) => {
    if (req.path === `/sub-clients/${req.params.id}` && req.accepts('html') && !req.headers['accept']?.includes('application/json')) {
        return res.redirect(`/sub-clients/${req.params.id}/edit`);
    }
    const subClient = db.subClients.find(s => s.id === parseInt(req.params.id));
    if (!subClient) {
        return res.status(404).json({ message: `Sub-client #${req.params.id} not found.` });
    }
    const clients = getActiveClients();
    res.json({
        data: subClient,
        additional: {
            filter_options: {
                clients: clients.map(c => ({ id: c.id, name: c.name }))
            }
        }
    });
});

app.post(['/api/sub-clients', '/sub-clients'], (req, res) => {
    const newId = db.subClients.length ? Math.max(...db.subClients.map(s => s.id || 0)) + 1 : 1;
    const newSubClient = {
        id: newId,
        name: req.body.client_name || req.body.name || "New Clinic Branch",
        company_name: req.body.client_name || "New Clinic Branch",
        parent_id: req.body.parent_id ? parseInt(req.body.parent_id) : 1,
        case_id_prefix: (req.body.case_id_prefix || "SUB").toUpperCase(),
        cases_count: 0,
        status: { label: "Active", value: "active", color: "success" },
        created_at: new Date().toISOString()
    };
    db.subClients.push(newSubClient);
    res.json({ success: true, message: "Sub client created successfully", data: newSubClient });
});

app.put(['/api/sub-clients/:id', '/sub-clients/:id', '/api/sub-clients/:id/edit', '/sub-clients/:id/edit'], (req, res) => {
    const subClient = db.subClients.find(s => s.id === parseInt(req.params.id));
    if (subClient) {
        Object.assign(subClient, req.body);
        res.json({ success: true, message: "Sub client updated successfully", data: subClient });
    } else {
        res.status(404).json({ success: false, message: "Sub client not found" });
    }
});

app.delete(['/api/sub-clients/:id', '/sub-clients/:id'], (req, res) => {
    const idx = db.subClients.findIndex(s => s.id === parseInt(req.params.id));
    if (idx !== -1) {
        db.subClients.splice(idx, 1);
        res.json({ success: true, message: "Sub client deleted successfully" });
    } else {
        res.status(404).json({ success: false, message: "Sub client not found" });
    }
});

app.patch(['/api/sub-clients/:id/update-status', '/sub-clients/:id/update-status'], (req, res) => {
    res.json({ success: true, message: "Sub client status updated" });
});

// ==========================================
// 7. INVOICES & PAYMENTS
// ==========================================
app.get(['/api/invoices', '/invoices'], (req, res) => {
    res.json({
        data: db.invoices || [],
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: (db.invoices || []).length
    });
});

app.get(['/api/invoices/filter-options', '/invoices/filter-options', '/api/invoices/as-filter-options', '/invoices/as-filter-options'], (req, res) => {
    const clients = getActiveClients();
    const formattedClients = clients.map(c => {
        const subs = (db.subClients || [])
            .filter(sc => sc.parent_id === c.id || sc.parent_client_id === c.id)
            .map(sc => ({
                id: sc.id,
                name: sc.name,
                company_name: sc.name,
                is_manufacturing_active: sc.is_manufacturing_active || "YES",
                tp_billing_agreement: null
            }));
        return {
            id: c.id,
            name: c.name,
            company_name: c.company_name || c.name,
            is_manufacturing_active: c.is_manufacturing_active || "YES",
            tp_billing_agreement: null,
            sub_clients: subs
        };
    });

    res.json({
        data: {
            clients: formattedClients,
            document_statuses: {
                "issued": "Issued",
                "draft": "Draft",
                "cancelled": "Cancelled"
            },
            payment_statuses: {
                "unpaid": "Unpaid",
                "paid": "Paid",
                "partially_paid": "Partially Paid"
            }
        },
        clients: formattedClients
    });
});

app.get(['/api/invoices/:id', '/invoices/:id'], (req, res) => {
    const inv = (db.invoices || []).find(i => i.id === parseInt(req.params.id));
    if (!inv) {
        return res.status(404).json({ message: `Invoice #${req.params.id} not found.` });
    }
    res.json({ data: inv });
});

app.post(['/api/invoices/generate', '/invoices/generate'], (req, res) => {
    if (!db.invoices) db.invoices = [];
    const clientId = parseInt(req.body.client_id) || 1;
    const client = getActiveClients().find(c => c.id === clientId) || db.clients[0];
    const newInvId = db.invoices.length + 1;
    const invNumber = "INV-VELOUR-" + new Date().getFullYear() + "-" + String(newInvId).padStart(3, '0');
    
    const newInv = {
        id: newInvId,
        invoice_number: invNumber,
        client_id: clientId,
        client_name: client ? client.name : "Wright Orthodontics Clinic",
        client: { id: clientId, name: client ? client.name : "Wright Orthodontics Clinic" },
        amount: req.body.amount || 4725.00,
        subtotal: 4500.00,
        tax: 225.00,
        total: 4725.00,
        currency: "AED",
        status: "issued",
        document_status: "issued",
        document_status_label: "Issued",
        payment_status: "unpaid",
        payment_status_label: "Pending Payment",
        billing_period_start: req.body.billing_period_start || new Date().toISOString().slice(0, 10),
        billing_period_end: req.body.billing_period_end || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        due_date: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
        issued_at: new Date().toISOString().slice(0, 10),
        created_at: new Date().toISOString().slice(0, 10),
        notes: req.body.notes || "",
        items: req.body.items || [
            { description: "VelourCare Treatment Planning & Manufacturing Service", quantity: 1, unit_price: 4500.00, total: 4500.00 }
        ]
    };
    db.invoices.push(newInv);
    res.json({ success: true, message: "Invoice draft created successfully", data: newInv });
});

app.post(['/api/invoices/:id/issue', '/invoices/:id/issue'], (req, res) => {
    res.json({ success: true, message: "Invoice issued to client." });
});

app.post(['/api/invoices/:id/checkout', '/invoices/:id/checkout'], (req, res) => {
    res.json({
        success: true,
        checkout_url: "https://checkout.stripe.com/demo/velourcare-checkout"
    });
});

app.post(['/api/invoices/:id/submit-payment-proof', '/invoices/:id/submit-payment-proof'], upload.single('payment_proof'), (req, res) => {
    res.json({ success: true, message: "Bank transfer payment proof submitted for review." });
});

// ==========================================
// VENDORS FULL CRUD & MANUFACTURING
// ==========================================
app.get(['/api/vendors', '/vendors'], (req, res) => {
    res.json({
        data: db.vendors,
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: db.vendors.length,
        meta: {
            current_page: 1,
            last_page: 1,
            per_page: 20,
            total: db.vendors.length
        },
        additional: {
            filter_options: {
                statuses: { "active": "Active", "inactive": "Inactive" }
            }
        }
    });
});

app.get(['/api/vendors/as-filter-options', '/vendors/as-filter-options'], (req, res) => {
    res.json({
        data: db.vendors.map(v => ({ id: v.id, label: v.name }))
    });
});

app.get(['/api/vendors/manufacturing-filter-options', '/vendors/manufacturing-filter-options'], (req, res) => {
    res.json({
        data: {
            vendors: db.vendors,
            filter_options: {
                input_types: ["Text", "Number", "File", "Date", "Dropdown"],
                selection_types: ["Single", "Multiple", "Toggle"]
            }
        }
    });
});

app.get(['/api/vendors/:id', '/vendors/:id'], (req, res) => {
    if (req.path === `/vendors/${req.params.id}` && req.accepts('html') && !req.headers['accept']?.includes('application/json')) {
        return res.redirect(`/vendors/${req.params.id}/edit`);
    }
    const vendor = db.vendors.find(v => v.id === parseInt(req.params.id)) || db.vendors[0];
    res.json({ data: vendor });
});

app.post(['/api/vendors', '/vendors'], upload.single('logo'), (req, res) => {
    const newId = db.vendors.length ? Math.max(...db.vendors.map(v => v.id || 0)) + 1 : 1;
    const newVendor = {
        id: newId,
        name: req.body.vendor_name || req.body.name || "New Production Lab",
        email: req.body.email || "lab@vendor.ae",
        status: { label: "Active", value: "active", color: "success" },
        services_count: 0,
        services: []
    };
    db.vendors.push(newVendor);
    res.json({ success: true, message: "Vendor created successfully", data: newVendor });
});

app.put(['/api/vendors/:id', '/vendors/:id', '/api/vendors/:id/edit', '/vendors/:id/edit'], (req, res) => {
    const vendor = db.vendors.find(v => v.id === parseInt(req.params.id));
    if (vendor) {
        Object.assign(vendor, req.body);
        res.json({ success: true, message: "Vendor updated successfully", data: vendor });
    } else {
        res.status(404).json({ success: false, message: "Vendor not found" });
    }
});

app.delete(['/api/vendors/:id', '/vendors/:id'], (req, res) => {
    const idx = db.vendors.findIndex(v => v.id === parseInt(req.params.id));
    if (idx !== -1) {
        db.vendors.splice(idx, 1);
        res.json({ success: true, message: "Vendor deleted successfully" });
    } else {
        res.status(404).json({ success: false, message: "Vendor not found" });
    }
});

app.patch(['/api/vendors/:id/update-status', '/vendors/:id/update-status'], (req, res) => {
    res.json({ success: true, message: "Vendor status updated" });
});

app.get(['/api/vendors/:id/services', '/vendors/:id/services'], (req, res) => {
    const vendor = db.vendors.find(v => v.id === parseInt(req.params.id)) || db.vendors[0];
    res.json({ data: vendor ? vendor.services || [] : [] });
});

app.get(['/api/vendors/:id/services/as-filter-options', '/vendors/:id/services/as-filter-options'], (req, res) => {
    const vendor = (db.vendors || []).find(v => v.id === parseInt(req.params.id)) || (db.vendors || [])[0];
    const services = (vendor && vendor.services && vendor.services.length) ? vendor.services : [
        { id: 1, name: "Clear Aligner Thermoforming", title: "Clear Aligner Thermoforming" },
        { id: 2, name: "Laser Automated Trimming", title: "Laser Automated Trimming" }
    ];
    res.json({
        data: services.map(s => ({
            id: s.id,
            value: s.id,
            label: s.name || s.title || "Service",
            name: s.name || s.title || "Service"
        }))
    });
});

app.post(['/api/vendors/:id/services', '/vendors/:id/services', '/api/vendors/:id/services/auth-vendor-create', '/vendors/:id/services/auth-vendor-create'], (req, res) => {
    res.json({ success: true, message: "Vendor service created successfully" });
});

app.put(['/api/vendors/:id/services/:serviceId', '/vendors/:id/services/:serviceId', '/api/vendors/:id/services/:serviceId/auth-vendor-edit', '/vendors/:id/services/:serviceId/auth-vendor-edit'], (req, res) => {
    res.json({ success: true, message: "Vendor service updated successfully" });
});

app.delete(['/api/vendors/:id/services/:serviceId', '/vendors/:id/services/:serviceId', '/api/vendors/:id/services/:serviceId/auth-vendor-delete', '/vendors/:id/services/:serviceId/auth-vendor-delete'], (req, res) => {
    res.json({ success: true, message: "Vendor service deleted successfully" });
});

app.patch(['/api/vendors/:id/services/:serviceId/toggle-status', '/vendors/:id/services/:serviceId/toggle-status', '/api/vendors/:id/services/:serviceId/auth-vendor-toggle-status', '/vendors/:id/services/:serviceId/auth-vendor-toggle-status'], (req, res) => {
    res.json({ success: true, message: "Vendor service status toggled" });
});

app.get(['/api/vendors/:id/allocated-clients', '/vendors/:id/allocated-clients'], (req, res) => {
    res.json({ data: getActiveClients() });
});

app.get(['/api/vendors/:id/allocatable-clients', '/vendors/:id/allocatable-clients'], (req, res) => {
    res.json({ data: getActiveClients() });
});

app.post(['/api/vendors/:id/allocate-clients', '/vendors/:id/allocate-clients'], (req, res) => {
    res.json({ success: true, message: "Clients allocated to manufacturing vendor." });
});

app.delete(['/api/vendors/:id/detach-clients/:clientId', '/vendors/:id/detach-clients/:clientId'], (req, res) => {
    res.json({ success: true, message: "Client detached from vendor." });
});

// ==========================================
// BANK ACCOUNTS & PATIENTS
// ==========================================
app.get(['/api/bank-accounts', '/bank-accounts'], (req, res) => {
    res.json({
        data: db.bankAccounts || [],
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: (db.bankAccounts || []).length
    });
});

app.get(['/api/bank-accounts/as-filter-options', '/bank-accounts/as-filter-options', '/api/bank-accounts/filter-options', '/bank-accounts/filter-options'], (req, res) => {
    const accounts = db.bankAccounts || [];
    res.json({
        data: accounts.map(b => ({
            id: b.id,
            value: b.id,
            label: `${b.bank_name} - ${b.account_number} (${b.currency})`,
            bank_name: b.bank_name,
            account_number: b.account_number,
            currency: b.currency,
            is_default: b.is_default
        }))
    });
});

app.get(['/api/bank-accounts/:id', '/bank-accounts/:id'], (req, res) => {
    const acc = (db.bankAccounts || []).find(b => b.id === parseInt(req.params.id));
    if (!acc) {
        return res.status(404).json({ message: `Bank account #${req.params.id} not found.` });
    }
    res.json({ data: acc });
});

app.post(['/api/bank-accounts', '/bank-accounts'], (req, res) => {
    if (!db.bankAccounts) db.bankAccounts = [];
    const newId = db.bankAccounts.length ? Math.max(...db.bankAccounts.map(b => b.id || 0)) + 1 : 1;
    const newAcc = {
        id: newId,
        bank_name: req.body.bank_name || "Emirates NBD",
        account_title: req.body.account_title || "VelourCare Ortho",
        account_number: req.body.account_number || "000000000",
        iban: req.body.iban || "AE0000000000000000000",
        swift_code: req.body.swift_code || "EBILAEADXXX",
        currency: req.body.currency || "AED",
        is_default: req.body.is_default || db.bankAccounts.length === 0
    };
    db.bankAccounts.push(newAcc);
    res.json({ success: true, message: "Bank account created successfully", data: newAcc });
});

app.put(['/api/bank-accounts/:id', '/bank-accounts/:id'], (req, res) => {
    res.json({ success: true, message: "Bank account updated successfully" });
});

app.delete(['/api/bank-accounts/:id', '/bank-accounts/:id'], (req, res) => {
    res.json({ success: true, message: "Bank account deleted successfully" });
});

app.patch(['/api/bank-accounts/:id/set-default', '/bank-accounts/:id/set-default'], (req, res) => {
    res.json({ success: true, message: "Default bank account updated" });
});

app.get(['/api/patients', '/patients'], (req, res) => {
    const patients = (db.cases || []).map(c => ({
        id: c.id,
        name: c.patient_name,
        gender: c.patient_gender,
        age: c.patient_age,
        email: c.patient_email || (c.patient && c.patient.email),
        phone: c.patient_phone || (c.patient && c.patient.phone),
        case_id: c.case_id,
        status: c.status
    }));
    res.json({
        data: patients,
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: patients.length
    });
});

app.get(['/api/patients/:id', '/patients/:id'], (req, res) => {
    const foundCase = (db.cases || []).find(c => c.id === parseInt(req.params.id) || c.patient_id === parseInt(req.params.id));
    if (!foundCase) {
        return res.status(404).json({ message: `Patient #${req.params.id} not found.` });
    }
    res.json({
        data: {
            id: foundCase.id,
            name: foundCase.patient_name || "Hamid",
            gender: foundCase.patient_gender || "male",
            age: foundCase.patient_age || 30,
            email: foundCase.patient_email || (foundCase.patient && foundCase.patient.email) || "patient@example.com",
            phone: foundCase.patient_phone || (foundCase.patient && foundCase.patient.phone) || "+971 50 000 0000",
            address: foundCase.patient_address || "",
            case_id: foundCase.case_id || "VELOUR-0001",
            status: foundCase.status
        }
    });
});

app.put(['/api/patients/:id', '/patients/:id', '/api/patients/:id/edit', '/patients/:id/edit'], upload.any(), (req, res) => {
    const patientId = parseInt(req.params.id);
    const body = req.body || {};
    const foundCase = (db.cases || []).find(c => c.id === patientId || c.patient_id === patientId);
    if (!foundCase) {
        return res.status(404).json({ message: `Patient #${req.params.id} not found.` });
    }
    
    if (foundCase) {
        if (body.name) foundCase.patient_name = body.name;
        if (body.gender) foundCase.patient_gender = body.gender;
        if (body.email) foundCase.patient_email = body.email;
        if (body.phone) foundCase.patient_phone = body.phone;
        if (body.address) foundCase.patient_address = body.address;
        if (body.date_of_birth) foundCase.patient_date_of_birth = body.date_of_birth;
        if (body.national_id) foundCase.patient_national_id = body.national_id;
        if (body.residency_type) foundCase.patient_residency_type = body.residency_type;
        if (body.medical_history !== undefined) foundCase.patient_medical_history = body.medical_history;

        if (!foundCase.patient) foundCase.patient = {};
        Object.assign(foundCase.patient, {
            name: foundCase.patient_name,
            gender: foundCase.patient_gender,
            email: foundCase.patient_email,
            phone: foundCase.patient_phone,
            address: foundCase.patient_address,
            dateOfBirth: foundCase.patient_date_of_birth,
            nationalId: foundCase.patient_national_id,
            residencyType: foundCase.patient_residency_type,
            medicalHistory: foundCase.patient_medical_history
        });
    }

    res.json({
        success: true,
        message: "Patient details updated successfully",
        data: {
            id: patientId,
            name: body.name || (foundCase && foundCase.patient_name),
            gender: body.gender || (foundCase && foundCase.patient_gender),
            email: body.email || (foundCase && foundCase.patient_email),
            phone: body.phone || (foundCase && foundCase.patient_phone),
            address: body.address || (foundCase && foundCase.patient_address),
            date_of_birth: body.date_of_birth || (foundCase && foundCase.patient_date_of_birth),
            national_id: body.national_id || (foundCase && foundCase.patient_national_id),
            residency_type: body.residency_type || (foundCase && foundCase.patient_residency_type),
            medical_history: body.medical_history !== undefined ? body.medical_history : (foundCase && foundCase.patient_medical_history)
        }
    });
});

app.post(['/api/patients/:id', '/patients/:id'], upload.any(), (req, res) => {
    res.json({ success: true, message: "Patient updated successfully" });
});



// ==========================================
// 9. BANK ACCOUNTS & STRIPE SETTINGS
// ==========================================
app.get(['/api/stripe/platform-status', '/stripe/platform-status'], (req, res) => {
    res.json({
        data: {
            connected: true,
            account_id: "acct_velourcare_platform",
            currency: "AED",
            payouts_enabled: true,
            charges_enabled: true
        }
    });
});

app.get(['/api/clients/:id/stripe-connect', '/clients/:id/stripe-connect'], (req, res) => {
    res.json({
        data: {
            connected: true,
            onboarded: true,
            details_submitted: true,
            payouts_enabled: true
        }
    });
});

app.post(['/api/clients/:id/stripe-connect/onboard', '/clients/:id/stripe-connect/onboard'], (req, res) => {
    res.json({
        status: "pending",
        url: "https://connect.stripe.com/setup/s/velourcare-onboard"
    });
});

app.get(['/api/client-api-credentials', '/client-api-credentials'], (req, res) => {
    res.json({
        data: [
            { id: 1, name: "EMR / Dental Clinic PMS Integration", client_id: "vc_client_live_892348", created_at: "2026-03-15" }
        ]
    });
});

// ==========================================
// 10. REAL-TIME WEBSOCKETS (PUSHER MOCK)
// ==========================================
app.post(['/broadcasting/auth', '/api/broadcasting/auth'], (req, res) => {
    const { socket_id, channel_name } = req.body;
    res.json({
        auth: "velourcare-pusher-auth:" + socket_id,
        channel_data: JSON.stringify({
            user_id: db.currentUser ? db.currentUser.id : 1,
            user_info: { name: db.currentUser ? db.currentUser.name : "Admin" }
        })
    });
});

// ==========================================
// 11. STATIC ASSETS & SPA ROUTING FALLBACK
// ==========================================
const publicPath = path.join(__dirname, 'public');
const publicUploads = path.join(publicPath, 'uploads');
const publicAssets = path.join(publicPath, 'assets');

// Protected PHI / medical 3D scan assets in /uploads
app.use('/uploads', (req, res, next) => {
    const isSensitive = req.path.endsWith('.zip') || req.path.endsWith('.stl') || req.path.endsWith('.ply') || req.path.endsWith('.o3c') || req.path.endsWith('.pdf');
    if (isSensitive && !req.user) {
        return res.status(401).json({ message: "Unauthenticated. PHI scan assets require an authorized session." });
    }
    next();
});
app.use('/uploads', express.static(publicUploads));
app.use('/uploads', express.static(uploadDir));

// Immutable caching for hashed static JS/CSS assets
app.use('/assets', express.static(publicAssets, {
    maxAge: 31536000000,
    immutable: true
}));

// Standard static files (e.g. index.html, favicons, manifests)
app.use(express.static(publicPath, {
    maxAge: 0
}));

// Direct route redirect for /clients/:id -> /clients/:id/edit
app.get(['/clients/:id', '/sub-clients/:id', '/vendors/:id'], (req, res, next) => {
    if (req.accepts('html') && !req.path.startsWith('/api/')) {
        const p = req.path;
        if (!p.endsWith('/edit') && !p.endsWith('/clients')) {
            return res.redirect(`${p}/edit`);
        }
    }
    next();
});

// Fallback to index.html for all SPA routes (history mode)
app.use((req, res) => {
    // If request looks like an API call that wasn't handled, return 404 JSON
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ message: `API endpoint ${req.path} not found.` });
    }
    res.sendFile(path.join(publicPath, 'index.html'));
});

// Global Error Handler (Multer validation, file limits, runtime errors)
app.use((err, req, res, next) => {
    if (err.code === 'INVALID_FILE_TYPE' || err.name === 'MulterError' || (err.message && err.message.includes('not permitted'))) {
        return res.status(400).json({ success: false, message: err.message });
    }
    console.error('Server error:', err);
    res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
});

// Start Server
app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`  VELOURCARE ORTHO CLOUD PORTAL IS RUNNING!           `);
    console.log(`  Local URL:  http://localhost:${PORT}                 `);
    console.log(`  Brand:      VelourCare Ortho                         `);
    console.log(`  API Status: Ready with Laravel Sanctum + REST APIs  `);
    console.log(`=======================================================`);
});
