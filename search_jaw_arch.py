with open(r'D:\Antigravity\velourcare-ortho-cloud\public\assets\view-DS3MYUE6.js', 'r', encoding='utf-8') as f:
    code = f.read()

import re
matches = list(re.finditer(r'jawArchType', code))
print('jawArchType matches:', len(matches))
for m in matches:
    print(code[max(0, m.start()-100):min(len(code), m.end()+150)])
    print('-'*50)
