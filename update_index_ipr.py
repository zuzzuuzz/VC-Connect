import re

file_path = r'D:\Antigravity\velourcare-ortho-cloud\public\index.html'

with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Replace the script block before </body>
script_start = "<!-- VelourCare IPR Protocol & Case View Enhancement Script -->"
idx = html.find(script_start)
if idx != -1:
    html_before = html[:idx]
else:
    html_before = html.replace('</body>', '')

new_script = """<!-- VelourCare IPR Protocol & Case View Enhancement Script -->
    <script>
    (function() {
        function checkAndInjectIPR() {
            if (!window.location.pathname.includes('/cases/') || !window.location.pathname.includes('/view')) {
                return;
            }

            // 1. Inject "IPR Protocol" Tab in Tab Bar
            const navTabs = document.querySelector('ul.nav.nav-tabs.nav-tabs-custom.border-bottom-0');
            if (navTabs && !document.getElementById('velourcare-ipr-tab-item')) {
                const iprTabLi = document.createElement('li');
                iprTabLi.id = 'velourcare-ipr-tab-item';
                iprTabLi.className = 'nav-item';
                iprTabLi.innerHTML = `
                    <button id="velourcare-ipr-tab-button" class="nav-link" role="tab" type="button" style="cursor: pointer; display: flex; align-items: center; gap: 6px;">
                        <i class="ri-scissors-2-line text-primary"></i>
                        <span>IPR Protocol</span>
                        <span class="badge bg-danger-subtle text-danger fs-11 ms-1">1.20 mm</span>
                    </button>
                `;

                // Insert before Step Files tab or before Refresh Case button
                const allLis = Array.from(navTabs.children);
                const stepFilesLi = allLis.find(li => li.innerText.includes('Step Files'));
                if (stepFilesLi) {
                    navTabs.insertBefore(iprTabLi, stepFilesLi);
                } else {
                    navTabs.appendChild(iprTabLi);
                }

                const iprBtn = iprTabLi.querySelector('#velourcare-ipr-tab-button');
                iprBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    // Ensure Overview tab content is shown
                    const overviewBtn = Array.from(navTabs.querySelectorAll('button')).find(b => b.innerText.includes('Overview'));
                    if (overviewBtn && !overviewBtn.classList.contains('active')) {
                        overviewBtn.click();
                    }

                    navTabs.querySelectorAll('.nav-link').forEach(btn => {
                        if (btn !== iprBtn) btn.classList.remove('active');
                    });
                    iprBtn.classList.add('active');

                    setTimeout(() => {
                        const el = document.getElementById('velourcare-ipr-section');
                        if (el) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            el.style.boxShadow = '0 0 0 4px rgba(13, 110, 253, 0.4)';
                            el.style.transition = 'box-shadow 0.4s ease';
                            setTimeout(() => { el.style.boxShadow = ''; }, 2500);
                        }
                    }, 120);
                });

                allLis.forEach(li => {
                    const btn = li.querySelector('button');
                    if (btn && btn !== iprBtn) {
                        btn.addEventListener('click', () => {
                            iprBtn.classList.remove('active');
                        });
                    }
                });
            }

            // 2. Inject IPR Protocol Card in DOM
            if (document.getElementById('velourcare-ipr-section')) {
                return;
            }

            const targetContainer = document.querySelector('.tab-content') || document.querySelector('.card-body');
            if (!targetContainer) return;

            const caseIdMatch = window.location.pathname.match(/\\/cases\\/(\\d+)\\/view/);
            const caseId = caseIdMatch ? caseIdMatch[1] : '1';

            const iprCard = document.createElement('div');
            iprCard.id = 'velourcare-ipr-section';
            iprCard.className = 'card mt-4 border shadow-none';
            iprCard.innerHTML = `
                <div class="card-header bg-light-subtle d-flex flex-wrap align-items-center justify-content-between p-3 border-bottom">
                    <div class="d-flex align-items-center gap-2">
                        <span class="avatar-xs d-inline-flex align-items-center justify-content-center rounded-circle bg-primary-subtle text-primary fw-bold">
                            <i class="ri-scissors-2-line fs-16"></i>
                        </span>
                        <div>
                            <h6 class="card-title mb-0 fs-14 fw-bold text-dark">Interproximal Reduction (IPR) Protocol & Tooth Staging Schedule</h6>
                            <span class="text-muted fs-11">Prescribed Clinical Reduction Protocol per Treatment Plan #1</span>
                        </div>
                    </div>
                    <div class="d-flex flex-wrap gap-2 mt-2 mt-md-0">
                        <a href="/uploads/velourcare-ipr-chart-sample.pdf" target="_blank" class="btn btn-sm btn-soft-primary fw-medium">
                            <i class="ri-file-pdf-line me-1"></i> Download IPR Sheet (PDF)
                        </a>
                        <a href="/cases/${caseId}/treatment-plans/1/document" class="btn btn-sm btn-primary fw-medium">
                            <i class="ri-edit-2-line me-1"></i> Open Interactive Teeth Chart
                        </a>
                        <a href="/simulation/velour-0001" target="_blank" class="btn btn-sm btn-soft-info fw-medium">
                            <i class="ri-3d-rotate-line me-1"></i> 3D Simulation
                        </a>
                    </div>
                </div>
                <div class="card-body p-3">
                    <div class="row g-3">
                        <div class="col-lg-3 col-md-4">
                            <div class="border rounded p-3 text-center bg-primary-subtle h-100 d-flex flex-column justify-content-center">
                                <div class="text-muted fs-11 text-uppercase fw-bold">Total IPR Prescribed</div>
                                <div class="fs-24 fw-bold text-primary my-1">1.20 mm</div>
                                <div class="badge bg-success-subtle text-success fs-11 py-1">5 Interproximal Sites</div>
                                <div class="text-muted fs-11 mt-2">
                                    <i class="ri-information-line"></i> Verify contacts with calibrated leaf gauge prior to inserting indicated aligner stage.
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-9 col-md-8">
                            <div class="table-responsive">
                                <table class="table table-sm table-hover table-bordered mb-0 align-middle">
                                    <thead class="table-light fs-12 text-uppercase text-muted">
                                        <tr>
                                            <th>Arch</th>
                                            <th>Contact Pair (FDI)</th>
                                            <th>Reduction (mm)</th>
                                            <th>Timing / Stage</th>
                                            <th>Clinical Stripping Instruction</th>
                                        </tr>
                                    </thead>
                                    <tbody class="fs-12">
                                        <tr>
                                            <td><span class="badge bg-primary-subtle text-primary">Maxillary</span></td>
                                            <td><strong>11 - 21</strong> (Central Incisors)</td>
                                            <td><span class="badge bg-danger-subtle text-danger fw-bold fs-12">0.30 mm</span></td>
                                            <td><span class="badge bg-warning-subtle text-warning">After Step 03</span></td>
                                            <td>Diamond single-sided abrasive strip; polish with ultra-fine finishing strip.</td>
                                        </tr>
                                        <tr>
                                            <td><span class="badge bg-primary-subtle text-primary">Maxillary</span></td>
                                            <td><strong>21 - 22</strong> (Central - Lateral)</td>
                                            <td><span class="badge bg-danger-subtle text-danger fw-bold fs-12">0.20 mm</span></td>
                                            <td><span class="badge bg-warning-subtle text-warning">After Step 03</span></td>
                                            <td>Medium flexible strip; confirm 0.20mm passive fit with leaf gauge.</td>
                                        </tr>
                                        <tr>
                                            <td><span class="badge bg-primary-subtle text-primary">Maxillary</span></td>
                                            <td><strong>12 - 11</strong> (Lateral - Central)</td>
                                            <td><span class="badge bg-danger-subtle text-danger fw-bold fs-12">0.20 mm</span></td>
                                            <td><span class="badge bg-warning-subtle text-warning">After Step 05</span></td>
                                            <td>Medium flexible strip; confirm contact relief.</td>
                                        </tr>
                                        <tr>
                                            <td><span class="badge bg-info-subtle text-info">Mandibular</span></td>
                                            <td><strong>31 - 41</strong> (Central Incisors)</td>
                                            <td><span class="badge bg-danger-subtle text-danger fw-bold fs-12">0.20 mm</span></td>
                                            <td><span class="badge bg-warning-subtle text-warning">After Step 02</span></td>
                                            <td>Ultra-fine double-sided strip; preserve natural interdental papilla.</td>
                                        </tr>
                                        <tr>
                                            <td><span class="badge bg-info-subtle text-info">Mandibular</span></td>
                                            <td><strong>41 - 42</strong> (Central - Lateral)</td>
                                            <td><span class="badge bg-danger-subtle text-danger fw-bold fs-12">0.30 mm</span></td>
                                            <td><span class="badge bg-warning-subtle text-warning">After Step 04</span></td>
                                            <td>Diamond abrasive strip; verify with calibrated 0.30mm leaf gauge.</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            const chiefCard = Array.from(document.querySelectorAll('.card')).find(c => c.innerText.includes('Chief Complaint') || c.innerText.includes('Treatment Plan'));
            if (chiefCard && chiefCard.parentNode) {
                chiefCard.parentNode.insertBefore(iprCard, chiefCard.nextSibling);
            } else {
                targetContainer.appendChild(iprCard);
            }
        }

        setInterval(checkAndInjectIPR, 500);
        window.addEventListener('popstate', () => setTimeout(checkAndInjectIPR, 200));
    })();
    </script>
</body>
</html>"""

final_html = html_before.rstrip() + "\n" + new_script
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(final_html)

print("Updated index.html successfully!")
