with open(r'D:\Antigravity\velourcare-ortho-cloud\public\assets\view-DS3MYUE6.js', 'r', encoding='utf-8') as f:
    code = f.read()

import re
matches = list(re.finditer(r'([a-zA-Z0-9_$]+)\s*=\s*(?:computed|O)\(\s*\(\)\s*=>\s*\{[^}]*jawArchType', code))
print('Matches for computed jawArchType:', len(matches))
for m in matches:
    print(code[max(0, m.start()-50):min(len(code), m.end()+300)])
