with open(r"D:\Antigravity\velourcare-ortho-cloud\public\assets\index-5EUXN9UG.js", "r", encoding="utf-8") as f:
    code = f.read()

pos = code.find('async function m(){try{await Si.logout()')
if pos != -1:
    pos2 = code.rfind('class ', 0, pos)
    print("Class before Si.logout:")
    print(code[pos2:pos2+1000])
