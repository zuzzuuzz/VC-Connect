import re

with open(r"D:\Antigravity\velourcare-ortho-cloud\public\assets\index-DSUwJ5hT.js", "r", encoding="utf-8") as f:
    code = f.read()

# Search for statistics API or response handling
pos = code.find('dashboard/statistics')
if pos != -1:
    print("Found dashboard/statistics in index-DSUwJ5hT.js:")
    print(code[pos-200:pos+1500])
