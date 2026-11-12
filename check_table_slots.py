with open(r"D:\Antigravity\velourcare-ortho-cloud\public\assets\index-BvBa5IVZ.js", "r", encoding="utf-8") as f:
    code = f.read()

pos = code.find('cases.table')
if pos == -1:
    pos = code.find('deadline')
if pos == -1:
    pos = code.find('case_id')
if pos == -1:
    pos = code.find('patient_name')

print("Found at pos:", pos)
if pos != -1:
    print(code[pos-200:pos+1500])
