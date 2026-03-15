/* ══════════════════════════════════════════════════════════
   API Helper — Fetch products, categories, etc.
   ══════════════════════════════════════════════════════════ */

const API_BASE = window.location.port === '5173' ? 'http://localhost:5000/api' : '/api';

const api = {
  async get(endpoint) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`API fetch failed (${endpoint}):`, err.message);
      return null;
    }
  },

  async post(endpoint, data) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`API post failed (${endpoint}):`, err.message);
      return null;
    }
  },

  // Product endpoints
  getProducts(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.get(`/products${qs ? '?' + qs : ''}`);
  },
  getProductBySlug(slug) { return this.get(`/products/slug/${slug}`); },
  getProductById(id) { return this.get(`/products/${id}`); },
  getCategories() { return this.get('/categories'); },

  // Orders
  createOrder(orderData) { return this.post('/orders', orderData); },
};

/* ═══════ Cart (localStorage) ═══════ */
const cart = {
  KEY: 'luxe_cart',

  getItems() {
    return JSON.parse(localStorage.getItem(this.KEY) || '[]');
  },

  save(items) {
    localStorage.setItem(this.KEY, JSON.stringify(items));
    this.updateUI();
  },

  addItem(product, qty = 1) {
    const items = this.getItems();
    const existing = items.find((i) => i.id === product.id);
    if (existing) {
      existing.qty += qty;
    } else {
      items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        slug: product.slug,
        qty,
      });
    }
    this.save(items);

    // Visual feedback
    const countEl = document.getElementById('cartCount');
    if (countEl) {
      countEl.style.transform = 'scale(1.4)';
      setTimeout(() => { countEl.style.transform = 'scale(1)'; }, 300);
    }
  },

  removeItem(id) {
    this.save(this.getItems().filter((i) => i.id !== id));
  },

  updateQty(id, qty) {
    const items = this.getItems();
    const item = items.find((i) => i.id === id);
    if (item) {
      item.qty = Math.max(1, qty);
      this.save(items);
    }
  },

  getTotal() {
    return this.getItems().reduce((sum, i) => sum + i.price * i.qty, 0);
  },

  getCount() {
    return this.getItems().reduce((sum, i) => sum + i.qty, 0);
  },

  clear() {
    localStorage.removeItem(this.KEY);
    this.updateUI();
  },

  updateUI() {
    const countEl = document.getElementById('cartCount');
    if (countEl) countEl.textContent = this.getCount();

    const totalEl = document.getElementById('cartTotal');
    if (totalEl) totalEl.textContent = `$${this.getTotal().toLocaleString()}`;

    this.renderDrawer();
  },

  renderDrawer() {
    const container = document.getElementById('cartItems');
    if (!container) return;

    const items = this.getItems();
    if (!items.length) {
      container.innerHTML = '<p class="cart-drawer__empty">Your cart is empty</p>';
      return;
    }

    container.innerHTML = items
      .map(
        (item) => `
      <div class="cart-item">
        <div class="cart-item__image"><img src="${item.image}" alt="${item.name}" /></div>
        <div class="cart-item__info">
          <div class="cart-item__name">${item.name}</div>
          <div class="cart-item__price">$${item.price.toLocaleString()}</div>
          <div class="cart-item__qty">
            <button onclick="cart.updateQty('${item.id}', ${item.qty - 1})">−</button>
            <span>${item.qty}</span>
            <button onclick="cart.updateQty('${item.id}', ${item.qty + 1})">+</button>
          </div>
        </div>
        <button class="cart-item__remove" onclick="cart.removeItem('${item.id}')">&times;</button>
      </div>`
      )
      .join('');
  },
};

/* ═══════ Product Card HTML Generator ═══════ */
function createProductCard(product) {
  const stars = '★'.repeat(Math.round(product.rating || 0)) + '☆'.repeat(5 - Math.round(product.rating || 0));
  const badge = product.trending ? 'Trending' : product.featured ? 'Featured' : product.offer ? 'Offer' : '';
  const compareHTML = product.comparePrice && product.comparePrice > product.price
    ? `<span class="product-card__price-compare">$${product.comparePrice.toLocaleString()}</span>` : '';

  const imgSrc = product.images?.[0] || '';
  const getFullImgPath = (p) => {
    if (!p) return '/images/placeholder.jpg';
    if (p.startsWith('http')) return p;
    return p; // Browser resolves relative paths like /uploads/... correctly relative to the root
  };

  const imgHTML = imgSrc 
    ? `<img src="${getFullImgPath(imgSrc)}" alt="${product.name}" loading="lazy" />`
    : `<div class="product-card__placeholder">💎</div>`;

  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  // Safely encode product data to avoid issues with special chars in names
  const safeId = product._id;
  const safeName = (product.name || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
  const safeSlug = product.slug || '';
  const safeImg = (imgSrc).replace(/'/g, "\\'");

  const card = document.createElement('a');
  card.href = isOutOfStock ? 'javascript:void(0)' : `product.html?slug=${product.slug}`;
  card.className = 'product-card reveal-up' + (isOutOfStock ? ' out-of-stock' : '');
  card.innerHTML = `
    <div class="product-card__image">
      ${imgHTML}
      ${badge ? `<span class="product-card__badge">${badge}</span>` : ''}
      ${!isOutOfStock ? `<button class="product-card__quick" data-product-id="${safeId}" data-product-name="${safeName}" data-product-price="${product.price}" data-product-image="${safeImg}" data-product-slug="${safeSlug}">Add to Cart</button>` : ''}
    </div>
    <div class="product-card__info">
      <div class="product-card__category">${product.category}</div>
      <div class="product-card__name">${product.name}</div>
      <div class="product-card__price">
        <span class="product-card__price-current">$${product.price.toLocaleString()}</span>
        ${compareHTML}
      </div>
      <div class="product-card__rating">
        <span class="product-card__stars">${stars}</span>
        <span>(${product.reviewCount || 0})</span>
      </div>
      ${isOutOfStock ? '<div style="color:#ff4444;font-weight:600;font-size:0.8rem;letter-spacing:0.1em;margin-top:4px;">OUT OF STOCK</div>' : ''}
    </div>`;

  // Attach event listener for the Add to Cart button
  if (!isOutOfStock) {
    const addBtn = card.querySelector('.product-card__quick');
    if (addBtn) {
      addBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        cart.addItem({
          id: this.dataset.productId,
          name: this.dataset.productName,
          price: Number(this.dataset.productPrice),
          image: this.dataset.productImage,
          slug: this.dataset.productSlug,
        });
      });
    }
  }

  return card;
}
