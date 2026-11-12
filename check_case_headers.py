import re

with open(r"D:\Antigravity\velourcare-ortho-cloud\public\assets\index-BvBa5IVZ.js", "r", encoding="utf-8") as f:
    code = f.read()

# Search for the column labels: "Case ID", "Case Status", "Deadline", "Type & Category", "Case Doctor", "Case Patient", "Clinic Name"
pos = code.find("Case Doctor")
if pos != -1:
    print("Found 'Case Doctor' at:", pos)
    print(code[pos-200:pos+1500])
else:
    print("'Case Doctor' not found directly, searching...")
    # search for th or label
    matches = re.findall(r'label:\s*["\'][^"\']+["\']', code)
    print("Labels:", matches[:20])
