with open(r"D:\Antigravity\velourcare-ortho-cloud\public\assets\index-5EUXN9UG.js", "r", encoding="utf-8") as f:
    code = f.read()

pos = code.find('login(P.username')
if pos == -1:
    pos = code.find('login(e,t')
if pos == -1:
    pos = code.find('.login=')
if pos == -1:
    pos = code.find('async login(')

if pos != -1:
    print(code[pos-100:pos+500])
else:
    # search around Si
    pos = code.find('const Si=')
    if pos != -1:
        print("Around Si definition:")
        print(code[pos-100:pos+500])
    else:
        print("Searching for login API call...")
        matches = [m.start() for m in re.finditer(r'/auth/login', code)]
        for m in matches:
            print(code[m-50:m+150])
