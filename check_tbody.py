with open(r"D:\Antigravity\velourcare-ortho-cloud\public\assets\index-BvBa5IVZ.js", "r", encoding="utf-8") as f:
    code = f.read()

pos = code.find('tbody')
if pos != -1:
    print(code[pos:pos+2500])
else:
    pos2 = code.find('table')
    print("Table pos:", pos2)
    print(code[pos2:pos2+2000])
