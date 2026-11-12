import re

with open(r"D:\Antigravity\velourcare-ortho-cloud\public\assets\index-5EUXN9UG.js", "r", encoding="utf-8") as f:
    code = f.read()

pos = code.find('function ee(')
if pos == -1:
    pos = code.find('ee=()=>')
if pos == -1:
    pos = code.find('const ee=')

if pos != -1:
    print(code[pos-50:pos+800])
else:
    print("ee not found directly, searching for function that returns login:")
    matches = re.findall(r'function\s+([a-zA-Z0-9_$]+)\s*\([^)]*\)\s*\{[^}]*loginRoute:[^}]*\}', code)
    print("Matches:", matches)
