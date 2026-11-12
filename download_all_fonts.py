import re
import urllib.request
import os

with open(r"D:\Antigravity\velourcare-ortho-cloud\public\assets\index-G8lhJxba.css", "r", encoding="utf-8") as f:
    css = f.read()

# Find all font filenames in css
fonts = set(re.findall(r'assets/([a-zA-Z0-9_\-\.]+\.(?:woff2|woff|ttf|eot|svg|png|jpg|jpeg))', css))
print(f"Total files referenced in css: {len(fonts)}")

BASE_URL = "https://cloud.smilegenix.ae/assets/"
dest_dir = r"D:\Antigravity\velourcare-ortho-cloud\public\assets"

missing = []
for font in fonts:
    path = os.path.join(dest_dir, font)
    if not os.path.exists(path) or os.path.getsize(path) < 100:
        missing.append(font)

print(f"Total missing: {len(missing)}")
for m in missing:
    print("  Downloading missing asset:", m)
    try:
        url = BASE_URL + m
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = resp.read()
            with open(os.path.join(dest_dir, m), "wb") as out:
                out.write(data)
        print(f"  --> Saved {m} ({len(data)} bytes)")
    except Exception as e:
        print(f"  --> Failed to download {m}: {e}")
