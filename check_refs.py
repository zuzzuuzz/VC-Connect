with open(r'D:\Antigravity\velourcare-ortho-cloud\public\assets\index-BvBa5IVZ.js', 'r', encoding='utf-8') as f:
    code = f.read()

import re
matches = [m.start() for m in re.finditer(r'([a-zA-Z0-9_]+)\s*=\s*(?:ref|F)\([^)]*\)', code)]
for m in matches[:15]:
    print(code[max(0, m-20):min(len(code), m+60)])
