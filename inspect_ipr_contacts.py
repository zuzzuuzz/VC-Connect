with open(r'D:\Antigravity\velourcare-ortho-cloud\public\assets\PlanDocumentEditor-3l74hQz7.js', 'r', encoding='utf-8') as f:
    code = f.read()

import re
matches = list(re.finditer(r'ipr_contacts', code))
for i, m in enumerate(matches):
    print(f'--- Match {i+1} at {m.start()} ---')
    print(code[max(0, m.start()-100):min(len(code), m.end()+300)])
