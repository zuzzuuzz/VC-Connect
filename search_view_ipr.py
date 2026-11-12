with open(r'D:\Antigravity\velourcare-ortho-cloud\public\assets\view-DS3MYUE6.js', 'r', encoding='utf-8') as f:
    code = f.read()

import re
matches = list(re.finditer(r'ipr', code, re.IGNORECASE))
print(f'Total ipr matches in view-DS3MYUE6.js: {len(matches)}')
for i, m in enumerate(matches):
    start = max(0, m.start() - 100)
    end = min(len(code), m.end() + 200)
    print(f'--- Match {i+1} at {m.start()} ---')
    print(code[start:end])
