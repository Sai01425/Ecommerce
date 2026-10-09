/**
 * Product Details Page Logic
 */

let currentProduct = null;
let selectedQuantity = 1;

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');

  if (!productId) {
    showErrorState('Product ID is missing.');
    return;
  }

  loadProductDetails(productId);
});

// Fetch and display product
async function loadProductDetails(id) {
  const container = document.getElementById('productDetailsContainer');
  if (!container) return;

  try {
    const res = await apiRequest(`/products/${id}`);
    currentProduct = res.data;

    renderProductView(currentProduct);
    loadRelatedProducts(currentProduct.id);
  } catch (err) {
    showErrorState(err.message || 'Product not found.');
  }
}

function renderProductView(p) {
  const container = document.getElementById('productDetailsContainer');
  const imgUrl = p.imageUrl || DEFAULT_PRODUCT_IMAGE;
  const hasDiscount = p.discountPercent > 0;
  const inStock = p.stockQuantity > 0;

  // Update Breadcrumb
  const breadcrumbCategory = document.getElementById('breadcrumbCategory');
  const breadcrumbProduct = document.getElementById('breadcrumbProduct');
  if (breadcrumbCategory && p.category) {
    breadcrumbCategory.textContent = p.category.name;
    breadcrumbCategory.href = `products.html?categoryId=${p.category.id}`;
  }
  if (breadcrumbProduct) {
    breadcrumbProduct.textContent = p.name;
  }

  // Stock status pill
  let stockBadgeHtml = '';
  if (p.stockQuantity > 10) {
    stockBadgeHtml = `<span class="stock-badge in-stock"><i class="bi bi-check-circle me-1"></i>In Stock (${p.stockQuantity} available)</span>`;
  } else if (p.stockQuantity > 0) {
    stockBadgeHtml = `<span class="stock-badge low-stock"><i class="bi bi-exclamation-circle me-1"></i>Only ${p.stockQuantity} left in stock!</span>`;
  } else {
    stockBadgeHtml = `<span class="stock-badge out-of-stock"><i class="bi bi-x-circle me-1"></i>Currently Out of Stock</span>`;
  }

  // Savings calculation
  let savingsHtml = '';
  if (hasDiscount) {
    const savings = p.price - p.discountedPrice;
    savingsHtml = `<div class="text-success small fw-bold mt-1">You save ${formatCurrency(savings)} (${p.discountPercent}%)</div>`;
  }

  container.innerHTML = `
    <div class="row g-4">
      <!-- Product Image Column -->
      <div class="col-lg-6">
        <div class="details-image-container">
          <img id="mainProductImg" src="${imgUrl}" alt="${p.name}" onerror="this.onerror=null;this.src='${DEFAULT_PRODUCT_IMAGE}'">
        </div>
      </div>

      <!-- Product Info Column -->
      <div class="col-lg-6">
        <div class="details-info-card">
          <div class="text-uppercase text-muted fw-bold small mb-1">${p.category ? p.category.name : 'Category'}</div>
          <h2 class="fw-bold mb-2">${p.name}</h2>

          <div class="d-flex align-items-center gap-3 mb-3">
            <div class="product-rating mb-0">
              <span class="rating-stars">${renderStars(p.rating)}</span>
              <span class="fw-bold ms-1">${p.rating}</span>
              <span class="rating-count ms-1">(${p.reviewCount} customer ratings)</span>
            </div>
            <span class="text-muted">|</span>
            ${stockBadgeHtml}
          </div>

          <hr class="my-3">

          <!-- Price Display -->
          <div class="mb-3">
            <div class="d-flex align-items-baseline gap-2">
              <span class="fs-2 fw-bold text-dark">${formatCurrency(p.discountedPrice)}</span>
              ${hasDiscount ? `<span class="text-decoration-line-through text-muted fs-5">${formatCurrency(p.price)}</span>` : ''}
              ${hasDiscount ? `<span class="badge bg-danger ms-2">${p.discountPercent}% OFF</span>` : ''}
            </div>
            ${savingsHtml}
            <div class="text-muted small mt-1"><i class="bi bi-shield-check text-success me-1"></i>Inclusive of all applicable demo taxes</div>
          </div>

          <div class="mb-4">
            <h6 class="fw-bold mb-2">Description</h6>
            <p class="text-muted leading-relaxed">${p.description}</p>
          </div>

          <!-- Quantity and Buttons -->
          ${inStock ? `
            <div class="row align-items-center g-3 mb-4">
              <div class="col-auto">
                <label class="form-label fw-bold small text-muted mb-1">Quantity</label>
                <div class="qty-stepper d-block">
                  <button type="button" id="btnQtyMinus" ${selectedQuantity <= 1 ? 'disabled' : ''}>-</button>
                  <input type="text" id="inputQty" value="${selectedQuantity}" readonly>
                  <button type="button" id="btnQtyPlus" ${selectedQuantity >= p.stockQuantity ? 'disabled' : ''}>+</button>
                </div>
              </div>
            </div>

            <div class="d-flex flex-wrap gap-3">
              <button class="btn btn-warning btn-lg fw-bold px-4 py-2 flex-grow-1" id="btnDetailsAddToCart">
                <i class="bi bi-cart-plus me-2"></i>Add to Cart
              </button>
              <button class="btn btn-primary btn-lg fw-bold px-4 py-2 flex-grow-1" id="btnDetailsBuyNow">
                <i class="bi bi-lightning-charge me-2"></i>Buy Now
              </button>
            </div>
          ` : `
            <div class="alert alert-warning mb-0">
              <i class="bi bi-bell me-2"></i>This item is currently sold out. Please check back later.
            </div>
          `}

          <!-- Trust points -->
          <div class="row text-center mt-4 pt-3 border-top g-2">
            <div class="col-4">
              <i class="bi bi-truck fs-4 text-primary"></i>
              <div class="small fw-semibold mt-1">Free Delivery</div>
              <div class="text-muted" style="font-size: 0.75rem;">Orders ₹500+</div>
            </div>
            <div class="col-4">
              <i class="bi bi-arrow-repeat fs-4 text-primary"></i>
              <div class="small fw-semibold mt-1">7 Days Return</div>
              <div class="text-muted" style="font-size: 0.75rem;">Hassle-free</div>
            </div>
            <div class="col-4">
              <i class="bi bi-shield-lock fs-4 text-primary"></i>
              <div class="small fw-semibold mt-1">Safe Mock Pay</div>
              <div class="text-muted" style="font-size: 0.75rem;">Demo Secure</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `;

  // Attach Quantity Stepper handlers
  if (inStock) {
    const btnMinus = document.getElementById('btnQtyMinus');
    const btnPlus = document.getElementById('btnQtyPlus');
    const inputQty = document.getElementById('inputQty');

    btnMinus.addEventListener('click', () => {
      if (selectedQuantity > 1) {
        selectedQuantity--;
        inputQty.value = selectedQuantity;
        btnPlus.disabled = false;
        if (selectedQuantity <= 1) btnMinus.disabled = true;
      }
    });

    btnPlus.addEventListener('click', () => {
      if (selectedQuantity < p.stockQuantity) {
        selectedQuantity++;
        inputQty.value = selectedQuantity;
        btnMinus.disabled = false;
        if (selectedQuantity >= p.stockQuantity) btnPlus.disabled = true;
      }
    });

    // Add to Cart handler
    document.getElementById('btnDetailsAddToCart').addEventListener('click', () => {
      handleAddToCart(p.id, selectedQuantity);
    });

    // Buy Now handler
    document.getElementById('btnDetailsBuyNow').addEventListener('click', async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('Please sign in to proceed to checkout', 'warning');
        setTimeout(() => {
          window.location.href = `login.html?redirect=checkout.html`;
        }, 1000);
        return;
      }
      try {
        await apiRequest('/cart/items', {
          method: 'POST',
          body: JSON.stringify({ productId: p.id, quantity: selectedQuantity })
        });
        window.location.href = 'checkout.html';
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }
}

// Load Related Products
async function loadRelatedProducts(productId) {
  const container = document.getElementById('relatedProductsGrid');
  if (!container) return;

  try {
    const res = await apiRequest(`/products/${productId}/related`);
    if (res && res.data && res.data.length > 0) {
      document.getElementById('relatedProductsSection').classList.remove('d-none');
      container.innerHTML = res.data.map(p => `
        <div class="col-sm-6 col-md-4 col-lg-3 mb-4">
          <div class="product-card">
            <div class="product-img-box" style="height: 180px;">
              <img src="${p.imageUrl || DEFAULT_PRODUCT_IMAGE}" alt="${p.name}" onerror="this.onerror=null;this.src='${DEFAULT_PRODUCT_IMAGE}'">
            </div>
            <div class="product-body">
              <a href="product-details.html?id=${p.id}" class="product-title" style="min-height: 2.4rem;">${p.name}</a>
              <div class="product-pricing mt-2 mb-2">
                <span class="price-final">${formatCurrency(p.discountedPrice)}</span>
              </div>
              <div class="product-actions mt-auto">
                <button class="btn btn-add-cart" onclick="handleAddToCart(${p.id}, 1)">
                  <i class="bi bi-cart-plus"></i> Add
                </button>
                <a href="product-details.html?id=${p.id}" class="btn btn-view-product">
                  <i class="bi bi-eye"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      `).join('');
    }
  } catch (err) {
    console.warn('Failed to load related products', err);
  }
}

function showErrorState(message) {
  const container = document.getElementById('productDetailsContainer');
  if (container) {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="bi bi-exclamation-circle fs-1 text-danger"></i>
        <h3 class="mt-3">Product Unavailable</h3>
        <p class="text-muted">${message}</p>
        <a href="products.html" class="btn btn-primary mt-2">Return to Products</a>
      </div>
    `;
  }
}
