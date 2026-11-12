# VelourCare Ortho Cloud Platform
**Enterprise Clear Aligner Case Management & Orthodontic B2B SaaS Platform**

---

## 🌟 Overview
VelourCare Ortho Cloud is an enterprise medical clear aligner portal connecting Orthodontic Clinics, Branch Practices, CAD Treatment Planners, and 3D Manufacturing Laboratories.

- **Rebranded For:** **VelourCare Ortho**
- **Logo Assets:** Official VelourCare high-resolution emblem & square favicon
- **Live Local Server:** `http://localhost:8000`
- **Location:** `D:\Antigravity\velourcare-ortho-cloud`

---

## 🚀 Quick Start
To launch the platform:
```bash
# Double click or run in terminal:
D:\Antigravity\velourcare-ortho-cloud\start-velourcare-cloud.bat

# Or run via Node:
cd D:\Antigravity\velourcare-ortho-cloud
node server.js
```
Open **`http://localhost:8000`** in any browser.

---

## 🔑 Available Profiles & Demo Credentials

| Role | Username | Password | Profile Description |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin` | `password` (or any) | Complete platform governance, users, roles, Stripe Platform, full access |
| **Doctor / Clinic** | `doctor` | `password` | Dr. Alexander Wright, patient cases, treatment plan approvals, billing |
| **CAD Planner** | `planner` | `password` | Digital orthodontic setup, IPR charting, WaveATP & Smile Inspector access |
| **Manufacturing Lab** | `lab` | `password` | Aligner 3D model printing, thermoforming, step files & batch delivery |

---

## 📐 Key Capabilities Replicated

1. **Orthodontic Workflow Pipeline:**
   - 4-stage progression: *Treatment Plan*, *Doctor Review*, *Step Files*, and *Completed / Manufacturing*.
   - Dynamic animated counter widgets with hover lift effects.
2. **Interactive IPR & Treatment Plan Document Editor:**
   - Tooth contact mapping (e.g. 11-21, 21-22), reduction values (0.2mm, 0.3mm), step triggers.
   - Client-side PDF generation and multipart document transmission.
3. **Medical Aligner Case ID Rules:**
   - Prefix enforcement (e.g., `VELOUR-0001`).
   - Reserved prefix validation protecting `REF` (Refinements) and `RET` (Retainers).
4. **Step Files Staging:**
   - Direct multipart uploads for STL 3D printable files (up to 2GB) and WeTransfer link integration.
5. **Invoices & Stripe Connect:**
   - Automated billable preview, invoice issuance, Stripe hosted checkout, and bank wire proof tracking.
6. **Multi-Tenancy & Sub-Clients:**
   - Clinic-specific branch management with sub-client feature toggles (`step_files`, `invoices`, `chat`).
7. **Real-time WebSockets & Pusher Integration:**
   - `chat-presence` channel support for instant clinical case consultation.
8. **Multi-Language & RTL Engine:**
   - 8 languages: English, French, Spanish, German, Italian, Russian, Chinese, Arabic (RTL).
