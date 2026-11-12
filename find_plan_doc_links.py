with open(r'D:\Antigravity\velourcare-ortho-cloud\public\assets\view-DS3MYUE6.js', 'r', encoding='utf-8') as f:
    code = f.read()

import re
matches = list(re.finditer(r'/treatment-plans/[^"\']+/document', code))
print('Direct document route matches:', len(matches))
for m in matches:
    print(code[max(0, m.start()-50):min(len(code), m.end()+100)])

matches2 = list(re.finditer(r'treatmentPlans|treatment-plans', code))
print('treatment-plans matches:', len(matches2))
for m in matches2[:10]:
    print(code[max(0, m.start()-40):min(len(code), m.end()+80)])
