with open(r"D:\Antigravity\velourcare-ortho-cloud\public\assets\index-5EUXN9UG.js", "r", encoding="utf-8") as f:
    code = f.read()

pos = code.find('JSON.parse(localStorage.getItem("auth.user")')
if pos != -1:
    print(code[pos-100:pos+1000])
