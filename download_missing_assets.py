import os
import re
import urllib.request
import ssl

assets_dir = r'D:\Antigravity\velourcare-ortho-cloud\public\assets'
base_url = 'https://cloud.smilegenix.ae'

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# 1. Collect all asset references from all js and html files
referenced_assets = set()
asset_pattern = re.compile(r'["\'](/assets/[^"\'>\s]+\.(?:png|svg|jpg|jpeg|webp|ico|gif|woff2?|ttf|eot))["\']', re.IGNORECASE)

for root, dirs, files in os.walk(r'D:\Antigravity\velourcare-ortho-cloud\public'):
    for f in files:
        if f.endswith(('.js', '.html', '.css')):
            fp = os.path.join(root, f)
            try:
                with open(fp, 'r', encoding='utf-8', errors='ignore') as fh:
                    content = fh.read()
                    matches = asset_pattern.findall(content)
                    for m in matches:
                        referenced_assets.add(m)
            except Exception as e:
                print(f"Error reading {fp}: {e}")

print(f"Found {len(referenced_assets)} unique asset references.")

# 2. Check which ones are missing
missing = []
for ref in sorted(referenced_assets):
    # ref is like /assets/missingtooth-Cil-4AIP.png
    rel = ref.lstrip('/')
    local_path = os.path.join(r'D:\Antigravity\velourcare-ortho-cloud\public', rel.replace('/', os.sep))
    if not os.path.exists(local_path):
        missing.append((ref, local_path))

print(f"Missing {len(missing)} assets on disk:")
for ref, lp in missing:
    print(f"  - {ref}")

# 3. Download missing assets
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

downloaded = 0
failed = 0

for ref, local_path in missing:
    url = base_url + ref
    os.makedirs(os.path.dirname(local_path), exist_ok=True)
    print(f"Downloading: {url} -> {local_path} ...")
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
            data = resp.read()
            with open(local_path, 'wb') as out_f:
                out_f.write(data)
            print(f"  SUCCESS ({len(data)} bytes)")
            downloaded += 1
    except Exception as e:
        print(f"  FAILED: {e}")
        failed += 1

print(f"\nFinished: Downloaded {downloaded}, Failed {failed}")
