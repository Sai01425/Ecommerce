/**
 * Customer Orders History and Order Tracking
 */

document.addEventListener('DOMContentLoaded', () => {
  if (requireAuth('orders.html')) {
    loadUserOrders();
  }
});

async function loadUserOrders() {
  const container = document.getElementById('ordersListContainer');
  if (!container) return;

  container.innerHTML = `
    <div class="col-12 text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading orders...</span>
      </div>
      <p class="mt-2 text-muted">Retrieving your orders...</p>
    </div>
  `;

  try {
    const res = await apiRequest('/orders/my');
    const orders = res.data;

    if (!orders || orders.length === 0) {
      container.innerHTML = `
        <div class="col-12 text-center py-5 bg-white rounded-3 shadow-sm border p-5">
          <i class="bi bi-box-seam fs-1 text-muted" style="font-size: 3.5rem !important;"></i>
          <h4 class="mt-3 fw-bold">No Orders Placed Yet</h4>
          <p class="text-muted">You haven't placed any orders with us yet. Start exploring our catalog now!</p>
          <a href="products.html" class="btn btn-primary px-4 mt-2">Start Shopping</a>
        </div>
      `;
      return;
    }

    container.innerHTML = orders.map(order => createOrderCardHtml(order)).join('');
  } catch (err) {
    container.innerHTML = `
      <div class="col-12 text-center py-5 text-danger">
        <i class="bi bi-exclamation-triangle fs-1"></i>
        <h4 class="mt-3">Failed to load orders</h4>
        <p>${err.message}</p>
        <button class="btn btn-outline-primary" onclick="loadUserOrders()">Retry</button>
      </div>
    `;
  }
}

function createOrderCardHtml(order) {
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const canCancel = order.status === 'PENDING' || order.status === 'CONFIRMED';

  const itemsHtml = order.items.map(item => `
    <div class="d-flex align-items-center gap-3 py-2 border-bottom">
      <img src="${item.productImageUrl || DEFAULT_PRODUCT_IMAGE}" alt="${item.productName}" class="cart-item-img" style="width: 60px; height: 60px;" onerror="this.onerror=null;this.src='${DEFAULT_PRODUCT_IMAGE}'">
      <div class="flex-grow-1">
        <h6 class="mb-0 fw-semibold">${item.productName}</h6>
        <div class="text-muted small">Qty: ${item.quantity} &times; ${formatCurrency(item.price)}</div>
      </div>
      <div class="fw-bold">${formatCurrency(item.subtotal)}</div>
    </div>
  `).join('');

  return `
    <div class="order-card">
      <div class="order-header">
        <div>
          <span class="text-muted small">ORDER ID:</span>
          <span class="fw-bold ms-1 text-dark">${order.orderNumber}</span>
          <div class="text-muted small mt-1">Placed on ${orderDate}</div>
        </div>
        <div class="d-flex align-items-center gap-3">
          <span class="status-badge status-${order.status}">${order.status}</span>
          <div class="text-end">
            <span class="text-muted small d-block">TOTAL</span>
            <span class="fw-bold fs-5 text-dark">${formatCurrency(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      <div class="order-body">
        <div class="row g-4">
          <!-- Item list -->
          <div class="col-lg-8">
            <div class="mb-3">
              ${itemsHtml}
            </div>
            ${canCancel ? `
              <button class="btn btn-outline-danger btn-sm" onclick="cancelOrder(${order.id}, '${order.orderNumber}')">
                <i class="bi bi-x-circle me-1"></i>Cancel Order
              </button>
            ` : ''}
          </div>

          <!-- Shipping and Summary info -->
          <div class="col-lg-4 border-start">
            <h6 class="fw-bold mb-2">Shipping Details</h6>
            <div class="text-muted small">
              <div class="fw-semibold text-dark">${order.shippingAddress.fullName}</div>
              <div>${order.shippingAddress.streetAddress}</div>
              <div>${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zipCode}</div>
              <div>Phone: ${order.shippingAddress.phone}</div>
            </div>

            <hr class="my-3">

            <h6 class="fw-bold mb-2">Payment Info</h6>
            <div class="text-muted small">
              <div>Method: <strong>${order.paymentMethod}</strong></div>
              <div>Payment Status: <span class="badge ${order.paymentStatus === 'PAID' ? 'bg-success' : 'bg-secondary'}">${order.paymentStatus}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Cancel Order
async function cancelOrder(orderId, orderNumber) {
  if (!confirm(`Are you sure you want to cancel order ${orderNumber}? Stock will be automatically restocked.`)) {
    return;
  }

  try {
    await apiRequest(`/orders/${orderId}/cancel`, {
      method: 'PATCH'
    });
    showToast(`Order ${orderNumber} cancelled successfully`, 'info');
    loadUserOrders();
  } catch (err) {
    showToast(err.message, 'error');
  }
}
