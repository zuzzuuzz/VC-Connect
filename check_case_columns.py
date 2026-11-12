import re

with open(r"D:\Antigravity\velourcare-ortho-cloud\public\assets\index-BvBa5IVZ.js", "r", encoding="utf-8") as f:
    code = f.read()

# Search for row. or item. or case. in the template
matches = re.findall(r'\.([a-zA-Z0-9_]+)', code)
# find property accesses on case or item
props = set()
for m in re.finditer(r'(?:item|case|row)\.([a-zA-Z0-9_]+)', code):
    props.add(m.group(1))

print("Case row properties in index-BvBa5IVZ.js:")
print(sorted(list(props)))

# Also find table columns definition: { key: "...", label: "..." } or fields: [ ... ]
fields = re.findall(r'\{[^{}]*?key\s*:\s*["\']([^"\']+)["\'][^{}]*?\}', code)
print("\nTable field keys:")
print(fields)
