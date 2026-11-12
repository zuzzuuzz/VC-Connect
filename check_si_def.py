with open(r"D:\Antigravity\velourcare-ortho-cloud\public\assets\index-5EUXN9UG.js", "r", encoding="utf-8") as f:
    code = f.read()

pos = code.find('async function g(P,k=null){const q=(await Si.login(')
if pos != -1:
    print(code[pos-1000:pos])
