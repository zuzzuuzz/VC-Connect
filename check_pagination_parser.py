with open(r'D:\Antigravity\velourcare-ortho-cloud\public\assets\index-BvBa5IVZ.js', 'r', encoding='utf-8') as f:
    code = f.read()

import re
matches = [m.start() for m in re.finditer(r'current_page|last_page|per_page', code)]
print('Pagination matches in index-BvBa5IVZ.js:', matches)
for m in matches:
    print(code[max(0, m-50):min(len(code), m+150)])
    print('-'*40)
