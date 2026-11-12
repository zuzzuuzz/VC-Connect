with open(r"D:\Antigravity\velourcare-ortho-cloud\public\assets\index-5EUXN9UG.js", "r", encoding="utf-8") as f:
    code = f.read()

pos = code.find('Session expired or invalid')
if pos != -1:
    print(code[pos-200:pos+200])
