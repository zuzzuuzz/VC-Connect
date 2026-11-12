import re
import os

server_path = r'D:\Antigravity\velourcare-ortho-cloud\server.js'

with open(server_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Backup original server.js
with open(server_path + '.bak', 'w', encoding='utf-8') as f:
    f.write(content)

print("Backup created at server.js.bak")

# 1. New rich database entries
new_db_clients = """    clients: [
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
    ],"""

new_db_cases = """    cases: [
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
    ],"""

new_db_invoices = """    invoices: [
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
    ],"""

new_db_vendors = """    vendors: [
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
    ],"""

# Replace in content
# 1. Replace clients
content = re.sub(r'clients:\s*\[[\s\S]*?\](?=,\s*\n\s*subClients:)', new_db_clients.strip()[:-1], content)

# 2. Replace cases
content = re.sub(r'cases:\s*\[[\s\S]*?\](?=,\s*\n\s*stepFiles:)', new_db_cases.strip()[:-1], content)

# 3. Replace invoices
content = re.sub(r'invoices:\s*\[[\s\S]*?\](?=,\s*\n\s*vendors:)', new_db_invoices.strip()[:-1], content)

# 4. Replace vendors
content = re.sub(r'vendors:\s*\[[\s\S]*?\](?=,\s*\n\s*bankAccounts:)', new_db_vendors.strip()[:-1], content)

# 5. Insert SPA Navigation Fallback right before Section 1
spa_middleware = """
// ==========================================
// SPA NAVIGATION FALLBACK MIDDLEWARE
// For all browser page requests (e.g. /cases, /clients, /invoices), serve index.html
// Ensure API endpoints (/api/*, /sanctum/*, /broadcasting/*) and assets pass through
// ==========================================
app.use((req, res, next) => {
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
});
"""

if "SPA NAVIGATION FALLBACK MIDDLEWARE" not in content:
    content = content.replace("// ==========================================\n// 1. SANCTUM CSRF COOKIE & AUTH", spa_middleware + "\n// ==========================================\n// 1. SANCTUM CSRF COOKIE & AUTH")

# 6. Update filter-options endpoint to provide rich structure
old_filter_endpoint = """app.get(['/api/cases/filter-options', '/cases/filter-options'], (req, res) => {
    res.json({
        clients: db.clients.map(c => ({ id: c.id, name: c.name })),
        categories: ["New Aligner Case", "Refinements", "Retainers"],
        statuses: [
            { id: "newly-created", label: "Newly Created" },
            { id: "in-planning", label: "In Planning" },
            { id: "review-treatment-plan", label: "Review Treatment Plan" },
            { id: "in-modification", label: "In Modification" },
            { id: "plan-step-files-needed", label: "Step Files Needed" },
            { id: "plan-step-files-ready", label: "Step Files Ready" },
            { id: "in-manufacturing", label: "In Manufacturing" },
            { id: "completed", label: "Completed" }
        ]
    });
});"""

new_filter_endpoint = """app.get(['/api/cases/filter-options', '/cases/filter-options'], (req, res) => {
    res.json({
        clients: db.clients.map(c => ({ 
            id: c.id, 
            name: c.name,
            sub_clients: [
                { id: 1, name: "Downtown Dubai Clinic Branch" },
                { id: 2, name: "Jumeirah Specialist Centre" }
            ]
        })),
        categories: {
            "New Case": "New Case",
            "Refinements": "Refinements",
            "Retainers": "Retainers"
        },
        categoryTypes: {
            "Aligners": "Aligners",
            "Retainers": "Retainers",
            "Nightguards": "Nightguards"
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
    });
});"""

content = content.replace(old_filter_endpoint, new_filter_endpoint)

with open(server_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("server.js successfully patched with rich data structures and SPA navigation middleware!")
