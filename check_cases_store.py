with open(r"D:\Antigravity\velourcare-ortho-cloud\public\assets\index-BvBa5IVZ.js", "r", encoding="utf-8") as f:
    code = f.read()

pos = code.find('BaseService')
if pos == -1:
    pos = code.find('/cases')
if pos != -1:
    print("Cases index code:")
    print(code[pos-200:pos+800])
