with open(r'D:\Antigravity\velourcare-ortho-cloud\public\assets\index-BzzmPkw0.js', 'r', encoding='utf-8') as f:
    code = f.read()

pos = code.find('tbody')
if pos != -1:
    print('--- SUB CLIENTS TBODY ---')
    print(code[pos:pos+2000])
else:
    print('tbody not found in sub-clients')
