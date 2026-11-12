with open(r"D:\Antigravity\velourcare-ortho-cloud\public\assets\index-5EUXN9UG.js", "r", encoding="utf-8") as f:
    code = f.read()

pos = code.find('validateAuth:')
if pos != -1:
    print(code[pos-200:pos+200])
else:
    pos = code.find('validateAuth')
    print("validateAuth at pos:", pos)
    print(code[pos-200:pos+200])
