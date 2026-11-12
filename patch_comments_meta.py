import re

server_path = r'D:\Antigravity\velourcare-ortho-cloud\server.js'

with open(server_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_comments = """app.get(['/api/cases/:id/comments', '/cases/:id/comments'], (req, res) => {
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
});"""

new_comments = """app.get(['/api/cases/:id/comments', '/cases/:id/comments'], (req, res) => {
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
        meta: {
            current_page: 1,
            last_page: 1,
            per_page: 15,
            total: 1
        },
        links: {
            first: "/api/cases/" + req.params.id + "/comments?page=1",
            last: "/api/cases/" + req.params.id + "/comments?page=1",
            prev: null,
            next: null
        }
    });
});"""

content = content.replace(old_comments, new_comments)

with open(server_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Comments endpoint updated with meta object!")
