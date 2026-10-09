/**
 * Shopping Cart Management
 */

document.addEventListener('DOMContentLoaded', () => {
  if (requireAuth('cart.html')) {
    loadCart();
  }
});

async function loadCart() {
  const container = document.getElementById('cartMainContainer');
  if (!container) return;

  container.innerHTML = `
    <div class="col-12 text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading cart...</span>
      </div>
      <p class="mt-2 text-muted">Retrieving your shopping cart...</p>
    </div>
  `;

  try {
    const res = await apiRequest('/cart');
    const cart = res.data;

    if (!cart || !cart.items || cart.items.length === 0) {
      renderEmptyCart();
      updateCartBadge();
      return;
    }

    renderCartContent(cart);
    updateCartBadge();
  } catch (err) {
    container.innerHTML = `
      <div class="col-12 text-center py-5 text-danger">
        <i class="bi bi-exclamation-triangle fs-1"></i>
        <h4 class="mt-3">Error Loading Cart</h4>
        <p>${err.message}</p>
        <button class="btn btn-outline-primary" onclick="loadCart()">Retry</button>
      </div>
    `;
  }
}

function renderEmptyCart() {
  const container = document.getElementById('cartMainContainer');
  container.innerHTML = `
    <div class="col-12 text-center py-5 bg-white rounded-3 shadow-sm border p-5">
      <i class="bi bi-cart-x fs-1 text-muted" style="font-size: 4rem !important;"></i>
      <h3 class="mt-3 fw-bold">Your Shopping Cart is Empty</h3>
      <p class="text-muted">You have no items in your cart. Explore our catalog and add great deals!</p>
      <a href="products.html" class="btn btn-primary btn-lg mt-2 px-4">
        <i class="bi bi-bag me-2"></i>Explore Products
      </a>
    </div>
  `;
}

function renderCartContent(cart) {
  const container = document.getElementById('cartMainContainer');

  const itemsHtml = cart.items.map(item => {
    const imgUrl = item.productImageUrl || DEFAULT_PRODUCT_IMAGE;
    const isOutOfStock = item.stockQuantity <= 0;
    const isExceedingStock = item.quantity > item.stockQuantity;

    return `
      <div class="card mb-3 border-0 shadow-sm">
        <div class="card-body p-3">
          <div class="row align-items-center g-3">
            <div class="col-auto">
              <img src="${imgUrl}" alt="${item.productName}" class="cart-item-img" onerror="this.onerror=null;this.src='${DEFAULT_PRODUCT_IMAGE}'">
            </div>
            <div class="col">
              <h6 class="mb-1 fw-bold">
                <a href="product-details.html?id=${item.productId}" class="text-decoration-none text-dark">${item.productName}</a>
              </h6>
              <div class="text-muted small mb-2">Unit Price: ${formatCurrency(item.price)}</div>
              ${isOutOfStock ? '<div class="badge bg-danger mb-2">Out of Stock</div>' :
                isExceedingStock ? `<div class="badge bg-warning text-dark mb-2">Only ${item.stockQuantity} left</div>` : ''}
              
              <div class="d-flex align-items-center gap-3">
                <div class="qty-stepper">
                  <button type="button" onclick="changeQuantity(${item.id}, ${item.quantity - 1})" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                  <input type="text" value="${item.quantity}" readonly>
                  <button type="button" onclick="changeQuantity(${item.id}, ${item.quantity + 1})" ${item.quantity >= item.stockQuantity ? 'disabled' : ''}>+</button>
                </div>
                <button class="btn btn-link text-danger p-0 text-decoration-none small" onclick="removeItem(${item.id})">
                  <i class="bi bi-trash3 me-1"></i>Remove
                </button>
              </div>
            </div>
            <div class="col-auto text-end">
              <div class="fs-5 fw-bold text-dark">${formatCurrency(item.subtotal)}</div>
              ${item.discountPercent > 0 ? `<div class="small text-success fw-bold">${item.discountPercent}% off</div>` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="row g-4">
      <!-- Items List -->
      <div class="col-lg-8">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h4 class="fw-bold mb-0">Shopping Cart (${cart.totalItems} items)</h4>
          <button class="btn btn-outline-danger btn-sm" onclick="clearCart()">
            <i class="bi bi-trash me-1"></i>Clear All
          </button>
        </div>
        ${itemsHtml}
        <div class="mt-3">
          <a href="products.html" class="btn btn-outline-secondary">
            <i class="bi bi-arrow-left me-2"></i>Continue Shopping
          </a>
        </div>
      </div>

      <!-- Order Summary Card -->
      <div class="col-lg-4">
        <div class="summary-card">
          <h5 class="fw-bold mb-3 border-bottom pb-2">Order Summary</h5>
          
          <div class="summary-line">
            <span class="text-muted">Items Subtotal:</span>
            <span>${formatCurrency(cart.subtotal)}</span>
          </div>

          <div class="summary-line text-success">
            <span>Discounts Applied:</span>
            <span>-${formatCurrency(cart.totalDiscount)}</span>
          </div>

          <div class="summary-line">
            <span class="text-muted">Estimated Shipping:</span>
            <span>${cart.shippingFee == 0 ? '<strong class="text-success">FREE</strong>' : formatCurrency(cart.shippingFee)}</span>
          </div>

          ${cart.shippingFee > 0 ? `
            <div class="alert alert-info py-2 px-3 small mb-3">
              <i class="bi bi-info-circle me-1"></i>Add ₹${(500 - (cart.totalAmount - 40)).toFixed(2)} more for <strong>FREE Delivery</strong>!
            </div>
          ` : ''}

          <div class="summary-total">
            <span>Total Payable:</span>
            <span class="text-primary">${formatCurrency(cart.totalAmount)}</span>
          </div>

          <div class="d-grid mt-4">
            <a href="checkout.html" class="btn btn-warning btn-lg fw-bold py-2 shadow-sm">
              Proceed to Checkout <i class="bi bi-arrow-right ms-1"></i>
            </a>
          </div>

          <div class="text-center mt-3 text-muted" style="font-size: 0.8rem;">
            <i class="bi bi-shield-lock-fill text-success me-1"></i>Safe & Secure Demo Checkout
          </div>
        </div>
      </div>
    </div>
  `;
}

// Modify item quantity
async function changeQuantity(itemId, newQty) {
  if (newQty < 1) return;
  try {
    await apiRequest(`/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity: newQty })
    });
    loadCart();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Remove item
async function removeItem(itemId) {
  if (!confirm('Are you sure you want to remove this item from your cart?')) return;
  try {
    await apiRequest(`/cart/items/${itemId}`, {
      method: 'DELETE'
    });
    showToast('Item removed', 'info');
    loadCart();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Clear entire cart
async function clearCart() {
  if (!confirm('Are you sure you want to clear your entire cart?')) return;
  try {
    await apiRequest('/cart', {
      method: 'DELETE'
    });
    showToast('Cart cleared', 'info');
    loadCart();
  } catch (err) {
    showToast(err.message, 'error');
  }
}
