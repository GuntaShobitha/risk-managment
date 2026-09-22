/**
 * STACKLY RISK MANAGEMENT — AUTHENTICATION SYSTEM
 * Handles login, registration, validation, localStorage session persistence,
 * role-based routing (User -> user-dashboard.html, Admin -> admin-dashboard.html),
 * and logout.
 * Zero dependencies. Zero emojis. Zero SVGs.
 */

document.addEventListener('DOMContentLoaded', () => {
    initAuthForms();
    initPasswordVisibility();
});

function initAuthForms() {
    // 1. Role switcher (User vs Admin)
    const roleBtns = document.querySelectorAll('.role-btn');
    let selectedRole = 'User';

    roleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            roleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedRole = btn.getAttribute('data-role') || 'User';
            const roleInput = document.getElementById('auth-role-input');
            if (roleInput) roleInput.value = selectedRole;
        });
    });

    // 2. Login Form Handling
    const loginForm = document.getElementById('stackly-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            clearErrors();

            const emailInput = document.getElementById('login-email');
            const passwordInput = document.getElementById('login-password');
            const roleInput = document.getElementById('auth-role-input');

            const email = emailInput ? emailInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value : '';
            const role = roleInput ? roleInput.value : selectedRole;

            let hasError = false;

            if (!isValidEmail(email)) {
                showError('login-email-error', 'Please provide a valid business email address (e.g. name@example.com).');
                hasError = true;
            }

            if (!password || password.trim().length === 0) {
                showError('login-password-error', 'Please enter your password.');
                hasError = true;
            }

            if (hasError) return;

            // Determine user name from existing stored account or generate from email
            let registeredUsers = [];
            try {
                registeredUsers = JSON.parse(localStorage.getItem('stackly_registered_users') || '[]');
            } catch (err) {
                registeredUsers = [];
            }

            const existingUser = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
            let finalName = existingUser ? existingUser.name : deriveNameFromEmail(email);

            // Store EXACT untruncated email and user info in localStorage
            localStorage.setItem('stackly_session_active', 'true');
            localStorage.setItem('userName', finalName);
            localStorage.setItem('userEmail', email); // NEVER TRUNCATED: full email preserved
            localStorage.setItem('userRole', role);

            // Routing
            if (role.toLowerCase() === 'admin') {
                window.location.href = './admin-dashboard.html';
            } else {
                window.location.href = './user-dashboard.html';
            }
        });
    }

    // 3. Registration Form Handling
    const registerForm = document.getElementById('stackly-register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            clearErrors();

            const nameInput = document.getElementById('register-name');
            const emailInput = document.getElementById('register-email');
            const phoneInput = document.getElementById('register-phone');
            const passInput = document.getElementById('register-password');
            const confirmPassInput = document.getElementById('register-confirm-password');
            const roleInput = document.getElementById('auth-role-input');

            const name = nameInput ? nameInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim() : '';
            const phone = phoneInput ? phoneInput.value.trim() : '';
            const pass = passInput ? passInput.value : '';
            const confirmPass = confirmPassInput ? confirmPassInput.value : '';
            const role = roleInput ? roleInput.value : selectedRole;

            let hasError = false;

            if (!name || name.length < 2) {
                showError('register-name-error', 'Please enter your full corporate name.');
                hasError = true;
            }

            if (!isValidEmail(email)) {
                showError('register-email-error', 'Please provide a valid business email address (e.g. name@example.com).');
                hasError = true;
            }

            if (!phone || phone.length < 7) {
                showError('register-phone-error', 'Please enter a valid telephone contact number.');
                hasError = true;
            }

            if (!pass || pass.length < 6) {
                showError('register-password-error', 'Password must contain at least 6 characters.');
                hasError = true;
            }

            if (pass !== confirmPass) {
                showError('register-confirm-error', 'Passwords do not match. Please verify.');
                hasError = true;
            }

            if (hasError) return;

            // Save user to registered database in localStorage
            let registeredUsers = [];
            try {
                registeredUsers = JSON.parse(localStorage.getItem('stackly_registered_users') || '[]');
            } catch (err) {
                registeredUsers = [];
            }

            registeredUsers.push({
                name: name,
                email: email, // Full exact email
                phone: phone,
                role: role
            });
            localStorage.setItem('stackly_registered_users', JSON.stringify(registeredUsers));

            // Log user in directly
            localStorage.setItem('stackly_session_active', 'true');
            localStorage.setItem('userName', name);
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userRole', role);

            // Redirect based on selected role
            if (role.toLowerCase() === 'admin') {
                window.location.href = './admin-dashboard.html';
            } else {
                window.location.href = './user-dashboard.html';
            }
        });
    }

    // 4. Forgot password link handling (routes to 404.html)
    const forgotLinks = document.querySelectorAll('.forgot-password-link');
    forgotLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = './404.html';
        });
    });
}

/* Helper: Email Validation Regex */
function isValidEmail(email) {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
}

/* Helper: Derive readable name from email if needed */
function deriveNameFromEmail(email) {
    if (!email) return 'Risk Analyst';
    const parts = email.split('@')[0].replace(/[._-]/g, ' ');
    return parts.replace(/\b\w/g, c => c.toUpperCase());
}

/* Helper: Inline Form Error Display */
function showError(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = message;
        el.classList.add('active');
    }
}

function clearErrors() {
    const errorEls = document.querySelectorAll('.form-error');
    errorEls.forEach(el => {
        el.textContent = '';
        el.classList.remove('active');
    });
}

/* Password Toggle Interaction */
function initPasswordVisibility() {
    const toggleBtns = document.querySelectorAll('.password-toggle-btn');
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            const icon = btn.querySelector('.material-symbols-outlined');
            if (!input) return;

            if (input.type === 'password') {
                input.type = 'text';
                if (icon) icon.textContent = 'visibility_off';
            } else {
                input.type = 'password';
                if (icon) icon.textContent = 'visibility';
            }
        });
    });
}

/* Global Session Logout Handler */
function stacklyLogout() {
    localStorage.removeItem('stackly_session_active');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    window.location.href = './login.html';
}
window.stacklyLogout = stacklyLogout;
