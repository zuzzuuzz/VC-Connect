with open(r"D:\Antigravity\velourcare-ortho-cloud\public\assets\index-5EUXN9UG.js", "r", encoding="utf-8") as f:
    code = f.read()

pos = code.find('.mount(')
if pos != -1:
    print("Mount found:", code[pos-50:pos+150])
else:
    print("Mount not found directly")

pos2 = code.find('createApp(')
if pos2 != -1:
    print("createApp found:", code[pos2-50:pos2+150])
