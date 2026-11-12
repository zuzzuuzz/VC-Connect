index_html = """<!DOCTYPE html>
<html lang="en" dir="ltr" data-layout="vertical" data-theme-colors="default" data-theme="default" data-topbar="light" data-bs-theme="light" data-preloader="disable" data-layout-width="fluid" data-layout-style="default" data-layout-position="fixed" data-sidebar="dark" data-sidebar-size="lg" data-sidebar-visibility="show" data-sidebar-image="none">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
    <link rel="manifest" href="/site.webmanifest">
    <title>VelourCare Ortho</title>
    
    <style rel="stylesheet" type="text/css">
        @charset "utf-8";
        @keyframes vue-feather--spin { 
            0% { transform: rotate(0deg); }
            100% { transform: rotate(1turn); }
        }
        .vue-feather { display: inline-block; overflow: hidden; }
        .vue-feather--spin { animation: 2s linear 0s infinite normal none running vue-feather--spin; }
        .vue-feather--pulse { animation: 2s steps(8) 0s infinite normal none running vue-feather--spin; }
        .vue-feather--slow { animation-duration: 3s; }
        .vue-feather--fast { animation-duration: 1s; }
        .vue-feather__content { display: block; height: inherit; width: inherit; }
        
        .brand-image-frame {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            max-width: 100%;
        }
        .brand-image-frame--auth img {
            max-height: 120px;
            max-width: 260px;
            object-fit: contain;
        }
        .brand-image-frame--full img {
            max-height: 40px;
            max-width: 180px;
            object-fit: contain;
        }
        .brand-image-frame--compact img {
            max-height: 32px;
            max-width: 32px;
            object-fit: contain;
        }
        
        /* Floating Role Quick Switcher for Easy Demonstration */
        .role-switcher-banner {
            position: fixed;
            bottom: 12px;
            right: 12px;
            z-index: 99999;
            background: rgba(33, 37, 41, 0.95);
            backdrop-filter: blur(8px);
            padding: 8px 14px;
            border-radius: 30px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            gap: 8px;
            border: 1px solid rgba(255,255,255,0.15);
        }
        .role-switcher-label {
            color: #fff;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .role-btn {
            background: rgba(255,255,255,0.15);
            color: #e9ecef;
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 16px;
            padding: 3px 10px;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .role-btn:hover, .role-btn.active {
            background: #0ab39c;
            color: #fff;
            border-color: #0ab39c;
        }
    </style>

    <script>
      (function () {
        document.title = 'VelourCare Ortho';

        const allPermissions = [
            "view_users", "manage_users_permissions",
            "view_clients", "edit_clients",
            "view_sub_clients", "edit_sub_clients",
            "view_vendors", "edit_vendors", "allocate_vendor_clients",
            "view_cases", "edit_treatment_plans",
            "view_invoices",
            "view_roles", "manage_roles_permissions",
            "view_bank_accounts",
            "manage_stripe_platform", "manage_stripe_connect",
            "view_api_credentials"
        ];

        window.demoProfiles = {
            admin: {
                id: 1,
                name: "VelourCare Super Administrator",
                username: "admin",
                email: "admin@velourcare.com",
                phone: "+971 4 800 8356",
                role_slug: "super-admin",
                is_super_admin: true,
                status: "active",
                profile_pic_url: "/assets/velourcare-square.png",
                permissions: allPermissions,
                integrations: { waveatp: true, smile_inspector: true },
                assigned_role_modal: {
                    id: 1,
                    name: "VelourCare Orthodontics HQ",
                    company_name: "VelourCare Ortho",
                    login_uri: "velourcare",
                    login_image_url: "/assets/velourcare-logo.png",
                    navigation_logo_url: "/assets/velourcare-logo.png",
                    logo_url: "/assets/velourcare-square.png"
                },
                client: {
                    id: 1,
                    name: "VelourCare Orthodontics",
                    case_id_prefix: "VELOUR",
                    is_manufacturing_active: "YES"
                }
            },
            doctor: {
                id: 2,
                name: "Dr. Alexander Wright, DDS, MS",
                username: "doctor",
                email: "doctor@velourcare.com",
                phone: "+971 50 123 4567",
                role_slug: "client",
                is_super_admin: false,
                status: "active",
                profile_pic_url: "/assets/velourcare-square.png",
                permissions: allPermissions,
                integrations: { waveatp: true, smile_inspector: true },
                assigned_role_modal: {
                    id: 2,
                    name: "Wright Orthodontic Clinic",
                    company_name: "VelourCare Ortho",
                    login_uri: "wright-ortho",
                    login_image_url: "/assets/velourcare-logo.png",
                    navigation_logo_url: "/assets/velourcare-logo.png",
                    logo_url: "/assets/velourcare-square.png",
                    sub_client_feature_access: { step_files: true, invoices: true, chat: true }
                },
                client: {
                    id: 2,
                    name: "Wright Orthodontic Clinic",
                    case_id_prefix: "WRIGHT",
                    is_manufacturing_active: "YES"
                }
            },
            planner: {
                id: 3,
                name: "Sarah Miller (CAD Planner)",
                username: "planner",
                email: "planner@velourcare.com",
                phone: "+971 4 800 8358",
                role_slug: "planner",
                is_super_admin: false,
                status: "active",
                profile_pic_url: "/assets/velourcare-square.png",
                permissions: allPermissions,
                integrations: { waveatp: true, smile_inspector: true },
                assigned_role_modal: {
                    id: 3,
                    name: "VelourCare Digital Planning Studio",
                    company_name: "VelourCare Ortho",
                    navigation_logo_url: "/assets/velourcare-logo.png"
                }
            },
            lab: {
                id: 4,
                name: "VelourCare Fabrication Lab",
                username: "lab",
                email: "lab@velourcare.com",
                phone: "+971 4 800 8359",
                role_slug: "vendor",
                is_super_admin: false,
                status: "active",
                profile_pic_url: "/assets/velourcare-square.png",
                permissions: allPermissions,
                integrations: { waveatp: true, smile_inspector: true },
                assigned_role_modal: {
                    id: 4,
                    name: "VelourCare 3D Production Lab",
                    company_name: "VelourCare Ortho",
                    navigation_logo_url: "/assets/velourcare-logo.png"
                }
            }
        };

        // If not authenticated yet, automatically authenticate as Super Admin for instant access
        if (!localStorage.getItem("auth.user")) {
            const def = window.demoProfiles.admin;
            localStorage.setItem("auth.user", JSON.stringify(def));
            localStorage.setItem("auth.role_slug", def.role_slug);
            localStorage.setItem("auth.permissions", JSON.stringify(def.permissions));
            localStorage.setItem("auth.rememberMe", "true");
        }
      })();
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
    <div id="app"></div>

    <!-- Live Profile Switcher Floating Bar -->
    <div class="role-switcher-banner">
        <span class="role-switcher-label">Switch Profile:</span>
        <button type="button" class="role-btn" onclick="switchRole('admin')">Super Admin</button>
        <button type="button" class="role-btn" onclick="switchRole('doctor')">Doctor (Clinic)</button>
        <button type="button" class="role-btn" onclick="switchRole('planner')">CAD Planner</button>
        <button type="button" class="role-btn" onclick="switchRole('lab')">Lab (Vendor)</button>
        <button type="button" class="role-btn" style="background:#dc3545;" onclick="logoutUser()">Logout</button>
    </div>

    <script>
    function switchRole(roleKey) {
        const profile = window.demoProfiles[roleKey];
        if (!profile) return;
        localStorage.setItem("auth.user", JSON.stringify(profile));
        localStorage.setItem("auth.role_slug", profile.role_slug);
        localStorage.setItem("auth.permissions", JSON.stringify(profile.permissions));
        localStorage.setItem("auth.rememberMe", "true");
        window.location.href = "/dashboard";
    }

    function logoutUser() {
        localStorage.removeItem("auth.user");
        localStorage.removeItem("auth.role_slug");
        localStorage.removeItem("auth.permissions");
        localStorage.removeItem("auth.rememberMe");
        window.location.href = "/login";
    }
    </script>
</body>
</html>
"""

with open(r"D:\Antigravity\velourcare-ortho-cloud\public\index.html", "w", encoding="utf-8") as out:
    out.write(index_html)

print("Updated index.html with instant auth pre-seed and live role switcher!")
