with open(r"D:\Antigravity\velourcare-ortho-cloud\prerendered_app.html", "r", encoding="utf-8") as f:
    app_html = f.read()

# Replace logos and branding
app_html = app_html.replace("https://cloud.smilegenix.ae/assets/login-page-logo-BDn48l5g.jpeg", "/assets/velourcare-logo.png")
app_html = app_html.replace("https://cloud.smilegenix.ae", "")
app_html = app_html.replace("Smile Genix", "VelourCare Ortho")
app_html = app_html.replace("SmileGenix", "VelourCare Ortho")
app_html = app_html.replace("https://cloud.smilegenix.ae/login", "/login")
app_html = app_html.replace("https://cloud.smilegenix.ae/forgot-password", "/forgot-password")

with open(r"D:\Antigravity\velourcare-ortho-cloud\prerendered_app_velourcare.html", "w", encoding="utf-8") as out:
    out.write(app_html)

print("Rebranded prerendered app HTML created!")
