with open(r"D:\Antigravity\velourcare-ortho-cloud\public\assets\index-DSUwJ5hT.js", "r", encoding="utf-8") as f:
    code = f.read()

pos = code.find('class Ks{')
if pos != -1:
    print("Store definition before Ks:")
    print(code[pos-1000:pos])
