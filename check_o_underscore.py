with open(r"D:\Antigravity\velourcare-ortho-cloud\public\assets\index-5EUXN9UG.js", "r", encoding="utf-8") as f:
    code = f.read()

pos = code.find('ci.directive("can",O_)')
pos2 = code.rfind('const O_=', 0, pos)
if pos2 == -1:
    pos2 = code.rfind('function O_', 0, pos)
if pos2 == -1:
    pos2 = code.rfind('let O_=', 0, pos)
if pos2 == -1:
    pos2 = code.rfind('O_=', 0, pos)

print("Found O_ at:", pos2)
print(code[pos2:pos2+400])
