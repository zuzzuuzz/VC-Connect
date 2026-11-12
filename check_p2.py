import re

with open(r"D:\Antigravity\velourcare-ortho-cloud\public\assets\index-5EUXN9UG.js", "r", encoding="utf-8") as f:
    code = f.read()

pos = code.find('function P2(')
if pos == -1:
    pos = code.find('P2=()=>')
if pos == -1:
    pos = code.find('const P2=')

if pos != -1:
    print(code[pos-50:pos+300])
else:
    # search around localStorage.getItem("auth.user")
    pos = code.find('localStorage.getItem("auth.user")')
    print("Around getItem('auth.user'):")
    print(code[pos-200:pos+200])
