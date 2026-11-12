const fs = require("fs");
const file = "D:/Antigravity/velourcare-ortho-cloud/server.js";
let content = fs.readFileSync(file, "utf8");

const startMarker = `// CASE FILTER OPTIONS & CREATION DROPDOWNS (MUST BE DEFINED BEFORE /api/cases/:id)
app.get(['/api/cases/filter-options', '/cases/filter-options'], (req, res) => {`;

const endMarker = `app.get(['/api/cases/verify-case-id', '/cases/verify-case-id'], (req, res) => {`;

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  const replacement = `// CASE FILTER OPTIONS & CREATION DROPDOWNS (MUST BE DEFINED BEFORE /api/cases/:id)
app.get(['/api/cases/filter-options', '/cases/filter-options'], (req, res) => {
    let customConfig = {};
    const configPath = path.join(__dirname, 'data', 'portal_config.json');
    if (fs.existsSync(configPath)) {
        try {
            customConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        } catch(e) {
            console.error('Error reading portal_config.json:', e);
        }
    }

    const payload = {
        clients: (customConfig.clients || db.clients).map(c => ({ 
            id: c.id, 
            name: c.name,
            case_id_prefix: c.case_id_prefix || "VELOUR",
            is_express_delivery_active: c.is_express_delivery_active || "YES",
            is_alphanumeric_case_id_active: c.is_alphanumeric_case_id_active || "YES",
            sub_clients: c.sub_clients || [
                { id: 1, name: "Downtown Dubai Clinic Branch" },
                { id: 2, name: "Jumeirah Specialist Centre" }
            ],
            addresses: c.addresses || []
        })),
        residencyTypes: customConfig.residencyTypes || {
            "local": "Local Resident",
            "overseas": "Overseas",
            "travelling": "Travelling / Tourist"
        },
        categories: customConfig.caseCategories || {
            "Aligners": "Aligners",
            "Retainers": "Retainers",
            "Refinements": "Refinements"
        },
        categoryTypes: customConfig.caseCategoryTypes || {
            "Dentist": "Dentist",
            "Orthodontist": "Orthodontist"
        },
        deliveryTimes: customConfig.deliveryTimes || {
            "8 hrs": "8 hrs (Express)",
            "24 hrs": "24 hrs (Standard)",
            "48 hrs": "48 hrs (Economy)"
        },
        jawArchTypes: customConfig.jawArchTypes || {
            "Both Arch": "Both Arch",
            "Upper only": "Upper only",
            "Lower only": "Lower only"
        },
        jawArchCorrections: customConfig.jawArchCorrections || {
            "(3-3)": "(3-3)",
            "(5-5)": "(5-5)",
            "Full arch correction": "Full arch correction"
        },
        jawToothFormats: customConfig.jawToothFormats || {
            "FDI Notation": "FDI Notation",
            "Universal Notation": "Universal Notation",
            "Parlmer Notation": "Palmer Notation"
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

    res.json({
        data: payload,
        ...payload
    });
});

`;
  content = content.substring(0, startIdx) + replacement + content.substring(endIdx);
  fs.writeFileSync(file, content, "utf8");
  console.log("Successfully added dynamic portal_config.json loader into server.js!");
} else {
  console.error("Markers not found:", startIdx, endIdx);
}
