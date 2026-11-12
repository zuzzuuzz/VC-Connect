import os
import glob
import re

assets_dir = r"D:\Antigravity\velourcare-ortho-cloud\public\assets"

def patch_file(filepath, replacements):
    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()
    
    modified = False
    for target, replacement in replacements:
        if target in content:
            content = content.replace(target, replacement)
            modified = True
            print(f"Patched '{target}' -> '{replacement}' in {os.path.basename(filepath)}")
            
    if modified:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)

# 1. Patch BrandImage-DXYtpoY6.js
brand_image_file = os.path.join(assets_dir, "BrandImage-DXYtpoY6.js")
patch_file(brand_image_file, [
    ('"Smile Genix"', '"VelourCare Ortho"'),
    ('companyName:"Smile Genix"', 'companyName:"VelourCare Ortho"'),
    ('authImage:V', 'authImage:"/assets/velourcare-logo.png"'),
    ('fullLogo:P', 'fullLogo:"/assets/velourcare-logo.png"'),
    ('compactLogo:U', 'compactLogo:"/assets/velourcare-square.png"')
])

# 2. Patch index-5EUXN9UG.js
index_main = os.path.join(assets_dir, "index-5EUXN9UG.js")
patch_file(index_main, [
    ('baseURL:"https://api.cloud.smilegenix.ae/api"', 'baseURL:"/api"'),
    ('Tt.get("https://api.cloud.smilegenix.ae/sanctum/csrf-cookie"', 'Tt.get("/sanctum/csrf-cookie"'),
    ('https://api.cloud.smilegenix.ae', ''),
    ('"Smile Genix"', '"VelourCare Ortho"'),
    ('"SmileGenix"', '"VelourCare Ortho"')
])

# 3. Patch view-DS3MYUE6.js
view_file = os.path.join(assets_dir, "view-DS3MYUE6.js")
patch_file(view_file, [
    ('https://api.cloud.smilegenix.ae/api', '/api'),
    ('https://api.cloud.smilegenix.ae', ''),
    ('api.cloud.smilegenix.ae', 'localhost:8000')
])

# 4. Patch PlanDocumentEditor-3l74hQz7.js
plan_file = os.path.join(assets_dir, "PlanDocumentEditor-3l74hQz7.js")
patch_file(plan_file, [
    ('https://api.cloud.smilegenix.ae/api', '/api'),
    ('https://api.cloud.smilegenix.ae', '')
])

# 5. Patch show-yMCSiZo7.js and index-yD_6F8KC.js (Invoices)
for f in ["show-yMCSiZo7.js", "index-yD_6F8KC.js", "index-DSUwJ5hT.js", "StripeConnectPage-zTGgxMMl.js"]:
    patch_file(os.path.join(assets_dir, f), [
        ('SmileGenix', 'VelourCare Ortho'),
        ('Smile Genix', 'VelourCare Ortho')
    ])

print("Patching completed successfully!")
