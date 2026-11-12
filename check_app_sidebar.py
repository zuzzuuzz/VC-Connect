with open(r"D:\Antigravity\velourcare-ortho-cloud\public\assets\main-C2PpKz4j.js", "r", encoding="utf-8") as f:
    code = f.read()

pos = code.find('name:"AppSidebar"')
if pos != -1:
    print(code[pos:pos+1500])
