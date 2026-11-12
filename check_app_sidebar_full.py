with open(r"D:\Antigravity\velourcare-ortho-cloud\public\assets\main-C2PpKz4j.js", "r", encoding="utf-8") as f:
    code = f.read()

pos = code.find('AppSidebar')
print(code[pos-100:pos+2500])
