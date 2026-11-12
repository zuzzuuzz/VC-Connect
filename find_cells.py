import re

with open(r'D:\Antigravity\velourcare-ortho-cloud\public\assets\index-BvBa5IVZ.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Let's search for "cell(" or 'cell(' or "cell_" or 'cell_'
for pat in [r'cell\([a-zA-Z_0-9]+\)', r'cell_[a-zA-Z_0-9]+', r'key\s*:\s*["\'][a-zA-Z_0-9]+["\']', r'sortable']:
    matches = list(re.finditer(pat, code))
    print(f'Pattern {pat}: {len(matches)} matches')
    for m in matches[:6]:
        idx = m.start()
        print('  Snippet:', repr(code[max(0, idx-20):min(len(code), idx+80)]))
