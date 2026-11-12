import re

server_path = r'D:\Antigravity\velourcare-ortho-cloud\server.js'

with open(server_path, 'r', encoding='utf-8') as f:
    content = f.read()

comments_code = """
// Case Comments & Presence
app.get(['/api/cases/:id/comments', '/cases/:id/comments'], (req, res) => {
    res.json({
        data: [
            {
                id: 1,
                case_id: req.params.id,
                user: {
                    id: 1,
                    name: "VelourCare Super Administrator",
                    profile_pic_url: "/assets/velourcare-square.png"
                },
                content: "Treatment plan uploaded. Initial anterior alignment staging completed.",
                attachments: [],
                created_at: "2026-10-24 14:20"
            }
        ],
        current_page: 1,
        last_page: 1,
        total: 1
    });
});

app.post(['/api/cases/:id/comments', '/cases/:id/comments'], (req, res) => {
    const comment = {
        id: Date.now(),
        case_id: req.params.id,
        user: db.currentUser,
        content: req.body.content || "Comment submitted.",
        attachments: [],
        created_at: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    res.status(201).json({ data: comment, message: "Comment added successfully" });
});

app.get(['/api/cases/:id/comments/presence', '/cases/:id/comments/presence'], (req, res) => {
    res.json({ users: [db.currentUser] });
});

app.post(['/api/cases/:id/comments/presence', '/cases/:id/comments/presence'], (req, res) => {
    res.json({ success: true, message: "Joined presence" });
});

app.post(['/api/cases/:id/comments/presence/leave', '/cases/:id/comments/presence/leave'], (req, res) => {
    res.json({ success: true, message: "Left presence" });
});
"""

# Insert before Section 5
if "Case Comments & Presence" not in content:
    target = "// ==========================================\n// 5. TREATMENT PLANS & IPR DOCUMENT"
    content = content.replace(target, comments_code + "\n" + target)

with open(server_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Comments & presence endpoints successfully added!")
