const puppeteer = require('puppeteer-core');

(async () => {
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    const adminUser = {
        id: 1,
        name: "VelourCare Super Administrator",
        username: "admin",
        email: "admin@velourcare.com",
        phone: "+971 4 800 8356",
        role_slug: "super-admin",
        is_super_admin: true,
        status: "active",
        profile_pic_url: "/assets/velourcare-square.png",
        permissions: [
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
        ],
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
    };

    await page.evaluateOnNewDocument((user) => {
        localStorage.setItem("auth.user", JSON.stringify(user));
        localStorage.setItem("auth.role_slug", user.role_slug);
        localStorage.setItem("auth.permissions", JSON.stringify(user.permissions));
        localStorage.setItem("auth.rememberMe", "true");
    }, adminUser);

    await page.goto('http://localhost:8000/dashboard', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));

    // Extract all menu items in the sidebar
    const menuItems = await page.evaluate(() => {
        const sidebar = document.querySelector('.navbar-menu, .app-menu, [data-sidebar]') || document.body;
        const links = sidebar.querySelectorAll('a');
        return Array.from(links).map(a => ({
            text: a.innerText.trim().replace(/\n/g, ' '),
            href: a.getAttribute('href'),
            classes: a.className
        }));
    });

    console.log("Found menu items in sidebar:", menuItems.length);
    menuItems.forEach((m, idx) => {
        console.log(`[${idx}] "${m.text}" -> ${m.href}`);
    });

    await browser.close();
})();
