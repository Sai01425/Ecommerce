/**
 * Core Application Configuration and Shared Utilities
 */

const API_BASE = window.location.origin.includes(':8080') ? '/api' : 'http://localhost:8080/api';

const DEFAULT_PRODUCT_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f1f3f5'/%3E%3Cpath d='M160 120h80v60h-80z' fill='%23ced4da'/%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%236c757d'%3ENo Image Available%3C/text%3E%3C/svg%3E";

// Fetch API Wrapper with automatic JWT and error handling
async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 401 && !endpoint.includes('/auth/login')) {
        // If unauthorized on a protected route, clear token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        updateNavUser();
      }
      const errorMsg = (data && data.message) ? data.message : `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${url}:`, error);
    throw error;
  }
}

// Format Currency
function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '₹0.00';
  const num = typeof amount === 'number' ? amount : parseFloat(amount);
  return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Render star icons for rating
function renderStars(rating) {
  const r = parseFloat(rating) || 0;
  let starsHtml = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(r)) {
      starsHtml += '<i class="bi bi-star-fill text-warning"></i>';
    } else if (i - 0.5 <= r) {
      starsHtml += '<i class="bi bi-star-half text-warning"></i>';
    } else {
      starsHtml += '<i class="bi bi-star text-warning"></i>';
    }
  }
  return starsHtml;
}

// Show Toast Notification
function showToast(message, type = 'success') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container-custom';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `custom-toast ${type}`;
  
  const iconClass = type === 'success' ? 'bi-check-circle-fill text-success' :
                    type === 'error' ? 'bi-exclamation-triangle-fill text-danger' :
                    'bi-info-circle-fill text-primary';

  toast.innerHTML = `
    <div class="d-flex align-items-center gap-2">
      <i class="bi ${iconClass} fs-5"></i>
      <span class="fw-medium">${message}</span>
    </div>
    <button type="button" class="btn-close ms-2" aria-label="Close"></button>
  `;

  toast.querySelector('.btn-close').addEventListener('click', () => toast.remove());

  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }
  }, 4000);
}

// Refresh Cart badge count
async function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;

  const token = localStorage.getItem('token');
  if (!token) {
    badge.textContent = '0';
    return;
  }

  try {
    const res = await apiRequest('/cart');
    if (res && res.data) {
      badge.textContent = res.data.totalItems || 0;
    }
  } catch (err) {
    badge.textContent = '0';
  }
}

// Update User Navigation Dropdown / Buttons
function updateNavUser() {
  const userContainer = document.getElementById('navUserContainer');
  if (!userContainer) return;

  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');

  if (user && token) {
    const isAdmin = user.role === 'ROLE_ADMIN';
    userContainer.innerHTML = `
      <div class="dropdown">
        <button class="btn btn-outline-light dropdown-toggle d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown" aria-expanded="false">
          <i class="bi bi-person-circle fs-5"></i>
          <span>${user.name.split(' ')[0]}</span>
          ${isAdmin ? '<span class="badge bg-danger ms-1">Admin</span>' : ''}
        </button>
        <ul class="dropdown-menu dropdown-menu-end shadow">
          <li class="dropdown-header">Signed in as <strong>${user.email}</strong></li>
          ${isAdmin ? '<li><a class="dropdown-item text-primary fw-bold" href="admin.html"><i class="bi bi-speedometer2 me-2"></i>Admin Dashboard</a></li><li><hr class="dropdown-divider"></li>' : ''}
          <li><a class="dropdown-item" href="orders.html"><i class="bi bi-box-seam me-2"></i>My Orders</a></li>
          <li><a class="dropdown-item" href="profile.html"><i class="bi bi-gear me-2"></i>Account Profile</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><button class="dropdown-item text-danger" id="navLogoutBtn"><i class="bi bi-box-arrow-right me-2"></i>Sign Out</button></li>
        </ul>
      </div>
    `;

    document.getElementById('navLogoutBtn').addEventListener('click', () => {
      logout();
    });
  } else {
    userContainer.innerHTML = `
      <div class="d-flex align-items-center gap-2">
        <a href="login.html" class="btn btn-outline-light btn-sm px-3 fw-medium">Sign In</a>
        <a href="register.html" class="btn btn-warning btn-sm px-3 fw-bold">Register</a>
      </div>
    `;
  }
}

// User Logout
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  showToast('Logged out successfully', 'success');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 500);
}

// Quick Add to Cart helper
async function handleAddToCart(productId, quantity = 1) {
  const token = localStorage.getItem('token');
  if (!token) {
    showToast('Please sign in to add products to your cart', 'warning');
    setTimeout(() => {
      window.location.href = `login.html?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    }, 1200);
    return;
  }

  try {
    const res = await apiRequest('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity })
    });
    showToast('Item added to shopping cart!', 'success');
    updateCartBadge();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Setup search form listener
function setupGlobalSearch() {
  const form = document.getElementById('globalSearchForm');
  const input = document.getElementById('globalSearchInput');
  if (!form || !input) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (query) {
      window.location.href = `products.html?keyword=${encodeURIComponent(query)}`;
    } else {
      window.location.href = `products.html`;
    }
  });
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  updateNavUser();
  updateCartBadge();
  setupGlobalSearch();
});
