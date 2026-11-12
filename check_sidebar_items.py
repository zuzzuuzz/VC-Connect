import os
import glob
import re

assets_dir = r"D:\Antigravity\velourcare-ortho-cloud\public\assets"

# Search for menu items like "Cases", "Invoices", "Clients", "Vendors"
for f in ["main-C2PpKz4j.js", "index-5EUXN9UG.js"]:
    path = os.path.join(assets_dir, f)
    with open(path, "r", encoding="utf-8", errors="ignore") as file:
        content = file.read()
    
    matches = re.findall(r'id:\s*["\']([a-zA-Z0-9_\-]+)["\'],\s*label:\s*["\']([^"\']+)["\']', content)
    print(f"File {f} menu matches: {len(matches)}")
    for m in matches[:15]:
        print("  ", m)

    # Or search for t("menu.") or t("t-") or t("sidebar.")
    i18n_menu = re.findall(r'["\'](t-[a-zA-Z0-9_\-]+|menu\.[a-zA-Z0-9_\-]+)["\']', content)
    print(f"File {f} i18n menu matches: {len(set(i18n_menu))}")
    for m in list(set(i18n_menu))[:15]:
        print("  i18n:", m)
