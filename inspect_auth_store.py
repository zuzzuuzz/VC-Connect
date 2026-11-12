file_path = r'D:\Antigravity\velourcare-ortho-cloud\public\assets\index-5EUXN9UG.js'

with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Search for auth store functions or exports
pos = text.find('authUserRole')
if pos != -1:
    print('FOUND authUserRole at', pos)
    print("--- CONTEXT ---")
    print(text[max(0, pos - 1000): min(len(text), pos + 1000)])
else:
    print('Not found')
