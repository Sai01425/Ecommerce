/**
 * Checkout and Demo Payment Processing
 */

let currentCart = null;

document.addEventListener('DOMContentLoaded', () => {
  if (requireAuth('checkout.html')) {
    initCheckout();
  }
});

async function initCheckout() {
  prefillUserInfo();
  await loadCheckoutSummary();
  setupCheckoutForm();
}

// Prefill known profile info
function prefillUserInfo() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user) {
    const nameInput = document.getElementById('shipFullName');
    const phoneInput = document.getElementById('shipPhone');
    if (nameInput && user.name) nameInput.value = user.name;
    if (phoneInput && user.phone) phoneInput.value = user.phone;
  }
}

// Load cart items into the checkout sidebar
async function loadCheckoutSummary() {
  const summaryItems = document.getElementById('checkoutItemsList');
  const subtotalEl = document.getElementById('checkoutSubtotal');
  const discountEl = document.getElementById('checkoutDiscount');
  const shippingEl = document.getElementById('checkoutShipping');
  const totalEl = document.getElementById('checkoutTotal');

  try {
    const res = await apiRequest('/cart');
    currentCart = res.data;

    if (!currentCart || !currentCart.items || currentCart.items.length === 0) {
      alert('Your cart is empty. Please add items before checking out.');
      window.location.href = 'products.html';
      return;
    }

    if (summaryItems) {
      summaryItems.innerHTML = currentCart.items.map(item => `
        <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
          <div class="d-flex align-items-center gap-2">
            <span class="badge bg-secondary rounded-pill">${item.quantity}x</span>
            <span class="small fw-semibold text-truncate" style="max-width: 170px;">${item.productName}</span>
          </div>
          <span class="small fw-bold">${formatCurrency(item.subtotal)}</span>
        </div>
      `).join('');
    }

    if (subtotalEl) subtotalEl.textContent = formatCurrency(currentCart.subtotal);
    if (discountEl) discountEl.textContent = `-${formatCurrency(currentCart.totalDiscount)}`;
    if (shippingEl) shippingEl.innerHTML = currentCart.shippingFee == 0 ? '<strong class="text-success">FREE</strong>' : formatCurrency(currentCart.shippingFee);
    if (totalEl) totalEl.textContent = formatCurrency(currentCart.totalAmount);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Setup Form Submission
function setupCheckoutForm() {
  const form = document.getElementById('checkoutForm');
  if (!form) return;

  // Toggle mock card details when payment method changes
  const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
  const cardDetailsBox = document.getElementById('mockCardDetailsBox');
  const upiDetailsBox = document.getElementById('mockUpiDetailsBox');

  paymentRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (cardDetailsBox) cardDetailsBox.classList.toggle('d-none', e.target.value !== 'DEMO_CARD');
      if (upiDetailsBox) upiDetailsBox.classList.toggle('d-none', e.target.value !== 'DEMO_UPI');
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('btnPlaceOrder');
    const alertBox = document.getElementById('checkoutAlert');
    if (alertBox) alertBox.classList.add('d-none');

    const fullName = document.getElementById('shipFullName').value.trim();
    const phone = document.getElementById('shipPhone').value.trim();
    const streetAddress = document.getElementById('shipStreet').value.trim();
    const city = document.getElementById('shipCity').value.trim();
    const state = document.getElementById('shipState').value.trim();
    const zipCode = document.getElementById('shipZip').value.trim();
    const country = document.getElementById('shipCountry').value.trim() || 'India';

    const selectedPaymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'DEMO_CARD';

    const orderPayload = {
      shippingAddress: {
        fullName,
        phone,
        streetAddress,
        city,
        state,
        zipCode,
        country
      },
      paymentMethod: selectedPaymentMethod
    };

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing Demo Order...';
    }

    try {
      const res = await apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify(orderPayload)
      });

      const order = res.data;
      updateCartBadge();
      showOrderSuccessModal(order);
    } catch (err) {
      if (alertBox) {
        alertBox.textContent = err.message || 'Failed to place order';
        alertBox.classList.remove('d-none');
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="bi bi-shield-check me-2"></i>Pay & Place Order';
      }
    }
  });
}

function showOrderSuccessModal(order) {
  const modalEl = document.getElementById('orderSuccessModal');
  if (modalEl) {
    document.getElementById('modalOrderNumber').textContent = order.orderNumber;
    document.getElementById('modalOrderTotal').textContent = formatCurrency(order.totalAmount);
    document.getElementById('modalOrderAddress').textContent = `${order.shippingAddress.streetAddress}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zipCode}`;

    const modal = new bootstrap.Modal(modalEl, { backdrop: 'static', keyboard: false });
    modal.show();
  } else {
    alert(`Order Placed Successfully!\nOrder ID: ${order.orderNumber}\nTotal: ${formatCurrency(order.totalAmount)}`);
    window.location.href = 'orders.html';
  }
}
