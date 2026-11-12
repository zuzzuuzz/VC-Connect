with open(r"D:\Antigravity\velourcare-ortho-cloud\public\assets\index-5EUXN9UG.js", "r", encoding="utf-8") as f:
    code = f.read()

pos = code.find('const O_={mounted(e,t){Ym(e,t)}')
pos2 = code.rfind('function Ym', 0, pos)
if pos2 == -1:
    pos2 = code.rfind('const Ym=', 0, pos)

print(code[pos2:pos2+400])
