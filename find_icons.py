file_path = r'D:\Antigravity\velourcare-ortho-cloud\public\assets\PlanDocumentEditor-3l74hQz7.js'

with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('KF=[{title:"Attachment"')

# Find where W1, J1, X1, lf, Z1, q1, A0, z1, $1, Y1, V1 are defined
vars_to_find = ['W1=', 'J1=', 'X1=', 'lf=', 'Z1=', 'q1=', 'A0=', 'z1=', '$1=', 'Y1=', 'V1=', 'e0=', 'DF=', 'MF=', 'RF=']
for v in vars_to_find:
    idx = text.rfind(v, 0, pos)
    print(f"{v} -> found at {idx}: {text[idx:idx+150]}")
