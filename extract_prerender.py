with open(r"D:\Antigravity\smilegenix-analysis\.firecrawl\homepage-raw.html", "r", encoding="utf-8") as f:
    html = f.read()

app_start = html.find('<div id="app"')
app_end = html.find('</body>')

if app_start != -1 and app_end != -1:
    app_html = html[app_start:app_end]
    print(f"App HTML length: {len(app_html)}")
    print(app_html[:500])
    
    # Let's save this to a file
    with open(r"D:\Antigravity\velourcare-ortho-cloud\prerendered_app.html", "w", encoding="utf-8") as out:
        out.write(app_html)
    print("Saved prerendered_app.html")
