/**
 * Admin Dashboard Management (Stats, Products, Categories, Orders)
 */

let allCategories = [];
let allProducts = [];
let allOrders = [];

document.addEventListener('DOMContentLoaded', () => {
  if (requireAdmin()) {
    initAdminDashboard();
  }
});

async function initAdminDashboard() {
  await loadDashboardStats();
  await loadAdminCategories();
  await loadAdminProducts();
  await loadAdminOrders();
  setupAdminForms();
}

// 1. Dashboard Stats
async function loadDashboardStats() {
  try {
    const res = await apiRequest('/admin/stats');
    const stats = res.data;

    document.getElementById('statTotalProducts').textContent = stats.totalProducts;
    document.getElementById('statTotalCustomers').textContent = stats.totalCustomers;
    document.getElementById('statTotalOrders').textContent = stats.totalOrders;
    document.getElementById('statTotalRevenue').textContent = formatCurrency(stats.totalRevenue);
    document.getElementById('statPendingOrders').textContent = stats.pendingOrders;
    document.getElementById('statLowStock').textContent = stats.lowStockProducts;
  } catch (err) {
    console.error('Failed to load admin stats', err);
  }
}

// 2. Categories Management
async function loadAdminCategories() {
  const tableBody = document.getElementById('adminCategoriesTableBody');
  const catSelect = document.getElementById('productCategorySelect');
  const catEditSelect = document.getElementById('editProductCategorySelect');

  try {
    const res = await apiRequest('/categories');
    allCategories = res.data;

    if (tableBody) {
      tableBody.innerHTML = allCategories.map(cat => `
        <tr>
          <td><span class="fw-bold">${cat.id}</span></td>
          <td>
            <div class="d-flex align-items-center gap-2">
              <img src="${cat.imageUrl || DEFAULT_PRODUCT_IMAGE}" alt="${cat.name}" style="width: 36px; height: 36px; object-fit: cover; border-radius: 4px;" onerror="this.onerror=null;this.src='${DEFAULT_PRODUCT_IMAGE}'">
              <strong>${cat.name}</strong>
            </div>
          </td>
          <td class="text-muted small">${cat.description || 'No description'}</td>
          <td><span class="badge bg-secondary">${cat.productCount} products</span></td>
          <td><span class="badge ${cat.active ? 'bg-success' : 'bg-warning'}">${cat.active ? 'Active' : 'Inactive'}</span></td>
          <td>
            <button class="btn btn-outline-primary btn-sm me-1" onclick="openEditCategoryModal(${cat.id})"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-outline-danger btn-sm" onclick="deleteCategory(${cat.id})"><i class="bi bi-trash"></i></button>
          </td>
        </tr>
      `).join('');
    }

    // Populate category dropdowns in product forms
    const optionsHtml = allCategories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    if (catSelect) catSelect.innerHTML = `<option value="">Select Category</option>` + optionsHtml;
    if (catEditSelect) catEditSelect.innerHTML = optionsHtml;
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// 3. Products Management
async function loadAdminProducts() {
  const tableBody = document.getElementById('adminProductsTableBody');

  try {
    const res = await apiRequest('/products?size=100');
    allProducts = res.data.content || [];

    if (tableBody) {
      tableBody.innerHTML = allProducts.map(p => {
        const isLow = p.stockQuantity < 10;
        return `
          <tr>
            <td><span class="fw-bold">${p.id}</span></td>
            <td>
              <div class="d-flex align-items-center gap-2">
                <img src="${p.imageUrl || DEFAULT_PRODUCT_IMAGE}" alt="${p.name}" style="width: 42px; height: 42px; object-fit: contain; border: 1px solid #dee2e6; border-radius: 4px; padding: 2px;" onerror="this.onerror=null;this.src='${DEFAULT_PRODUCT_IMAGE}'">
                <div>
                  <div class="fw-semibold text-truncate" style="max-width: 200px;">${p.name}</div>
                  <span class="text-muted small">${p.category ? p.category.name : '-'}</span>
                </div>
              </div>
            </td>
            <td>
              <div>${formatCurrency(p.discountedPrice)}</div>
              ${p.discountPercent > 0 ? `<div class="small text-muted text-decoration-line-through">${formatCurrency(p.price)} (${p.discountPercent}%)</div>` : ''}
            </td>
            <td>
              <span class="badge ${isLow ? 'bg-danger' : 'bg-success'}">${p.stockQuantity}</span>
            </td>
            <td>
              <div class="small"><i class="bi bi-star-fill text-warning me-1"></i>${p.rating} (${p.reviewCount})</div>
            </td>
            <td>
              <button class="btn btn-outline-primary btn-sm me-1" onclick="openEditProductModal(${p.id})"><i class="bi bi-pencil"></i></button>
              <button class="btn btn-outline-danger btn-sm" onclick="deleteProduct(${p.id})"><i class="bi bi-trash"></i></button>
            </td>
          </tr>
        `;
      }).join('');
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// 4. Orders Management
async function loadAdminOrders() {
  const tableBody = document.getElementById('adminOrdersTableBody');

  try {
    const res = await apiRequest('/admin/orders?size=100');
    allOrders = res.data.content || [];

    if (tableBody) {
      tableBody.innerHTML = allOrders.map(order => {
        const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        return `
          <tr>
            <td><span class="fw-bold">${order.orderNumber}</span></td>
            <td>
              <div><strong>${order.userName}</strong></div>
              <div class="text-muted small">${order.userEmail}</div>
            </td>
            <td class="small text-muted">${orderDate}</td>
            <td class="fw-bold">${formatCurrency(order.totalAmount)}</td>
            <td>
              <select class="form-select form-select-sm" onchange="changeOrderStatus(${order.id}, this.value)" style="width: 140px;">
                <option value="PENDING" ${order.status === 'PENDING' ? 'selected' : ''}>PENDING</option>
                <option value="CONFIRMED" ${order.status === 'CONFIRMED' ? 'selected' : ''}>CONFIRMED</option>
                <option value="SHIPPED" ${order.status === 'SHIPPED' ? 'selected' : ''}>SHIPPED</option>
                <option value="DELIVERED" ${order.status === 'DELIVERED' ? 'selected' : ''}>DELIVERED</option>
                <option value="CANCELLED" ${order.status === 'CANCELLED' ? 'selected' : ''}>CANCELLED</option>
              </select>
            </td>
            <td>
              <button class="btn btn-outline-info btn-sm" onclick="viewOrderDetails(${order.id})">
                <i class="bi bi-eye"></i> Details
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Change Order Status
async function changeOrderStatus(orderId, newStatus) {
  try {
    await apiRequest(`/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus })
    });
    showToast('Order status updated to ' + newStatus, 'success');
    loadDashboardStats();
  } catch (err) {
    showToast(err.message, 'error');
    loadAdminOrders();
  }
}

// Setup Admin Forms & Modals
function setupAdminForms() {
  // Add Product Form
  const addProductForm = document.getElementById('addProductForm');
  if (addProductForm) {
    addProductForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        name: document.getElementById('prodName').value.trim(),
        description: document.getElementById('prodDesc').value.trim(),
        price: parseFloat(document.getElementById('prodPrice').value),
        discountPercent: parseInt(document.getElementById('prodDiscount').value || 0),
        stockQuantity: parseInt(document.getElementById('prodStock').value || 0),
        imageUrl: document.getElementById('prodImage').value.trim(),
        categoryId: parseInt(document.getElementById('productCategorySelect').value),
        featured: document.getElementById('prodFeatured').checked,
        trending: document.getElementById('prodTrending').checked,
        bestSeller: document.getElementById('prodBestSeller').checked
      };

      try {
        await apiRequest('/products', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        showToast('Product created successfully!', 'success');
        bootstrap.Modal.getInstance(document.getElementById('addProductModal')).hide();
        addProductForm.reset();
        loadAdminProducts();
        loadDashboardStats();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  // Edit Product Form
  const editProductForm = document.getElementById('editProductForm');
  if (editProductForm) {
    editProductForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('editProdId').value;
      const payload = {
        name: document.getElementById('editProdName').value.trim(),
        description: document.getElementById('editProdDesc').value.trim(),
        price: parseFloat(document.getElementById('editProdPrice').value),
        discountPercent: parseInt(document.getElementById('editProdDiscount').value || 0),
        stockQuantity: parseInt(document.getElementById('editProdStock').value || 0),
        imageUrl: document.getElementById('editProdImage').value.trim(),
        categoryId: parseInt(document.getElementById('editProductCategorySelect').value),
        featured: document.getElementById('editProdFeatured').checked,
        trending: document.getElementById('editProdTrending').checked,
        bestSeller: document.getElementById('editProdBestSeller').checked
      };

      try {
        await apiRequest(`/products/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        showToast('Product updated successfully!', 'success');
        bootstrap.Modal.getInstance(document.getElementById('editProductModal')).hide();
        loadAdminProducts();
        loadDashboardStats();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  // Add Category Form
  const addCategoryForm = document.getElementById('addCategoryForm');
  if (addCategoryForm) {
    addCategoryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        name: document.getElementById('catName').value.trim(),
        description: document.getElementById('catDesc').value.trim(),
        imageUrl: document.getElementById('catImage').value.trim(),
        active: document.getElementById('catActive').checked
      };

      try {
        await apiRequest('/categories', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        showToast('Category created successfully!', 'success');
        bootstrap.Modal.getInstance(document.getElementById('addCategoryModal')).hide();
        addCategoryForm.reset();
        loadAdminCategories();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }
}

// Open Edit Product Modal
function openEditProductModal(id) {
  const p = allProducts.find(x => x.id === id);
  if (!p) return;

  document.getElementById('editProdId').value = p.id;
  document.getElementById('editProdName').value = p.name;
  document.getElementById('editProdDesc').value = p.description;
  document.getElementById('editProdPrice').value = p.price;
  document.getElementById('editProdDiscount').value = p.discountPercent;
  document.getElementById('editProdStock').value = p.stockQuantity;
  document.getElementById('editProdImage').value = p.imageUrl || '';
  if (p.category) {
    document.getElementById('editProductCategorySelect').value = p.category.id;
  }
  document.getElementById('editProdFeatured').checked = p.featured;
  document.getElementById('editProdTrending').checked = p.trending;
  document.getElementById('editProdBestSeller').checked = p.bestSeller;

  new bootstrap.Modal(document.getElementById('editProductModal')).show();
}

// Delete Product
async function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;
  try {
    await apiRequest(`/products/${id}`, { method: 'DELETE' });
    showToast('Product deleted', 'info');
    loadAdminProducts();
    loadDashboardStats();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Delete Category
async function deleteCategory(id) {
  if (!confirm('Are you sure you want to delete this category? (Fails if products belong to it)')) return;
  try {
    await apiRequest(`/categories/${id}`, { method: 'DELETE' });
    showToast('Category deleted', 'info');
    loadAdminCategories();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// View Order Details Modal
function viewOrderDetails(id) {
  const order = allOrders.find(o => o.id === id);
  if (!order) return;

  const content = document.getElementById('adminOrderDetailsContent');
  if (!content) return;

  const itemsHtml = order.items.map(it => `
    <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
      <div>
        <strong>${it.productName}</strong>
        <div class="text-muted small">Qty: ${it.quantity} &times; ${formatCurrency(it.price)}</div>
      </div>
      <div class="fw-bold">${formatCurrency(it.subtotal)}</div>
    </div>
  `).join('');

  content.innerHTML = `
    <div class="mb-3">
      <strong>Order ID:</strong> ${order.orderNumber}<br>
      <strong>Customer:</strong> ${order.userName} (${order.userEmail})<br>
      <strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}<br>
      <strong>Status:</strong> <span class="status-badge status-${order.status}">${order.status}</span>
    </div>
    <h6>Items:</h6>
    ${itemsHtml}
    <div class="d-flex justify-content-between pt-2">
      <strong>Subtotal:</strong> <span>${formatCurrency(order.subtotalAmount)}</span>
    </div>
    <div class="d-flex justify-content-between">
      <strong>Shipping:</strong> <span>${formatCurrency(order.shippingFee)}</span>
    </div>
    <div class="d-flex justify-content-between fs-5 fw-bold border-top pt-2 mt-2">
      <span>Total:</span> <span class="text-primary">${formatCurrency(order.totalAmount)}</span>
    </div>
    <hr>
    <h6>Delivery Address:</h6>
    <div class="text-muted small">
      ${order.shippingAddress.fullName}, ${order.shippingAddress.phone}<br>
      ${order.shippingAddress.streetAddress}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zipCode}
    </div>
  `;

  new bootstrap.Modal(document.getElementById('adminOrderDetailsModal')).show();
}
