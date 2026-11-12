with open(r'D:\Antigravity\velourcare-ortho-cloud\public\assets\index-5EUXN9UG.js', 'r', encoding='utf-8') as f:
    code = f.read()

import re
matches = list(re.finditer(r'path:\s*["\']([^"\']+)["\'],.*?component:\s*\(\)\s*=>\s*import\(["\']\./([^"\']+)["\']\)', code, re.DOTALL))
print(f'Total routes found: {len(matches)}')
for m in matches:
    print(f"{m.group(1):<35} -> {m.group(2)}")
