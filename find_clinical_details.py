with open(r'D:\Antigravity\velourcare-ortho-cloud\public\assets\view-DS3MYUE6.js', 'r', encoding='utf-8') as f:
    code = f.read()

pos = 358637
print('--- CODE AROUND CLINICAL DETAILS TABLE ---')
print(code[pos-1500:pos+1000])
