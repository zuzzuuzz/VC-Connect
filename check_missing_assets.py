import re
import os
import urllib.request

assets_dir = r"D:\Antigravity\velourcare-ortho-cloud\public\assets"

with open(os.path.join(assets_dir, "index-5EUXN9UG.js"), "r", encoding="utf-8") as f:
    code = f.read()

# Find all assets/* in index-5EUXN9UG.js
matches = set(re.findall(r'assets/([a-zA-Z0-9_\-\.]+\.[a-zA-Z0-9]+)', code))
print(f"Total asset references in index.js: {len(matches)}")

missing = []
for m in matches:
    dest = os.path.join(assets_dir, m)
    if not os.path.exists(dest):
        missing.append(m)

print(f"Missing assets from index.js: {len(missing)}")
for m in missing:
    print("  MISSING:", m)

# Let's also check index-G8lhJxba.css for fonts or images
css_path = os.path.join(assets_dir, "index-G8lhJxba.css")
with open(css_path, "r", encoding="utf-8") as f:
    css_code = f.read()

css_assets = set(re.findall(r'url\([\'"]?(?:/assets/|assets/|\./)?([a-zA-Z0-9_\-\.]+\.[a-zA-Z0-9]+)[\'"]?\)', css_code))
print(f"Total assets referenced in index.css: {len(css_assets)}")
missing_css = []
for m in css_assets:
    dest = os.path.join(assets_dir, m)
    if not os.path.exists(dest):
        missing_css.append(m)

print(f"Missing assets from index.css: {len(missing_css)}")
for m in missing_css:
    print("  MISSING FROM CSS:", m)
