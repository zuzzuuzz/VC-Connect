with open(r'D:\Antigravity\velourcare-ortho-cloud\public\assets\view-DS3MYUE6.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Let's search around offset 249000 which had W.ipr_chart_file_url
pos = 249000
print(code[pos-500:pos+2500])
