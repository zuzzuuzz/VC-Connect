import re

server_path = r'D:\Antigravity\velourcare-ortho-cloud\server.js'

with open(server_path, 'r', encoding='utf-8') as f:
    code = f.read()

# Replace client in case by id
target_client = """            client: {
                id: found.client_id || 1,
                name: found.client_name || "Wright Orthodontics Clinic",
                treatment_plan_protocols: "Standard VelourCare Digital Protocol with IPR Verification",
                post_processing_protocols: "Precision Laser Trimming at Gingival Margin + 0.5mm Scallop",
                is_express_delivery_active: "NO"
            },"""

replacement_client = """            client: {
                id: found.client_id || 1,
                name: found.client_name || "Wright Orthodontics Clinic",
                treatment_protocol: "<p><strong>VelourCare Certified Protocol</strong>: Standard 10-day aligner staging with pre-insertion IPR verification leaf gauge check.</p>",
                treatment_plan_protocols: "Standard VelourCare Digital Protocol with IPR Verification",
                post_processing_protocol: "<p><strong>VelourCare Precision Finish</strong>: Automated laser edge scallop at gingival margin + 0.5mm clearance. Dual-layer thermoformed polyurethane.</p>",
                post_processing_protocols: "Precision Laser Trimming at Gingival Margin + 0.5mm Scallop",
                is_express_delivery_active: "NO"
            },"""

code = code.replace(target_client, replacement_client)

with open(server_path, 'w', encoding='utf-8') as f:
    f.write(code)

print("Protocols updated in server.js!")
