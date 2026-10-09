/**
 * Product Listing, Search, Filters, and Pagination
 */

let currentPage = 0;
const pageSize = 9;
let currentCategoryId = null;
let currentKeyword = '';
let currentMinPrice = null;
let currentMaxPrice = null;
let currentSortBy = 'id';
let currentSortDir = 'desc';

document.addEventListener('DOMContentLoaded', () => {
  parseQueryParams();
  loadCategoriesFilter();
  loadProducts();
  setupFilterListeners();
});

// Parse initial URL query parameters
function parseQueryParams() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('keyword')) {
    currentKeyword = params.get('keyword');
    const searchInput = document.getElementById('filterSearchInput');
    if (searchInput) searchInput.value = currentKeyword;
  }
  if (params.get('categoryId')) {
    currentCategoryId = params.get('categoryId');
  }
  if (params.get('minPrice')) {
    currentMinPrice = params.get('minPrice');
  }
  if (params.get('maxPrice')) {
    currentMaxPrice = params.get('maxPrice');
  }
}

// Load Categories for the sidebar filter
async function loadCategoriesFilter() {
  const container = document.getElementById('categoryFilterList');
  if (!container) return;

  try {
    const res = await apiRequest('/categories');
    if (res && res.data) {
      let html = `
        <div class="form-check mb-2">
          <input class="form-check-input category-radio" type="radio" name="categoryFilter" id="catAll" value="" ${!currentCategoryId ? 'checked' : ''}>
          <label class="form-check-label" for="catAll">All Categories</label>
        </div>
      `;

      res.data.forEach(cat => {
        const isChecked = currentCategoryId && currentCategoryId.toString() === cat.id.toString();
        html += `
          <div class="form-check mb-2">
            <input class="form-check-input category-radio" type="radio" name="categoryFilter" id="cat_${cat.id}" value="${cat.id}" ${isChecked ? 'checked' : ''}>
            <label class="form-check-label d-flex justify-content-between" for="cat_${cat.id}">
              <span>${cat.name}</span>
              <span class="text-muted small">(${cat.productCount})</span>
            </label>
          </div>
        `;
      });

      container.innerHTML = html;

      // Add change listeners
      document.querySelectorAll('.category-radio').forEach(radio => {
        radio.addEventListener('change', (e) => {
          currentCategoryId = e.target.value || null;
          currentPage = 0;
          updateUrlAndReload();
        });
      });
    }
  } catch (err) {
    console.error('Failed to load categories', err);
  }
}

// Load and Render Products
async function loadProducts() {
  const grid = document.getElementById('productsGrid');
  const countDisplay = document.getElementById('productResultsCount');
  const pagination = document.getElementById('paginationContainer');

  if (!grid) return;

  grid.innerHTML = `
    <div class="col-12 text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading products...</span>
      </div>
      <p class="mt-2 text-muted">Discovering great products...</p>
    </div>
  `;

  try {
    let endpoint = `/products?page=${currentPage}&size=${pageSize}&sortBy=${currentSortBy}&sortDir=${currentSortDir}`;
    if (currentCategoryId) endpoint += `&categoryId=${currentCategoryId}`;
    if (currentKeyword) endpoint += `&keyword=${encodeURIComponent(currentKeyword)}`;
    if (currentMinPrice) endpoint += `&minPrice=${currentMinPrice}`;
    if (currentMaxPrice) endpoint += `&maxPrice=${currentMaxPrice}`;

    const res = await apiRequest(endpoint);
    const pageData = res.data;

    if (countDisplay) {
      countDisplay.textContent = `Showing ${pageData.numberOfElements} of ${pageData.totalElements} products`;
    }

    if (!pageData.content || pageData.content.length === 0) {
      grid.innerHTML = `
        <div class="col-12 text-center py-5">
          <i class="bi bi-search fs-1 text-muted"></i>
          <h4 class="mt-3">No products found</h4>
          <p class="text-muted">Try adjusting your filters or search keywords.</p>
          <button class="btn btn-primary" onclick="resetFilters()">Reset All Filters</button>
        </div>
      `;
      if (pagination) pagination.innerHTML = '';
      return;
    }

    grid.innerHTML = pageData.content.map(p => createProductCardHtml(p)).join('');

    // Attach Add to Cart listeners
    grid.querySelectorAll('.btn-add-cart-action').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const pid = e.currentTarget.getAttribute('data-product-id');
        handleAddToCart(pid, 1);
      });
    });

    renderPagination(pageData);
  } catch (err) {
    grid.innerHTML = `
      <div class="col-12 text-center py-5 text-danger">
        <i class="bi bi-exclamation-triangle fs-1"></i>
        <h5 class="mt-3">Unable to load products</h5>
        <p>${err.message}</p>
        <button class="btn btn-outline-primary" onclick="loadProducts()">Try Again</button>
      </div>
    `;
  }
}

// Generate single product card HTML
function createProductCardHtml(p) {
  const imgUrl = p.imageUrl || DEFAULT_PRODUCT_IMAGE;
  const hasDiscount = p.discountPercent > 0;

  return `
    <div class="col-sm-6 col-lg-4 mb-4">
      <div class="product-card">
        <div class="product-badge-group">
          ${hasDiscount ? `<span class="badge-discount">${p.discountPercent}% OFF</span>` : ''}
          ${p.featured ? `<span class="badge-featured">Featured</span>` : ''}
        </div>
        <div class="product-img-box">
          <img src="${imgUrl}" alt="${p.name}" onerror="this.onerror=null;this.src='${DEFAULT_PRODUCT_IMAGE}'">
        </div>
        <div class="product-body">
          <div class="product-category-tag">${p.category ? p.category.name : 'Store'}</div>
          <a href="product-details.html?id=${p.id}" class="product-title" title="${p.name}">${p.name}</a>
          <div class="product-rating">
            <span class="rating-stars">${renderStars(p.rating)}</span>
            <span class="rating-count">(${p.reviewCount})</span>
          </div>
          <div class="product-pricing">
            <span class="price-final">${formatCurrency(p.discountedPrice)}</span>
            ${hasDiscount ? `<span class="price-orig">${formatCurrency(p.price)}</span>` : ''}
          </div>
          <div class="product-actions">
            <button class="btn btn-add-cart btn-add-cart-action" data-product-id="${p.id}">
              <i class="bi bi-cart-plus"></i> Add
            </button>
            <a href="product-details.html?id=${p.id}" class="btn btn-view-product" title="View Details">
              <i class="bi bi-eye"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Render pagination links
function renderPagination(pageData) {
  const container = document.getElementById('paginationContainer');
  if (!container || pageData.totalPages <= 1) {
    if (container) container.innerHTML = '';
    return;
  }

  let html = `<ul class="pagination justify-content-center">`;

  // Previous button
  html += `
    <li class="page-item ${pageData.first ? 'disabled' : ''}">
      <button class="page-link" onclick="goToPage(${currentPage - 1})" aria-label="Previous">
        <span aria-hidden="true">&laquo; Prev</span>
      </button>
    </li>
  `;

  // Page Numbers
  for (let i = 0; i < pageData.totalPages; i++) {
    html += `
      <li class="page-item ${i === currentPage ? 'active' : ''}">
        <button class="page-link" onclick="goToPage(${i})">${i + 1}</button>
      </li>
    `;
  }

  // Next button
  html += `
    <li class="page-item ${pageData.last ? 'disabled' : ''}">
      <button class="page-link" onclick="goToPage(${currentPage + 1})" aria-label="Next">
        <span aria-hidden="true">Next &raquo;</span>
      </button>
    </li>
  `;

  html += `</ul>`;
  container.innerHTML = html;
}

function goToPage(page) {
  currentPage = page;
  loadProducts();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Setup Event Listeners for Filters
function setupFilterListeners() {
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val === 'price_asc') {
        currentSortBy = 'price';
        currentSortDir = 'asc';
      } else if (val === 'price_desc') {
        currentSortBy = 'price';
        currentSortDir = 'desc';
      } else if (val === 'rating') {
        currentSortBy = 'rating';
        currentSortDir = 'desc';
      } else if (val === 'newest') {
        currentSortBy = 'newest';
        currentSortDir = 'desc';
      } else {
        currentSortBy = 'id';
        currentSortDir = 'desc';
      }
      currentPage = 0;
      loadProducts();
    });
  }

  const priceFilterForm = document.getElementById('priceFilterForm');
  if (priceFilterForm) {
    priceFilterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const min = document.getElementById('minPriceInput').value;
      const max = document.getElementById('maxPriceInput').value;
      currentMinPrice = min ? min : null;
      currentMaxPrice = max ? max : null;
      currentPage = 0;
      updateUrlAndReload();
    });
  }

  const searchFilterForm = document.getElementById('filterSearchForm');
  if (searchFilterForm) {
    searchFilterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const kw = document.getElementById('filterSearchInput').value.trim();
      currentKeyword = kw;
      currentPage = 0;
      updateUrlAndReload();
    });
  }
}

function resetFilters() {
  currentCategoryId = null;
  currentKeyword = '';
  currentMinPrice = null;
  currentMaxPrice = null;
  currentSortBy = 'id';
  currentSortDir = 'desc';
  currentPage = 0;

  const kwInput = document.getElementById('filterSearchInput');
  if (kwInput) kwInput.value = '';
  const minInput = document.getElementById('minPriceInput');
  if (minInput) minInput.value = '';
  const maxInput = document.getElementById('maxPriceInput');
  if (maxInput) maxInput.value = '';

  const catAll = document.getElementById('catAll');
  if (catAll) catAll.checked = true;

  updateUrlAndReload();
}

function updateUrlAndReload() {
  const url = new URL(window.location.href);
  if (currentCategoryId) url.searchParams.set('categoryId', currentCategoryId);
  else url.searchParams.delete('categoryId');

  if (currentKeyword) url.searchParams.set('keyword', currentKeyword);
  else url.searchParams.delete('keyword');

  if (currentMinPrice) url.searchParams.set('minPrice', currentMinPrice);
  else url.searchParams.delete('minPrice');

  if (currentMaxPrice) url.searchParams.set('maxPrice', currentMaxPrice);
  else url.searchParams.delete('maxPrice');

  window.history.pushState({}, '', url);
  loadProducts();
}
