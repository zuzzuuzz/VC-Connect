with open(r"D:\Antigravity\velourcare-ortho-cloud\prerendered_app_velourcare.html", "r", encoding="utf-8") as f:
    prerendered = f.read()

index_html = f"""<!DOCTYPE html>
<html lang="en" dir="ltr" data-layout="vertical" data-theme-colors="default" data-theme="default" data-topbar="light" data-bs-theme="light" data-preloader="disable" data-layout-width="fluid" data-layout-style="default" data-layout-position="fixed" data-sidebar="dark" data-sidebar-size="lg" data-sidebar-visibility="show" data-sidebar-image="none">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
    <link rel="manifest" href="/site.webmanifest">
    <title>Login | VelourCare Ortho</title>
    
    <style rel="stylesheet" type="text/css">
        @charset "utf-8";
        @keyframes vue-feather--spin {{ 
            0% {{ transform: rotate(0deg); }}
            100% {{ transform: rotate(1turn); }}
        }}
        .vue-feather {{ display: inline-block; overflow: hidden; }}
        .vue-feather--spin {{ animation: 2s linear 0s infinite normal none running vue-feather--spin; }}
        .vue-feather--pulse {{ animation: 2s steps(8) 0s infinite normal none running vue-feather--spin; }}
        .vue-feather--slow {{ animation-duration: 3s; }}
        .vue-feather--fast {{ animation-duration: 1s; }}
        .vue-feather__content {{ display: block; height: inherit; width: inherit; }}
        
        .brand-image-frame {{
            display: inline-flex;
            align-items: center;
            justify-content: center;
            max-width: 100%;
        }}
        .brand-image-frame--auth img {{
            max-height: 120px;
            max-width: 260px;
            object-fit: contain;
        }}
        .brand-image-frame--full img {{
            max-height: 40px;
            max-width: 180px;
            object-fit: contain;
        }}
        .brand-image-frame--compact img {{
            max-height: 32px;
            max-width: 32px;
            object-fit: contain;
        }}
        .demo-pills {{
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
            margin-bottom: 16px;
            padding: 10px;
            background: #f3f6f9;
            border-radius: 6px;
            border: 1px dashed #cbd5e1;
        }}
        .demo-pill {{
            cursor: pointer;
            padding: 4px 10px;
            font-size: 11px;
            font-weight: 600;
            border-radius: 4px;
            background: #fff;
            border: 1px solid #d0d7de;
            color: #495057;
            transition: all 0.2s ease;
        }}
        .demo-pill:hover {{
            background: #0ab39c;
            color: #fff;
            border-color: #0ab39c;
        }}
    </style>

    <script>
      (function () {{
        document.title = 'VelourCare Ortho';
      }})();
    </script>
    <script type="module" crossorigin="" src="/assets/index-5EUXN9UG.js"></script>
    <link rel="modulepreload" crossorigin="" href="/assets/vendor-Cqm5GSvB.js">
    <link rel="modulepreload" crossorigin="" href="/assets/bootstrap-BxubwAgm.js">
    <link rel="stylesheet" crossorigin="" href="/assets/index-G8lhJxba.css">
    <link rel="modulepreload" as="script" crossorigin="" href="/assets/login-BOBOEDUS.js">
    <link rel="modulepreload" as="script" crossorigin="" href="/assets/index-BC8wbgZp.js">
    <link rel="modulepreload" as="script" crossorigin="" href="/assets/BrandImage-DXYtpoY6.js">
    <link rel="modulepreload" as="script" crossorigin="" href="/assets/_plugin-vue_export-helper-DlAUqK2U.js">
    <link rel="stylesheet" crossorigin="" href="/assets/BrandImage-DazurleX.css">
    <link rel="modulepreload" as="script" crossorigin="" href="/assets/LanguageSwitcher-BXWnAtQA.js">
    <link rel="modulepreload" as="script" crossorigin="" href="/assets/autoplay-l0sNRNKZ.js">
    <link rel="stylesheet" crossorigin="" href="/assets/pagination-DxHKOkZ5.css">
</head>
<body data-aos-easing="ease-out-back" data-aos-duration="1000" data-aos-delay="0">
    {prerendered}

    <!-- Direct Fallback & Quick-Fill Helper Script -->
    <script>
    document.addEventListener("DOMContentLoaded", function() {{
        const usernameInput = document.getElementById("username");
        const passwordInput = document.getElementById("password-input");
        const form = document.querySelector("form");
        const eyeBtn = document.getElementById("password-addon");

        if (eyeBtn && passwordInput) {{
            eyeBtn.addEventListener("click", function() {{
                passwordInput.type = passwordInput.type === "password" ? "text" : "password";
            }});
        }}

        // Insert Demo Role Selectors above form
        if (form && !document.getElementById("demo-roles-container")) {{
            const container = document.createElement("div");
            container.id = "demo-roles-container";
            container.className = "demo-pills";
            container.innerHTML = `
                <div style="width:100%;font-size:11px;font-weight:700;color:#495057;margin-bottom:4px;">
                    ⚡ Quick Demo Profile Autofill:
                </div>
                <button type="button" class="demo-pill" data-user="admin">Super Admin</button>
                <button type="button" class="demo-pill" data-user="doctor">Doctor (Clinic)</button>
                <button type="button" class="demo-pill" data-user="planner">CAD Planner</button>
                <button type="button" class="demo-pill" data-user="lab">Fabrication Lab</button>
            `;
            form.parentNode.insertBefore(container, form);

            container.querySelectorAll(".demo-pill").forEach(btn => {{
                btn.addEventListener("click", function() {{
                    if (usernameInput) usernameInput.value = this.getAttribute("data-user");
                    if (passwordInput) passwordInput.value = "password";
                    if (usernameInput) usernameInput.dispatchEvent(new Event("input", {{ bubbles: true }}));
                    if (passwordInput) passwordInput.dispatchEvent(new Event("input", {{ bubbles: true }}));
                }});
            }});
        }}

        // Handle direct submit if Vue isn't hydrated yet
        if (form) {{
            form.addEventListener("submit", async function(e) {{
                // If Vue already intercepts, let it run; otherwise direct fetch login
                if (window.__VUE_APP__) return;
                e.preventDefault();
                const u = usernameInput ? usernameInput.value : "admin";
                const p = passwordInput ? passwordInput.value : "password";
                try {{
                    const res = await fetch("/api/auth/login", {{
                        method: "POST",
                        headers: {{ "Content-Type": "application/json" }},
                        body: JSON.stringify({{ username: u, password: p }})
                    }});
                    const data = await res.json();
                    if (data.success) {{
                        window.location.href = "/dashboard";
                    }}
                }} catch (err) {{
                    window.location.href = "/dashboard";
                }}
            }});
        }}
    }});
    </script>
</body>
</html>
"""

with open(r"D:\Antigravity\velourcare-ortho-cloud\public\index.html", "w", encoding="utf-8") as out:
    out.write(index_html)

print("Updated public/index.html successfully!")
