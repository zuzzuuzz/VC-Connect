with open(r'D:\Antigravity\velourcare-ortho-cloud\public\assets\index-BvBa5IVZ.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Let's search for function At( or Be( or const At= or const Be=
import re
for fn in ['At=', 'Be=', 'At(', 'Be(', 'Q=']:
    idx = 0
    while True:
        pos = code.find(fn, idx)
        if pos == -1: break
        print(f'Match {fn} at {pos}:')
        print(code[max(0, pos-50):min(len(code), pos+200)])
        print('-'*40)
        idx = pos + len(fn)
        if idx > 35000: break
