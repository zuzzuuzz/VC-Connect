import re

html_path = r'D:\Antigravity\velourcare-ortho-cloud\public\index.html'

with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

ipr_enhancement_script = """
    <!-- VelourCare IPR Protocol & Case View Enhancement Script -->
    <script>
    (function() {
        function checkAndInjectIPR() {
            if (!window.location.pathname.includes('/cases/') || !window.location.pathname.includes('/view')) {
                return;
            }
            if (document.getElementById('velourcare-ipr-section')) {
                return;
            }

            // Find insertion container: look for chief complaint / treatment plan cards or .tab-content
            const targetContainer = document.querySelector('.tab-content') || document.querySelector('.card-body');
            if (!targetContainer) return;

            // Check if we are inside Overview or Treatment Plans tab
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
                        <a href="/cases/1/treatment-plans/1/document" class="btn btn-sm btn-primary fw-medium">
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

            // Insert after chief complaint / treatment plan cards or prepend to tab-content
            const chiefCard = Array.from(document.querySelectorAll('.card')).find(c => c.innerText.includes('Chief Complaint') || c.innerText.includes('Treatment Plan'));
            if (chiefCard && chiefCard.parentNode) {
                chiefCard.parentNode.insertBefore(iprCard, chiefCard.nextSibling);
            } else {
                targetContainer.appendChild(iprCard);
            }
        }

        // Run check periodically to handle client-side SPA route transitions
        setInterval(checkAndInjectIPR, 600);
        window.addEventListener('popstate', () => setTimeout(checkAndInjectIPR, 300));
    })();
    </script>
"""

if "velourcare-ipr-section" not in html:
    html = html.replace("</body>", ipr_enhancement_script + "\n</body>")
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print("public/index.html updated with IPR Section injector!")
else:
    print("public/index.html already has IPR Section injector.")
