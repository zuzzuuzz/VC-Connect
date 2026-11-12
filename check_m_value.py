with open(r'D:\Antigravity\velourcare-ortho-cloud\public\assets\index-BvBa5IVZ.js', 'r', encoding='utf-8') as f:
    code = f.read()

import re
matches = [m.start() for m in re.finditer(r'M\.value\s*=', code)]
print('M.value matches:', matches)
for m in matches:
    print(code[max(0, m-50):min(len(code), m+150)])
    print('-'*40)
