with open(r"D:\Antigravity\velourcare-ortho-cloud\public\assets\index-5EUXN9UG.js", "r", encoding="utf-8") as f:
    code = f.read()

pos = code.find('return{currentUser:t,rememberMe:n,isAuthenticated:i')
if pos != -1:
    print("Er store definition:")
    print(code[pos-1200:pos+200])
