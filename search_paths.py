with open(r'D:\Antigravity\velourcare-ortho-cloud\public\assets\index-5EUXN9UG.js', 'r', encoding='utf-8') as f:
    code = f.read()

import re
matches = list(re.finditer(r'path:\s*["\']([^"\']+)["\']', code))
print(f'Total paths found: {len(matches)}')
for m in matches[:45]:
    idx = m.start()
    print(m.group(1), '-->', repr(code[idx:idx+120]))
