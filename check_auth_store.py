import re

with open(r"D:\Antigravity\velourcare-ortho-cloud\public\assets\index-5EUXN9UG.js", "r", encoding="utf-8") as f:
    code = f.read()

matches = re.finditer(r'isAuthenticated', code)
for m in list(matches)[:10]:
    start = max(0, m.start() - 100)
    end = min(len(code), m.end() + 150)
    print("--- isAuthenticated snippet ---")
    print(code[start:end])
