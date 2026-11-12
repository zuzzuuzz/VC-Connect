import re

server_path = r'D:\Antigravity\velourcare-ortho-cloud\server.js'

with open(server_path, 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update treatmentPlans in db
new_treatment_plans = """    treatmentPlans: [
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
            simulation_link: "https://cloud.smilegenix.ae/simulation/velour-0001",
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
    ],"""

code = re.sub(r'treatmentPlans:\s*\[[\s\S]*?\](?=,\s*\n\s*invoices:)', new_treatment_plans.strip()[:-1], code)

# 2. Update GET /api/cases/:id to return all clinical properties
old_case_by_id = """app.get(['/api/cases/:id', '/cases/:id'], (req, res) => {
    const caseId = parseInt(req.params.id);
    const found = db.cases.find(c => c.id === caseId) || db.cases[0];
    res.json({
        data: {
            ...found,
            patient: {
                name: found.patient_name,
                age: found.patient_age,
                gender: found.patient_gender,
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
            treatment_plans: db.treatmentPlans.filter(p => p.case_id === found.id),
            step_files: db.stepFiles.filter(s => s.case_id === found.id),
            shipment_batches: [
                { id: 1, batch_number: "BATCH-01", aligners_range: "01 to 10", status: "delivered", tracking_number: "DHL-98421092" },
                { id: 2, batch_number: "BATCH-02", aligners_range: "11 to 22", status: "in-production", tracking_number: null }
            ]
        }
    });
});"""

new_case_by_id = """app.get(['/api/cases/:id', '/cases/:id'], (req, res) => {
    const caseId = parseInt(req.params.id);
    const found = db.cases.find(c => c.id === caseId) || db.cases[0];
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
                treatment_plan_protocols: "Standard VelourCare Digital Protocol with IPR Verification",
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
});"""

code = code.replace(old_case_by_id, new_case_by_id)

# 3. Add GET & PUT document endpoints
doc_endpoints = """
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
"""

# Replace old post document endpoint
old_post_doc = """app.post(['/api/cases/:caseId/treatment-plans/:planId/document', '/cases/:caseId/treatment-plans/:planId/document'], upload.single('ipr_chart_pdf'), (req, res) => {
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
            ipr_chart_file_url: req.file ? `/uploads/${req.file.filename}` : "/uploads/plan-document.pdf"
        }
    });
});"""

new_post_doc = """app.post(['/api/cases/:caseId/treatment-plans/:planId/document', '/cases/:caseId/treatment-plans/:planId/document'], upload.single('ipr_chart_pdf'), (req, res) => {
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
});"""

code = code.replace(old_post_doc, doc_endpoints + "\n" + new_post_doc)

with open(server_path, 'w', encoding='utf-8') as f:
    f.write(code)

print("server.js updated with complete IPR & treatment plans support!")
