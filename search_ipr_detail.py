with open(r'D:\Antigravity\velourcare-ortho-cloud\public\assets\view-DS3MYUE6.js', 'r', encoding='utf-8') as f:
    code_view = f.read()

with open(r'D:\Antigravity\velourcare-ortho-cloud\public\assets\PlanDocumentEditor-3l74hQz7.js', 'r', encoding='utf-8') as f:
    code_doc = f.read()

import re
print('In view-DS3MYUE6.js:')
for term in ['ipr_contacts', 'iprContacts', 'ipr_chart', 'iprChart', 'IPR', 'ipr_table', 'plan_document']:
    matches = list(re.finditer(term, code_view, re.IGNORECASE))
    print(f'  {term}: {len(matches)} matches')

print('\nIn PlanDocumentEditor-3l74hQz7.js:')
for term in ['ipr_contacts', 'iprContacts', 'ipr_chart', 'iprChart', 'IPR', 'ipr_table', 'plan_document']:
    matches = list(re.finditer(term, code_doc, re.IGNORECASE))
    print(f'  {term}: {len(matches)} matches')
