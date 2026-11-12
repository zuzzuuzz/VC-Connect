const fs = require("fs");
const file = "D:/Antigravity/velourcare-ortho-cloud/server.js";
let content = fs.readFileSync(file, "utf8");

// Remove the old filter-options at the bottom if present
const oldBlock = `app.get(['/api/cases/filter-options', '/cases/filter-options'], (req, res) => {`;
const oldIdx = content.indexOf(oldBlock);
if (oldIdx !== -1) {
  const endMarker = `app.get(['/api/cases/verify-parent-case', '/cases/verify-parent-case'], (req, res) => {
    res.json({ valid: true, parent_case_id: "VELOUR-0001" });
});`;
  const endIdx = content.indexOf(endMarker, oldIdx);
  if (endIdx !== -1) {
    content = content.substring(0, oldIdx) + content.substring(endIdx + endMarker.length);
    console.log("Removed old filter-options block");
  }
}

// Now insert new block right before app.get(['/api/cases/:id', '/cases/:id']
const target = `app.get(['/api/cases/:id', '/cases/:id'], (req, res) => {`;
const insertPos = content.indexOf(target);
if (insertPos !== -1) {
  const newBlock = `// CASE FILTER OPTIONS & CREATION DROPDOWNS (MUST BE DEFINED BEFORE /api/cases/:id)
app.get(['/api/cases/filter-options', '/cases/filter-options'], (req, res) => {
    const payload = {
        clients: db.clients.map(c => ({ 
            id: c.id, 
            name: c.name,
            case_id_prefix: c.case_id_prefix || "VELOUR",
            is_express_delivery_active: c.is_express_delivery_active || "YES",
            is_alphanumeric_case_id_active: c.is_alphanumeric_case_id_active || "YES",
            sub_clients: [
                { id: 1, name: "Downtown Dubai Clinic Branch" },
                { id: 2, name: "Jumeirah Specialist Centre" }
            ]
        })),
        residencyTypes: {
            "local": "Local Resident",
            "overseas": "Overseas",
            "travelling": "Travelling / Tourist"
        },
        categories: {
            "Aligners": "Aligners",
            "Retainers": "Retainers",
            "Refinements": "Refinements"
        },
        categoryTypes: {
            "Dentist": "Dentist",
            "Orthodontist": "Orthodontist"
        },
        deliveryTimes: {
            "8 hrs": "8 hrs (Express)",
            "24 hrs": "24 hrs (Standard)",
            "48 hrs": "48 hrs (Economy)"
        },
        jawArchTypes: {
            "Both Arch": "Both Arch",
            "Upper only": "Upper only",
            "Lower only": "Lower only"
        },
        jawArchCorrections: {
            "(3-3)": "(3-3)",
            "(5-5)": "(5-5)",
            "Full arch correction": "Full arch correction"
        },
        jawToothFormats: {
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

app.get(['/api/cases/verify-case-id', '/cases/verify-case-id'], (req, res) => {
    res.json({ valid: true, message: "Case ID available" });
});

app.get(['/api/cases/verify-parent-case', '/cases/verify-parent-case'], (req, res) => {
    res.json({ valid: true, parent_case_id: "VELOUR-0001" });
});

`;
  content = content.substring(0, insertPos) + newBlock + content.substring(insertPos);
  fs.writeFileSync(file, content, "utf8");
  console.log("Successfully inserted filter-options block before /api/cases/:id!");
} else {
  console.error("Target not found!");
}
