with open(r"D:\Antigravity\velourcare-ortho-cloud\public\assets\main-C2PpKz4j.js", "r", encoding="utf-8") as f:
    code = f.read()

pos = code.find('name:"AppSidebar"')
if pos != -1:
    pos2 = code.find('return(', pos)
    print("Return at pos:", pos2)
    print(code[pos2:pos2+2000])
