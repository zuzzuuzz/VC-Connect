import re

with open(r"D:\Antigravity\velourcare-ortho-cloud\server.js", "r", encoding="utf-8") as f:
    code = f.read()

# Replace db.clients, db.cases, db.invoices in server.js
cases_replacement = """    cases: [
        {
            id: 1,
            case_id: "VELOUR-0001",
            caseId: "VELOUR-0001",
            patient_name: "Fatima Al-Nuaimi",
            patient: { name: "Fatima Al-Nuaimi", email: "fatima.nuaimi@example.ae", age: 26, gender: "Female" },
            patient_age: 26,
            patient_gender: "Female",
            doctor_name: "Dr. Alexander Wright",
            caseDoctor: "Dr. Alexander Wright",
            client_id: 1,
            client_name: "Wright Orthodontics",
            client: { id: 1, name: "Wright Orthodontics", parent_client: null },
            category: "New Aligner Case",
            caseCategory: "New Case",
            caseCategoryType: "Aligners",
            status: "review-treatment-plan",
            isDraftCase: false,
            deadline: "2026-11-05",
            upper_aligners: 22,
            lower_aligners: 18,
            chief_complaint: "Anterior crowding and midline shift",
            malocclusion: "Class I Malocclusion with severe upper anterior crowding",
            attachments_count: 8,
            step_files_count: 2,
            created_at: "2026-10-15 09:30",
            updated_at: "2026-10-24 14:15"
        },
        {
            id: 2,
            case_id: "VELOUR-0002",
            caseId: "VELOUR-0002",
            patient_name: "Marcus Vance",
            patient: { name: "Marcus Vance", email: "marcus.v@example.com", age: 34, gender: "Male" },
            patient_age: 34,
            patient_gender: "Male",
            doctor_name: "Dr. Alexander Wright",
            caseDoctor: "Dr. Alexander Wright",
            client_id: 1,
            client_name: "Wright Orthodontics",
            client: { id: 1, name: "Wright Orthodontics", parent_client: null },
            category: "New Aligner Case",
            caseCategory: "New Case",
            caseCategoryType: "Aligners",
            status: "in-planning",
            isDraftCase: false,
            deadline: "2026-11-08",
            upper_aligners: 28,
            lower_aligners: 24,
            chief_complaint: "Deep overbite and spacing in lower arch",
            malocclusion: "Class II Division 2 with 80% deep bite",
            attachments_count: 6,
            step_files_count: 0,
            created_at: "2026-10-18 11:20",
            updated_at: "2026-10-25 16:40"
        },
        {
            id: 3,
            case_id: "REF1-VELOUR-0003",
            caseId: "REF1-VELOUR-0003",
            patient_name: "Zainab Rashid",
            patient: { name: "Zainab Rashid", email: "zainab.r@example.ae", age: 22, gender: "Female" },
            patient_age: 22,
            patient_gender: "Female",
            doctor_name: "Dr. Alexander Wright",
            caseDoctor: "Dr. Alexander Wright",
            client_id: 1,
            client_name: "Wright Orthodontics",
            client: { id: 1, name: "Wright Orthodontics", parent_client: null },
            category: "Refinements",
            caseCategory: "Refinements",
            caseCategoryType: "Aligners",
            status: "in-manufacturing",
            isDraftCase: false,
            deadline: "2026-10-30",
            upper_aligners: 8,
            lower_aligners: 6,
            chief_complaint: "Minor rotational refinement of tooth 12 and 22",
            malocclusion: "Finishing refinement stage 1",
            attachments_count: 5,
            step_files_count: 1,
            created_at: "2026-10-10 14:00",
            updated_at: "2026-10-25 08:30"
        },
        {
            id: 4,
            case_id: "VELOUR-RET-0001",
            caseId: "VELOUR-RET-0001",
            patient_name: "Tariq Mansoor",
            patient: { name: "Tariq Mansoor", email: "tariq.m@example.com", age: 41, gender: "Male" },
            patient_age: 41,
            patient_gender: "Male",
            doctor_name: "Emirates Smile Clinic",
            caseDoctor: "Emirates Smile Clinic",
            client_id: 2,
            client_name: "Emirates Smile Design Dental Center",
            client: { id: 2, name: "Emirates Smile Design Dental Center", parent_client: null },
            category: "Retainers",
            caseCategory: "Retainers",
            caseCategoryType: "Retainers",
            status: "plan-step-files-ready",
            isDraftCase: false,
            deadline: "2026-11-02",
            upper_aligners: 3,
            lower_aligners: 3,
            chief_complaint: "Post-orthodontic clear retention sets",
            malocclusion: "Post-treatment retention",
            attachments_count: 4,
            step_files_count: 1,
            created_at: "2026-10-21 16:15",
            updated_at: "2026-10-25 17:00"
        },
        {
            id: 5,
            case_id: "VELOUR-0004",
            caseId: "VELOUR-0004",
            patient_name: "Elena Rostova",
            patient: { name: "Elena Rostova", email: "elena.r@example.com", age: 29, gender: "Female" },
            patient_age: 29,
            patient_gender: "Female",
            doctor_name: "Dr. Alexander Wright",
            caseDoctor: "Dr. Alexander Wright",
            client_id: 1,
            client_name: "Wright Orthodontics",
            client: { id: 1, name: "Wright Orthodontics", parent_client: null },
            category: "New Aligner Case",
            caseCategory: "New Case",
            caseCategoryType: "Aligners",
            status: "newly-created",
            isDraftCase: false,
            deadline: "2026-11-12",
            upper_aligners: 0,
            lower_aligners: 0,
            chief_complaint: "Diastema closure between central incisors",
            malocclusion: "Class I with 2.5mm upper midline diastema",
            attachments_count: 7,
            step_files_count: 0,
            created_at: "2026-10-25 18:00",
            updated_at: "2026-10-25 18:00"
        }
    ],"""

pos_cases = code.find('    cases: [')
pos_cases_end = code.find('    stepFiles: [')

if pos_cases != -1 and pos_cases_end != -1:
    code = code[:pos_cases] + cases_replacement + "\n" + code[pos_cases_end:]
    print("Replaced cases successfully!")

# Invoices replacement
invoices_replacement = """    invoices: [
        {
            id: 1,
            invoice_number: "INV-VELOUR-2026-001",
            client_id: 1,
            client_name: "Wright Orthodontics",
            client: { id: 1, name: "Wright Orthodontics" },
            billing_period_start: "2026-10-01",
            billing_period_end: "2026-10-31",
            document_status: "issued",
            document_status_label: "Issued",
            payment_status: "unpaid",
            payment_status_label: "Unpaid",
            amount: 4850.00,
            total: 4850.00,
            currency: "AED",
            status: "issued",
            due_date: "2026-11-15",
            created_at: "2026-10-15 09:30",
            issued_at: "2026-10-15 10:00",
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
            billing_period_start: "2026-09-01",
            billing_period_end: "2026-09-30",
            document_status: "issued",
            document_status_label: "Issued",
            payment_status: "paid",
            payment_status_label: "Paid",
            amount: 1250.00,
            total: 1250.00,
            currency: "AED",
            status: "paid",
            due_date: "2026-10-30",
            created_at: "2026-10-01 11:00",
            issued_at: "2026-10-01 11:30",
            items: [
                { description: "VelourCare Dual Arch Clear Retainers (3 Sets)", quantity: 1, unit_price: 1250.00, total: 1250.00 }
            ]
        }
    ],"""

pos_inv = code.find('    invoices: [')
pos_inv_end = code.find('    vendors: [')
if pos_inv != -1 and pos_inv_end != -1:
    code = code[:pos_inv] + invoices_replacement + "\n" + code[pos_inv_end:]
    print("Replaced invoices successfully!")

# Clients replacement
clients_replacement = """    clients: [
        {
            id: 1,
            name: "Dr. Alexander Wright Clinic",
            company_title: "Wright Orthodontics",
            profile_pic_url: "/assets/velourcare-square.png",
            user: { username: "doctor", name: "Dr. Alexander Wright", email: "doctor@velourcare.com" },
            email: "doctor@velourcare.com",
            phone: "+971 50 123 4567",
            status: { label: "Active", color: "success" },
            case_id_prefix: "WRIGHT",
            is_sub_clients_allowed: "YES",
            is_manufacturing_active: "YES",
            sub_clients_count: 2,
            cases_count: 48,
            balance: 14200,
            currency: "AED",
            created_at: "2026-02-10",
            updated_at: { human_readable: "2 hours ago", timestamp: "2026-10-25 14:30:00" },
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
            profile_pic_url: "/assets/velourcare-square.png",
            user: { username: "esmile", name: "Dr. Tariq Mansoor", email: "contact@emiratessmile.ae" },
            email: "contact@emiratessmile.ae",
            phone: "+971 2 644 8899",
            status: { label: "Active", color: "success" },
            case_id_prefix: "ESMILE",
            is_sub_clients_allowed: "YES",
            is_manufacturing_active: "YES",
            sub_clients_count: 1,
            cases_count: 36,
            balance: 9500,
            currency: "AED",
            created_at: "2026-03-01",
            updated_at: { human_readable: "1 day ago", timestamp: "2026-10-24 10:15:00" },
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

pos_cl = code.find('    clients: [')
pos_cl_end = code.find('    subClients: [')
if pos_cl != -1 and pos_cl_end != -1:
    code = code[:pos_cl] + clients_replacement + "\n" + code[pos_cl_end:]
    print("Replaced clients successfully!")

with open(r"D:\Antigravity\velourcare-ortho-cloud\server.js", "w", encoding="utf-8") as f:
    f.write(code)

print("Saved updated server.js successfully!")
