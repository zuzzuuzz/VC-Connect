with open(r"D:\Antigravity\velourcare-ortho-cloud\public\assets\index-5EUXN9UG.js", "r", encoding="utf-8") as f:
    code = f.read()

pos = code.find('Ea=ws("permissions"')
if pos != -1:
    print(code[pos:pos+1500])
