/* ══════════════════════════════════════════════════════════
   App.js — Core application logic
   ══════════════════════════════════════════════════════════ */

(function initApp() {
  'use strict';

  // ── Lenis Smooth Scrolling ──
  const lenis = new Lenis({
    duration: 1.6,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 0.8,
    touchMultiplier: 1.5,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Sync GSAP ScrollTrigger with Lenis
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);

  // ── Custom Cursor ──
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');

  if (cursor && follower) {
    let cx = 0, cy = 0, fx = 0, fy = 0;

    document.addEventListener('mousemove', (e) => {
      cx = e.clientX;
      cy = e.clientY;
    });

    function updateCursor() {
      fx += (cx - fx) * 0.12;
      fy += (cy - fy) * 0.12;
      cursor.style.left = cx + 'px';
      cursor.style.top = cy + 'px';
      follower.style.left = fx + 'px';
      follower.style.top = fy + 'px';
      requestAnimationFrame(updateCursor);
    }
    updateCursor();

    // Hover effects for interactive elements
    document.querySelectorAll('a, button, .product-card, .category-card, input').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('hovering');
        follower.classList.add('hovering');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('hovering');
        follower.classList.remove('hovering');
      });
    });
  }

  // ── Navbar Scroll Effect ──
  const nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    });
  }

  // ── Mobile Menu Toggle ──
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // ── Cart Drawer ──
  const cartBtn = document.getElementById('cartBtn');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartClose = document.getElementById('cartClose');
  const cartOverlay = document.getElementById('cartOverlay');

  function openCart() {
    cartDrawer?.classList.add('active');
    cartOverlay?.classList.add('active');
  }

  function closeCart() {
    cartDrawer?.classList.remove('active');
    cartOverlay?.classList.remove('active');
  }

  cartBtn?.addEventListener('click', openCart);
  cartClose?.addEventListener('click', closeCart);
  cartOverlay?.addEventListener('click', closeCart);

  // ── Newsletter Form ──
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = newsletterForm.querySelector('input');
      if (input.value) {
        input.value = '';
        alert('Thank you for subscribing! 💎');
      }
    });
  }

  // ── Load Featured Products ──
  async function loadFeatured() {
    const grid = document.getElementById('featuredGrid');
    if (!grid) return;

    try {
      const data = await api.getProducts({ featured: 'true', limit: 4 });
      console.log('Featured data:', data);
      if (data?.products?.length) {
        grid.innerHTML = '';
        data.products.forEach((p) => grid.appendChild(createProductCard(p)));
      } else {
        grid.innerHTML = '<p style="text-align:center;color:var(--gray);grid-column:1/-1;padding:40px;">No featured products yet. Mark products as Featured in the admin panel.</p>';
      }
    } catch (err) {
      console.warn('loadFeatured error:', err);
    }
  }

  // ── Load Trending Products ──
  async function loadTrending() {
    const slider = document.getElementById('trendingSlider');
    if (!slider) return;

    try {
      const data = await api.getProducts({ trending: 'true', limit: 6 });
      console.log('Trending data:', data);
      if (data?.products?.length) {
        slider.innerHTML = '';
        data.products.forEach((p) => slider.appendChild(createProductCard(p)));
      } else {
        slider.innerHTML = '<p style="text-align:center;color:var(--gray);width:100%;padding:40px;">No trending products yet. Mark products as Trending in the admin panel.</p>';
      }
    } catch (err) {
      console.warn('loadTrending error:', err);
    }
  }

  // ── Load Special Offers ──
  async function loadOffers() {
    const grid = document.getElementById('offersGrid');
    const staticOffers = document.getElementById('staticOffers');
    if (!grid) return;

    try {
      const data = await api.getProducts({ offer: 'true', limit: 6 });
      console.log('Offers data:', data);
      if (data?.products?.length) {
        // Hide static fallback cards, show dynamic ones
        if (staticOffers) staticOffers.style.display = 'none';
        grid.innerHTML = '';
        data.products.forEach((p) => {
          const discount = p.comparePrice && p.comparePrice > p.price
            ? Math.round((1 - p.price / p.comparePrice) * 100) + '% OFF'
            : 'SPECIAL';
          const imgSrc = p.images?.[0] || '';
          const isOutOfStock = p.stock !== undefined && p.stock <= 0;
          const card = document.createElement('div');
          card.className = 'offer-card reveal-up' + (isOutOfStock ? ' out-of-stock' : '');
          card.innerHTML = `
            <div class="offer-card__badge">${discount}</div>
            ${isOutOfStock ? '<div class="offer-card__sold-out">SOLD OUT</div>' : ''}
            ${imgSrc ? `<div class="offer-card__img"><img src="${imgSrc}" alt="${p.name}" /></div>` : `<div class="offer-card__icon">💎</div>`}
            <h3 class="offer-card__title">${p.name}</h3>
            <p class="offer-card__desc">${p.description || 'Limited time offer on this exclusive piece.'}</p>
            <div class="offer-card__price">
              <span class="offer-card__price-current">$${p.price.toLocaleString()}</span>
              ${p.comparePrice && p.comparePrice > p.price ? `<span class="offer-card__price-compare">$${p.comparePrice.toLocaleString()}</span>` : ''}
            </div>
            <a href="product.html?slug=${p.slug}" class="btn btn--primary" ${isOutOfStock ? 'style="pointer-events:none;opacity:0.5"' : ''}>Shop Now</a>
          `;
          grid.appendChild(card);
        });
      } else {
        // No dynamic offers — show static fallback cards
        grid.innerHTML = '';
        if (staticOffers) staticOffers.style.display = '';
      }
    } catch (err) {
      console.warn('loadOffers error:', err);
    }
  }

  // ── Scroll Indicator Animation ──
  function initScrollIndicator() {
    const indicator = document.querySelector('.hero__scroll-indicator');
    if (indicator) {
      gsap.to(indicator, {
        y: 10,
        opacity: 0.6,
        duration: 1.2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
    }
  }

  // ── Initialize ──
  cart.updateUI();
  loadFeatured();
  loadTrending();
  loadOffers();
  initScrollIndicator();

  // ── Real-Time Auto-Refresh (every 10 seconds) ──
  setInterval(() => {
    loadFeatured();
    loadTrending();
    loadOffers();
  }, 10000);

  // Also refresh when page becomes visible (tab switch back)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      loadFeatured();
      loadTrending();
      loadOffers();
    }
  });

})();
