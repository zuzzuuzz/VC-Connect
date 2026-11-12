with open(r"D:\Antigravity\velourcare-ortho-cloud\public\assets\main-C2PpKz4j.js", "r", encoding="utf-8") as f:
    code = f.read()

pos = code.find('t-cases')
if pos != -1:
    print("Found t-cases in main-C2PpKz4j.js:")
    print(code[pos-400:pos+800])
