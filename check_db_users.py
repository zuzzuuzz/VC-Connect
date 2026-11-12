import re

with open(r"D:\Antigravity\velourcare-ortho-cloud\server.js", "r", encoding="utf-8") as f:
    code = f.read()

# Let's inspect db.users definition
pos = code.find('db = {')
print(code[pos:pos+1500])
