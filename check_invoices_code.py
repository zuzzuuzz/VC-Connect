with open(r'D:\Antigravity\velourcare-ortho-cloud\public\assets\index-yD_6F8KC.js', 'r', encoding='utf-8') as f:
    code = f.read()

pos = code.find('tbody')
if pos != -1:
    print('--- INVOICES TBODY ---')
    print(code[pos:pos+2500])
else:
    print('tbody not found in invoices')
