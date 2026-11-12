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

    // Pre-seed localStorage before page scripts execute
    await page.evaluateOnNewDocument((user) => {
        if (!localStorage.getItem("auth.user")) {
            localStorage.setItem("auth.user", JSON.stringify(user));
            localStorage.setItem("auth.role_slug", user.role_slug);
            localStorage.setItem("auth.permissions", JSON.stringify(user.permissions));
            localStorage.setItem("auth.rememberMe", "true");
        }
    }, adminUser);

    console.log("Navigating to http://localhost:8000/ ...");
    await page.goto('http://localhost:8000/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 3000));

    console.log("Final URL:", page.url());
    console.log("Final Title:", await page.title());

    const isDashboard = page.url().includes('/dashboard');
    console.log("Directly loaded dashboard:", isDashboard);

    await page.screenshot({ path: 'D:\\Antigravity\\velourcare-ortho-cloud\\seeded_dashboard.png' });
    console.log("Saved seeded_dashboard.png");

    // Now test clicking Cases in sidebar
    console.log("Clicking Cases in sidebar...");
    await page.evaluate(() => {
        const link = Array.from(document.querySelectorAll('a')).find(a => a.href && a.href.includes('/cases'));
        if (link) link.click();
    });
    await new Promise(r => setTimeout(r, 3000));

    console.log("URL after clicking Cases:", page.url());
    console.log("Title after clicking Cases:", await page.title());
    
    const rows = await page.evaluate(() => document.querySelectorAll('table tbody tr').length);
    console.log("Cases table row count:", rows);

    await page.screenshot({ path: 'D:\\Antigravity\\velourcare-ortho-cloud\\seeded_cases.png' });
    console.log("Saved seeded_cases.png");

    await browser.close();
})();
