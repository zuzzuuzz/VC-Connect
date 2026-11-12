with open(r"D:\Antigravity\velourcare-ortho-cloud\public\index.html", "r", encoding="utf-8") as f:
    content = f.read()

target = '<div id="app"></div>'
replacement = """<div id="file-protocol-warning" style="display:none;background:#dc3545;color:#fff;padding:16px;text-align:center;font-family:system-ui,sans-serif;font-size:15px;font-weight:bold;z-index:9999999;position:fixed;top:0;left:0;right:0;box-shadow:0 4px 12px rgba(0,0,0,0.3);">
        ⚠️ Browser security blocks JavaScript modules when opening HTML files directly from a folder (file:///).<br>
        Please open <a href="http://localhost:8000" style="color:#ffc107;text-decoration:underline;">http://localhost:8000</a> in your web browser, or double-click <code>start-velourcare-cloud.bat</code>!
    </div>
    <script>
      if (window.location.protocol === 'file:') {
          document.getElementById('file-protocol-warning').style.display = 'block';
      }
    </script>
    <div id="app"></div>"""

if target in content:
    content = content.replace(target, replacement, 1)
    with open(r"D:\Antigravity\velourcare-ortho-cloud\public\index.html", "w", encoding="utf-8") as f:
        f.write(content)
    print("Added file protocol warning successfully!")
else:
    print("Target not found!")
