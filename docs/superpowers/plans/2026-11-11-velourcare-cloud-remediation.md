# VelourCare Ortho Cloud — Master Remediation & Hardening Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the VelourCare Ortho Cloud platform from an in-memory prototype with security, functional, and performance flaws into a robust, secure, HIPAA/OWASP-compliant, production-grade orthodontic portal.

**Architecture:** Systematic remediation across the Node.js Express backend and Vue 3 frontend: implementing robust token-based authentication and role-based access control, fixing REST 404 contracts, securing file uploads and PHI endpoints, aligning frontend button-modal pairings, eliminating the main-thread DOM polling loop, enabling HTTP compression and proper caching, and completing clinical workflow state machines.

**Tech Stack:** Node.js (Express 5.3), Multer, Vue 3, Bootstrap 5 / Velzon, Three.js, Puppeteer (verification).

**Spec:** [`AUDIT_REPORT_VELOURCARE_ORTHO_CLOUD.md`](file:///C:/Users/Umais%20Laptop/.gemini/antigravity-cli/brain/8a6e7946-6e89-4201-b868-1e26ac65bd82/AUDIT_REPORT_VELOURCARE_ORTHO_CLOUD.md)

---

## Global Constraints
- Do not break existing Vue 3 compiled bundle expectations or API route contracts.
- Maintain backward compatibility for all 22+ frontend views and modal schemas.
- Preserve all existing mock data structures while enforcing strict validation and authorization.
- Zero downtime during testing: local verification on port 8000.

## Review Focus
1. An unauthenticated user attempts to delete a case, role, or bank account via `DELETE` -> must return 401/403.
2. A client requests a non-existent case or invoice ID -> must return 404 with standard error JSON, never fall back to record 0.
3. An attacker uploads an `.html` or `.exe` file via step-files or comments -> must reject with 400 Bad Request.
4. Clicking "Change Status" on the Case Details overview -> must open the status modal, not the "Assign Planner" modal.
5. Doctor approves a treatment plan -> status must transition to `plan-approved` and an itemized invoice must be generated in `db.invoices`.

---

## Task Decomposition

### Task 1: Security Hardening, Authentication, and Session Isolation (P0)

**Files:**
- Modify: `server.js:1-120`, `server.js:890-950`
- Test: `tests/security_auth_test.js`

**Interfaces:**
- Consumes: `req.headers.authorization`, `req.cookies['XSRF-TOKEN']`
- Produces: `authenticate(req, res, next)` middleware, `requireAuth` middleware, `requirePermission(...perms)` middleware.

- [ ] **Step 1: Write failing security automated test (`tests/security_auth_test.js`)**
  Verify unauthenticated access to `/api/cases`, `/api/users`, `DELETE /api/bank-accounts/1`, and forged tokens are rejected with 401/403.
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement security middleware in `server.js`**
  - Add request-scoped user extraction (`req.user`) instead of the shared global `db.currentUser`.
  - Enforce authentication on all `/api/*` endpoints except public auth (`/api/auth/login`, `/api/auth/verify`, `/sanctum/csrf-cookie`).
  - Eliminate the Super Admin fallback on unknown username in `POST /api/auth/login`. Verify user credentials and generate a verifiable session/token.
  - Add security headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Content-Security-Policy`, and restricted CORS.
- [ ] **Step 4: Run test to verify it passes**

---

### Task 2: REST 404 Contract Integrity & Query Processing (P0)

**Files:**
- Modify: `server.js:1450-1650`, `server.js:2080-2150`, `server.js:2550-2950`
- Modify: `data/portal_config.json:30-45`
- Test: `tests/rest_contract_test.js`

**Interfaces:**
- Consumes: `req.params.id`, `req.query.page`, `req.query.per_page`, `req.query.searchQuery`
- Produces: Paginated and filtered JSON responses, or standard 404 `{ error: "Resource not found" }`.

- [ ] **Step 1: Write failing test for 404 contracts and query pagination**
  Verify `GET /api/cases/999999` returns 404, `GET /api/invoices/999999` returns 404, and `GET /api/cases?page=1&per_page=2` returns only 2 records.
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement 404 handlers and query slicing in `server.js`**
  - Replace all `db.cases.find(...) || db.cases[0]` with proper check: if not found, return `res.status(404).json({ message: "Not found" })`.
  - Apply pagination logic: slice data based on `page` and `per_page`, and calculate total count.
  - Implement text search filtering on `searchQuery` for patient name and case ID.
  - Fix typo: `"Parlmer Notation"` -> `"Palmer Notation"` in `data/portal_config.json` and `server.js`.
- [ ] **Step 4: Run test to verify it passes**

---

### Task 3: File Upload Hardening & PHI Access Protection (P0 / P1)

**Files:**
- Modify: `server.js:15-35`, `server.js:1870-1920`, `server.js:3015-3030`
- Test: `tests/file_upload_security_test.js`

**Interfaces:**
- Consumes: Multipart upload stream, `req.file`
- Produces: Validated upload handler, authenticated file download route.

- [ ] **Step 1: Write failing test for malicious file uploads and public PHI scanning**
  Verify `.html` or `.exe` upload fails with 400, and unauthenticated file requests to sensitive scans in `/uploads/` require auth.
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement Multer file filter and protected file delivery in `server.js`**
  - Configure Multer `fileFilter` to only accept `.stl`, `.ply`, `.obj`, `.pdf`, `.png`, `.jpg`, `.jpeg`, `.zip`, `.o3c`.
  - Set `limits: { fileSize: 50 * 1024 * 1024 }` (50MB max).
  - Sanitize filenames to strip directory traversals and non-alphanumeric special characters.
  - Restrict `/uploads/` static route so patient charts and medical ZIPs require active authentication or signed tokens.
- [ ] **Step 4: Run test to verify it passes**

---

### Task 4: Clinical Workflow State Mutations & Invoicing Integration (P1)

**Files:**
- Modify: `server.js:2150-2170`, `server.js:1890-1910`
- Test: `tests/clinical_workflow_test.js`

**Interfaces:**
- Consumes: `POST /api/cases/:id/treatment-plans/:planId/approve`, `POST /api/cases/:id/shipment-batches/start-next`
- Produces: Mutated case status (`plan-approved` / `in-manufacturing`), new itemized invoice in `db.invoices`.

- [ ] **Step 1: Write failing test for plan approval and invoice generation**
  Verify case status shifts from `review-treatment-plan` to `plan-approved`, invoice count increments, and dispatch saves tracking data.
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement workflow logic in `server.js`**
  - Update `POST .../approve`: transition `foundCase.status` to `{ value: "plan-approved", label: "Plan Approved", color: "success" }`.
  - Automatically generate an itemized invoice for the approved case in `db.invoices`.
  - Update `POST .../shipment-batches/start-next`: record courier ("DHL Express Medical") and tracking number, moving case to `in-manufacturing` or `dispatched`.
- [ ] **Step 4: Run test to verify it passes**

---

### Task 5: Frontend UI Glitches, DOM Polling, and UX Polish (P1 / P2)

**Files:**
- Modify: `public/index.html`
- Modify: `public/simulation.html`
- Test: `tests/frontend_ui_test.js`

**Interfaces:**
- Consumes: Browser DOM events, Vue lifecycle
- Produces: Clean console (no WebSocket errors), responsive layout, RTL toggle, mutation-driven IPR injection.

- [ ] **Step 1: Write failing Puppeteer test for WebSocket console errors and DOM polling**
- [ ] **Step 2: Run test to verify issues**
- [ ] **Step 3: Implement frontend fixes in `public/index.html` and `public/simulation.html`**
  - In `public/index.html`: replace `setInterval(checkAndInjectIPR, 500)` with a single mutation observer / route listener so DOM is not polled repeatedly.
  - Provide a clean WebSocket/Pusher mock in window so `ERR_CONNECTION_REFUSED` is suppressed.
  - Tidy the floating `.role-switcher-banner`: add collapse/hide toggle so it does not block navigation.
  - Add dynamic `dir="rtl"` support when Arabic is selected.
  - In `public/simulation.html`: add local Three.js fallback if CDN fails, and fix deprecated `window.event` usage.
- [ ] **Step 4: Run test to verify it passes**

---

### Task 6: Performance Optimization, Compression & Asset Caching (P2)

**Files:**
- Modify: `server.js:25-40`, `package.json`
- Test: `tests/performance_test.js`

**Interfaces:**
- Consumes: HTTP request headers `Accept-Encoding`, `If-None-Match`
- Produces: Gzip/Brotli compressed streams, `Cache-Control: public, max-age=31536000, immutable` for static assets, `no-store` for dynamic API.

- [ ] **Step 1: Write failing test for compression and cache headers**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement compression and targeted caching in `server.js`**
  - Install and register `compression` middleware in Express.
  - Differentiate caching: apply `no-store` only to `/api/*` routes; apply long-term immutable caching to `/assets/*`.
- [ ] **Step 4: Run test to verify it passes**

---

### Task 7: Comprehensive End-to-End Regression & Verification Suite

**Files:**
- Run: `verify_all_fixes.js`, `comprehensive_portal_audit.js`
- Test: Full end-to-end regression across all 22 routes, forms, modals, and security tests.

- [ ] **Step 1: Execute complete test suite**
- [ ] **Step 2: Verify all 7 tasks pass with zero regressions**
- [ ] **Step 3: Deliver final verification summary report**
