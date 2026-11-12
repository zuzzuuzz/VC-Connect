import re

# Check Invoices
with open(r"D:\Antigravity\velourcare-ortho-cloud\public\assets\index-yD_6F8KC.js", "r", encoding="utf-8") as f:
    code = f.read()

pos = code.find('tbody')
if pos != -1:
    print("Invoices tbody snippet:")
    print(code[pos:pos+1500])

# Check Clients
with open(r"D:\Antigravity\velourcare-ortho-cloud\public\assets\index-CtDkGLsb.js", "r", encoding="utf-8") as f:
    code_c = f.read()

pos_c = code_c.find('tbody')
if pos_c != -1:
    print("\nClients tbody snippet:")
    print(code_c[pos_c:pos_c+1500])
