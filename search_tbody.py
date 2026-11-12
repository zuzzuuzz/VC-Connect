with open(r'D:\Antigravity\velourcare-ortho-cloud\public\assets\index-BvBa5IVZ.js', 'r', encoding='utf-8') as f:
    code = f.read()

import re
matches = [m.start() for m in re.finditer(r'tbody', code)]
print('tbody matches:', matches)
for m in matches:
    print('--- TBODY SNIPPET ---')
    print(code[m-50:m+1500])
