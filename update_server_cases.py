import re

file_path = r'D:\Antigravity\velourcare-ortho-cloud\server.js'

with open(file_path, 'r', encoding='utf-8') as f:
    code = f.read()

old_block = """app.post(['/api/cases/store-in-pipeline', '/cases/store-in-pipeline'], (req, res) => {
    const newCase = {
        id: db.cases.length + 1,
        case_id: "VELOUR-" + String(db.cases.length + 1).padStart(4, '0'),
        patient_name: req.body.patient_name || "New Patient",
        patient_age: req.body.patient_age || 25,
        patient_gender: req.body.patient_gender || "Female",
        doctor_name: "Dr. Alexander Wright",
        client_id: 1,
        client_name: "Wright Orthodontics",
        category: req.body.category || "New Aligner Case",
        status: "newly-created",
        upper_aligners: 0,
        lower_aligners: 0,
        attachments_count: 0,
        step_files_count: 0,
        created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
        updated_at: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };
    db.cases.unshift(newCase);
    res.json({ success: true, message: "Case registered successfully", data: newCase });
});"""

new_block = """app.post(['/api/cases/store-in-pipeline', '/cases/store-in-pipeline'], (req, res) => {
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
        patient: {
            name: patientName,
            email: patientEmail,
            age: patientAge,
            gender: patientGender,
            residencyType: req.body.residency_type || "Resident",
            phone: req.body.phone || "+971 50 123 4567"
        },
        doctor_name: "Dr. Alexander Wright",
        caseDoctor: "Dr. Alexander Wright",
        client_id: req.body.client_id ? parseInt(req.body.client_id) : 1,
        client_name: "Wright Orthodontics Clinic",
        client: { id: req.body.client_id ? parseInt(req.body.client_id) : 1, name: "Wright Orthodontics Clinic", parent_client: null },
        category: req.body.category || "New Case",
        caseCategory: req.body.category || "New Case",
        caseCategoryType: "Aligners",
        status: { value: "newly-created", label: "Newly Created", color: "primary" },
        isDraftCase: false,
        deadline: "2026-11-15",
        upper_aligners: 0,
        lower_aligners: 0,
        chief_complaint: req.body.chief_complaint || "Anterior alignment request",
        malocclusion: req.body.malocclusion || "Class I crowding",
        jawArchType: "Both (Maxillary & Mandibular)",
        jawArchCorrection: "Standard Alignment",
        jawToothFormat: "FDI (World Dental Federation)",
        needsIpr: "Yes (IPR Protocol prescribed)",
        needsAttachments: "Yes (Optimized Composite Attachments)",
        needsExtraction: "No",
        attachments_count: 0,
        step_files_count: 0,
        created_at: { human_readable: "Just now", iso_date: new Date().toISOString(), timestamp: Math.floor(Date.now() / 1000) },
        updated_at: { human_readable: "Just now", iso_date: new Date().toISOString(), timestamp: Math.floor(Date.now() / 1000) }
    };
    db.cases.unshift(newCase);
    res.json({ success: true, message: "Case registered successfully", data: newCase });
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
});"""

old_block_crlf = old_block.replace('\n', '\r\n')
if old_block_crlf in code:
    code = code.replace(old_block_crlf, new_block.replace('\n', '\r\n'))
    print("Replaced with CRLF!")
elif old_block in code:
    code = code.replace(old_block, new_block)
    print("Replaced with LF!")
else:
    print("Old block not found!")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(code)
print("Finished writing server.js")
