/**
 * STACKLY RISK MANAGEMENT — DASHBOARD SYSTEM
 * Powers user-dashboard.html and admin-dashboard.html.
 * Handles profile synchronization, exact untruncated email display,
 * interactive pure CSS/DOM charts, risk matrix, activity logs, and table operations.
 * Zero dependencies. Zero emojis. Zero SVGs.
 */

document.addEventListener('DOMContentLoaded', () => {
    syncUserProfile();
    initDashboardTabs();
    initRiskMatrix();
    initDashboardCharts();
    initTableSearch();
    initSettingsForm();
    initMobileSidebar();
});

/* --- 1. USER PROFILE SYNCHRONIZATION --- */
function syncUserProfile() {
    // Default fallback if visiting directly without logging in first
    let name = localStorage.getItem('userName');
    let email = localStorage.getItem('userEmail');
    let role = localStorage.getItem('userRole');

    if (!email) {
        // Provide corporate demo credentials
        name = 'Shobitha Analyst';
        email = 'shobitha@gmail.com'; // Exact email demonstration
        role = document.body.getAttribute('data-dashboard-type') === 'admin' ? 'Admin' : 'User';
        
        localStorage.setItem('userName', name);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userRole', role);
    }

    // Populate all elements displaying profile data
    const nameEls = document.querySelectorAll('.sync-user-name');
    const emailEls = document.querySelectorAll('.sync-user-email');
    const roleEls = document.querySelectorAll('.sync-user-role');
    const avatarEls = document.querySelectorAll('.sync-user-avatar');

    nameEls.forEach(el => { el.textContent = name; });
    
    // CRITICAL: NEVER TRUNCATE EMAIL. Displays full string (e.g. shobitha@gmail.com)
    emailEls.forEach(el => { el.textContent = email; });
    
    roleEls.forEach(el => { el.textContent = role; });

    // Initial avatar letters
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'SA';
    avatarEls.forEach(el => { el.textContent = initials; });

    // Also populate settings form inputs if present
    const settingsNameInput = document.getElementById('settings-name-input');
    const settingsEmailInput = document.getElementById('settings-email-input');
    if (settingsNameInput) settingsNameInput.value = name;
    if (settingsEmailInput) settingsEmailInput.value = email;
}

/* --- 2. DASHBOARD NAVIGATION TABS --- */
function initDashboardTabs() {
    const navLinks = document.querySelectorAll('.dashboard-sidebar .sidebar-link[data-tab]');
    const tabPanes = document.querySelectorAll('.dashboard-tab-pane');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const tabId = link.getAttribute('data-tab');
            if (!tabId) return;
            e.preventDefault();

            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            tabPanes.forEach(pane => {
                pane.classList.toggle('active', pane.id === `tab-${tabId}`);
            });

            // On mobile, close sidebar after clicking
            const sidebar = document.querySelector('.dashboard-sidebar');
            if (sidebar && window.innerWidth <= 1024) {
                sidebar.classList.remove('open');
            }
        });
    });
}

/* --- 3. INTERACTIVE 5x5 RISK MATRIX --- */
function initRiskMatrix() {
    const matrixGrid = document.querySelector('.interactive-risk-matrix');
    const detailBox = document.getElementById('matrix-risk-detail');
    if (!matrixGrid) return;

    // 5x5 Matrix: Impact (Y-axis 5 to 1) x Likelihood (X-axis 1 to 5)
    // Risk score = Impact * Likelihood (1 to 25)
    // Clear and build cells
    matrixGrid.innerHTML = '';

    const riskScenarios = {
        '5-5': { code: 'CR-01', name: 'Critical Cloud Infrastructure Ransomware Outage', level: 'Critical Risk (25)', action: 'Immediate CISO escalation & immutable backup validation' },
        '5-4': { code: 'FR-04', name: 'Liquidity Collateral Haircut Under High Volatility', level: 'High Risk (20)', action: 'Buffer treasury reserves & dynamic margin modeling' },
        '4-5': { code: 'OP-02', name: 'Tier-1 Logistics Hub Operational Interruption', level: 'High Risk (20)', action: 'Activate dual-redundant routing partners' },
        '4-3': { code: 'CP-08', name: 'Cross-Border Privacy & ESG Data Compliance Shift', level: 'Moderate Risk (12)', action: 'Legal audit & automated audit trail implementation' },
        '3-3': { code: 'OP-09', name: 'Key Vendor SLA Breach in Data Warehousing', level: 'Moderate Risk (9)', action: 'Enforce contractual penalties & backup failover' },
        '2-2': { code: 'CP-14', name: 'Quarterly Staff Security Certification Lapse', level: 'Low Risk (4)', action: 'Automated HR training reminder dispatch' },
        '1-2': { code: 'FR-12', name: 'Minor Currency Exchange Rate Drift', level: 'Low Risk (2)', action: 'Standard monthly spot hedge review' }
    };

    for (let impact = 5; impact >= 1; impact--) {
        for (let likelihood = 1; likelihood <= 5; likelihood++) {
            const score = impact * likelihood;
            const key = `${impact}-${likelihood}`;
            const scenario = riskScenarios[key];

            const cell = document.createElement('div');
            cell.className = 'matrix-cell-interactive';
            
            // Color according to score
            if (score >= 18) {
                cell.classList.add('cell-critical');
            } else if (score >= 9) {
                cell.classList.add('cell-moderate');
            } else {
                cell.classList.add('cell-low');
            }

            if (scenario) {
                cell.innerHTML = `<span>${scenario.code}</span>`;
                cell.title = `${scenario.name} (Score: ${score})`;
            }

            cell.addEventListener('click', () => {
                document.querySelectorAll('.matrix-cell-interactive').forEach(c => c.classList.remove('selected'));
                cell.classList.add('selected');

                if (detailBox) {
                    if (scenario) {
                        detailBox.innerHTML = `
                            <div class="detail-header">
                                <span class="badge-risk ${score >= 18 ? 'badge-critical' : score >= 9 ? 'badge-moderate' : 'badge-low'}">${scenario.level}</span>
                                <h4 style="margin-top: 0.5rem; font-size: 1.1rem; color: var(--primary);">${scenario.name}</h4>
                            </div>
                            <p style="font-size: 0.9rem; color: var(--primary-70); margin: 0.5rem 0;"><strong>Risk Identifier:</strong> ${scenario.code}</p>
                            <p style="font-size: 0.9rem; color: var(--primary-70); margin-bottom: 0.5rem;"><strong>Impact:</strong> ${impact}/5 | <strong>Likelihood:</strong> ${likelihood}/5 (Score: ${score}/25)</p>
                            <div style="background: var(--accent); padding: 0.75rem 1rem; border-radius: 4px; border-left: 3px solid var(--secondary); font-size: 0.88rem;">
                                <strong>Recommended Strategy:</strong> ${scenario.action}
                            </div>
                        `;
                    } else {
                        detailBox.innerHTML = `
                            <div class="detail-header">
                                <span class="badge-risk badge-low">Zone ${impact}x${likelihood} (Score: ${score})</span>
                                <h4 style="margin-top: 0.5rem; font-size: 1.05rem; color: var(--primary);">No Active Critical Incidents in This Coordinate</h4>
                            </div>
                            <p style="font-size: 0.9rem; color: var(--primary-70); margin-top: 0.5rem;">This risk band currently falls within acceptable organizational tolerances. Continuous telemetry active.</p>
                        `;
                    }
                }
            });

            matrixGrid.appendChild(cell);
        }
    }
}

/* --- 4. CHARTS & DATA RENDERING (Zero external libraries) --- */
function initDashboardCharts() {
    // Dynamic Score Gauge (Pure HTML5 Canvas)
    const canvas = document.getElementById('risk-gauge-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const w = 220;
        const h = 130;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        ctx.scale(dpr, dpr);

        const centerX = w / 2;
        const centerY = h - 15;
        const radius = 90;

        // Background Arch
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI, 0, false);
        ctx.lineWidth = 14;
        ctx.strokeStyle = 'rgba(16, 42, 67, 0.12)';
        ctx.stroke();

        // Active Score Progress Arch (Score = 78 out of 100)
        const score = 0.78;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI, Math.PI + (Math.PI * score), false);
        ctx.lineWidth = 14;
        ctx.strokeStyle = '#C89B3C'; // Secondary Gold
        ctx.lineCap = 'round';
        ctx.stroke();
    }
}

/* --- 5. TABLE SEARCH & FILTER --- */
function initTableSearch() {
    const searchInput = document.getElementById('table-search-input');
    const table = document.querySelector('.searchable-table');
    if (!searchInput || !table) return;

    searchInput.addEventListener('input', () => {
        const term = searchInput.value.toLowerCase().trim();
        const rows = table.querySelectorAll('tbody tr');

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(term) ? '' : 'none';
        });
    });
}

/* --- 6. SETTINGS FORM WITH LOCALSTORAGE PERSISTENCE --- */
function initSettingsForm() {
    const settingsForm = document.getElementById('dashboard-settings-form');
    if (!settingsForm) return;

    settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('settings-name-input');
        const emailInput = document.getElementById('settings-email-input');
        const statusMsg = document.getElementById('settings-status-msg');

        if (nameInput && nameInput.value.trim().length > 1) {
            localStorage.setItem('userName', nameInput.value.trim());
        }

        if (emailInput && emailInput.value.trim().includes('@')) {
            // Keep untruncated full email
            localStorage.setItem('userEmail', emailInput.value.trim());
        }

        syncUserProfile();

        if (statusMsg) {
            statusMsg.textContent = 'Profile changes saved successfully.';
            statusMsg.style.display = 'block';
            setTimeout(() => {
                statusMsg.style.display = 'none';
            }, 3000);
        }
    });
}

/* --- 7. MOBILE SIDEBAR TOGGLE --- */
function initMobileSidebar() {
    const toggleBtn = document.querySelector('.dashboard-sidebar-toggle');
    const sidebar = document.querySelector('.dashboard-sidebar');
    if (!toggleBtn || !sidebar) return;

    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
}
