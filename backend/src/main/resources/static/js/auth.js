/**
 * Authentication Management (Login, Registration, Demo Credentials)
 */

document.addEventListener('DOMContentLoaded', () => {
  initLoginForm();
  initRegisterForm();
  initDemoLogins();
});

// Initialize Login Form
function initLoginForm() {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const alertBox = document.getElementById('loginAlert');
    const submitBtn = document.getElementById('loginSubmitBtn');

    if (alertBox) alertBox.classList.add('d-none');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Signing In...';
    }

    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (res && res.data) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        showToast('Signed in successfully! Welcome back, ' + res.data.user.name, 'success');

        const params = new URLSearchParams(window.location.search);
        const redirectUrl = params.get('redirect') || (res.data.user.role === 'ROLE_ADMIN' ? 'admin.html' : 'index.html');
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 600);
      }
    } catch (err) {
      if (alertBox) {
        alertBox.textContent = err.message || 'Invalid email or password';
        alertBox.classList.remove('d-none');
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Sign In';
      }
    }
  });
}

// Initialize Register Form
function initRegisterForm() {
  const registerForm = document.getElementById('registerForm');
  if (!registerForm) return;

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const alertBox = document.getElementById('registerAlert');
    const submitBtn = document.getElementById('registerSubmitBtn');

    if (alertBox) alertBox.classList.add('d-none');

    if (password !== confirmPassword) {
      if (alertBox) {
        alertBox.textContent = 'Passwords do not match';
        alertBox.classList.remove('d-none');
      }
      return;
    }

    if (password.length < 6) {
      if (alertBox) {
        alertBox.textContent = 'Password must be at least 6 characters';
        alertBox.classList.remove('d-none');
      }
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Creating Account...';
    }

    try {
      const res = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, phone, password })
      });

      if (res && res.data) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        showToast('Registration successful! Welcome to Novamart!', 'success');

        setTimeout(() => {
          window.location.href = 'index.html';
        }, 800);
      }
    } catch (err) {
      if (alertBox) {
        alertBox.textContent = err.message || 'Registration failed';
        alertBox.classList.remove('d-none');
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Create Account';
      }
    }
  });
}

// Quick 1-Click Demo Login credentials helpers
function initDemoLogins() {
  const btnDemoCustomer = document.getElementById('btnDemoCustomer');
  const btnDemoAdmin = document.getElementById('btnDemoAdmin');

  if (btnDemoCustomer) {
    btnDemoCustomer.addEventListener('click', () => {
      const emailInput = document.getElementById('loginEmail');
      const passInput = document.getElementById('loginPassword');
      if (emailInput && passInput) {
        emailInput.value = 'john@example.com';
        passInput.value = 'Password@123';
        document.getElementById('loginForm').dispatchEvent(new Event('submit'));
      }
    });
  }

  if (btnDemoAdmin) {
    btnDemoAdmin.addEventListener('click', () => {
      const emailInput = document.getElementById('loginEmail');
      const passInput = document.getElementById('loginPassword');
      if (emailInput && passInput) {
        emailInput.value = 'admin@ecommerce.com';
        passInput.value = 'Admin@12345';
        document.getElementById('loginForm').dispatchEvent(new Event('submit'));
      }
    });
  }
}

// Authentication Guards
function requireAuth(redirectPath = window.location.pathname) {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = `login.html?redirect=${encodeURIComponent(redirectPath)}`;
    return false;
  }
  return true;
}

function requireAdmin() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!token || !user || user.role !== 'ROLE_ADMIN') {
    showToast('Unauthorized: Administrator access required', 'error');
    setTimeout(() => {
      window.location.href = 'login.html?redirect=admin.html';
    }, 1000);
    return false;
  }
  return true;
}
