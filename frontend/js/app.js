/* ══════════════════════════════════════════════════════════
   App.js — Core Logic v11 (Native CSS 'left' property)
   ══════════════════════════════════════════════════════════ */

(function initApp() {
  'use strict';

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // ── Lenis Smooth Scrolling ──────────────────────────────
  const lenis = new Lenis({ duration: 1.6, smoothWheel: true, wheelMultiplier: 0.8 });
  function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => { lenis.raf(t * 1000); });
  gsap.ticker.lagSmoothing(0);

  // ── Custom Cursor ───────────────────────────────────────
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');
  if (cursor && follower) {
    let cx = 0, cy = 0, fx = 0, fy = 0;
    document.addEventListener('mousemove', e => { cx = e.clientX; cy = e.clientY; });
    (function tick() {
      fx += (cx - fx) * 0.12; fy += (cy - fy) * 0.12;
      cursor.style.cssText = `left:${cx}px;top:${cy}px`;
      follower.style.cssText = `left:${fx}px;top:${fy}px`;
      requestAnimationFrame(tick);
    })();
    document.querySelectorAll('a, button, .product-card, input').forEach(el => {
      el.addEventListener('mouseenter', () => { cursor.classList.add('hovering'); follower.classList.add('hovering'); });
      el.addEventListener('mouseleave', () => { cursor.classList.remove('hovering'); follower.classList.remove('hovering'); });
    });
  }

  // ── Navbar ─────────────────────────────────────────────
  const nav = document.getElementById('nav');
  if (nav) window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 60), { passive: true });

  // ── Mobile Menu ────────────────────────────────────────
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(l => l.addEventListener('click', () => {
      menuToggle.classList.remove('active'); mobileMenu.classList.remove('active'); document.body.style.overflow = '';
    }));
  }

  // ── Cart ───────────────────────────────────────────────
  const cartBtn = document.getElementById('cartBtn'), cartDrawer = document.getElementById('cartDrawer'),
        cartClose = document.getElementById('cartClose'), cartOverlay = document.getElementById('cartOverlay');
  function openCart() { cartDrawer?.classList.add('active'); cartOverlay?.classList.add('active'); }
  function closeCart() { cartDrawer?.classList.remove('active'); cartOverlay?.classList.remove('active'); }
  cartBtn?.addEventListener('click', openCart);
  cartClose?.addEventListener('click', closeCart);
  cartOverlay?.addEventListener('click', closeCart);

  // ── Newsletter ─────────────────────────────────────────
  const nf = document.getElementById('newsletterForm');
  if (nf) {
    nf.addEventListener('submit', async e => {
      e.preventDefault();
      const inp = nf.querySelector('input'), msgEl = document.getElementById('subscribeMsg'), btn = nf.querySelector('button');
      if (!inp.value) return;
      btn.textContent = '...'; btn.style.opacity = '0.7';
      try {
        const res = await api.post('/subscribe', { email: inp.value });
        if (msgEl) { msgEl.style.display = 'block'; msgEl.textContent = res?.error || res?.message || 'Thank you!'; msgEl.style.color = res?.error ? '#e74c3c' : 'var(--gold)'; if (!res?.error) inp.value = ''; }
      } catch { }
      btn.textContent = 'Subscribe'; btn.style.opacity = '1';
    });
  }

  // ══════════════════════════════════════════════════════════
  //  LUXURY 3-STEP ROTATING SHOWCASE (CSS 'left' Native)
  //
  //  Solves all GSAP matrix and width-measuring bugs natively 
  //  by directly sliding the native CSS `left` calc() property. 
  // ══════════════════════════════════════════════════════════

  const HOLD = 4500; // ms between animations
  
  function getResponsiveMetrics() {
    const w = window.innerWidth;
    if (w <= 500) return { visible: 1, gap: 16 };
    if (w <= 850) return { visible: 2, gap: 20 };
    if (w <= 1100) return { visible: 3, gap: 24 };
    return { visible: 4, gap: 24 };
  }

  function getSlotWidthStr(visible, gap) {
    if (visible === 1) return `100%`;
    const totalGap = gap * (visible - 1);
    return `calc((100% - ${totalGap}px) / ${visible})`;
  }

  function getSlotLeftStr(idx, visible, gap) {
    const pct = (idx * 100) / visible;
    const px = (idx * gap) / visible;
    return `calc(${pct}% + ${px}px)`;
  }

  function placeCard(el, idx, visible, gap) {
    gsap.set(el, { left: getSlotLeftStr(idx, visible, gap) });
  }

  function tweenCard(tl, el, label, idx, visible, gap, duration, ease, extras = {}) {
    tl.to(el, {
      left: getSlotLeftStr(idx, visible, gap),
      duration: duration,
      ease: ease,
      ...extras
    }, label);
  }

  function buildShowcase(wrapper, products) {
    if (!wrapper) return;

    if (!products || !products.length) {
      wrapper.innerHTML = '<div style="text-align:center;padding:80px 0;color:#5a5a5a;font-size:0.75rem;letter-spacing:0.3em;text-transform:uppercase;">◆<br><br>No products to display</div>';
      return;
    }

    wrapper.style.cssText = 'position:relative;width:100%;overflow:hidden;min-height:500px;perspective:1600px;transform-style:preserve-3d;';
    wrapper.innerHTML = '';

    const track = document.createElement('div');
    track.style.cssText = 'position:relative;width:100%;height:480px;';
    wrapper.appendChild(track);

    let m = getResponsiveMetrics();
    const showCount = Math.min(m.visible, products.length);

    let nextIdx = showCount % products.length;
    let pool = [];

    function makeWrap(prod, idx) {
      const w = document.createElement('div');
      w.className = 'showcase-slot-node';
      w.style.cssText = `
        position: absolute;
        top: 0;
        height: 100%;
        width: ${getSlotWidthStr(m.visible, m.gap)};
        will-change: left, opacity, transform;
      `;
      placeCard(w, idx, m.visible, m.gap);

      const card = createProductCard(prod);
      card.classList.remove('reveal-up');
      card.style.cssText = 'width:100%;height:100%;opacity:1!important;visibility:visible!important;background:var(--black-card);transition: transform 0.4s var(--ease-out-expo), box-shadow 0.4s ease;';
      
      w.appendChild(card);
      track.appendChild(w);
      return w;
    }

    for (let i = 0; i < showCount; i++) {
      const el = makeWrap(products[i], i);
      pool.push({ el, idx: i });
    }

    gsap.from(pool.map(p => p.el), {
      y: 40, opacity: 0, scale: 0.95, duration: 0.9, stagger: 0.1, ease: 'power2.out', delay: 0.2
    });

    if (products.length <= m.visible) return; // Not enough products to rotate

    let busy = false;
    let timer = null;

    function rotate() {
      if (busy) return;
      busy = true;

      m = getResponsiveMetrics();

      const leaving = pool[0];
      const stayers = pool.slice(1);
      const enterProd = products[nextIdx];

      const enterEl = makeWrap(enterProd, m.visible);
      gsap.set(enterEl, { opacity: 0, scale: 0.92, rotationY: 12 });

      const tl = gsap.timeline({
        onComplete: () => {
          leaving.el.remove();
          pool.shift();
          pool.push({ el: enterEl, idx: nextIdx });
          
          pool.forEach((p, i) => {
            p.el.style.width = getSlotWidthStr(m.visible, m.gap);
            placeCard(p.el, i, m.visible, m.gap);
            gsap.set(p.el, { rotationY: 0, scale: 1, opacity: 1 });
          });
          
          nextIdx = (nextIdx + 1) % products.length;
          busy = false;
        }
      });

      // 1. Exit left
      tweenCard(tl, leaving.el, null, -1, m.visible, m.gap, 0.9, 'power2.inOut', {
        opacity: 0, rotationY: -15, scale: 0.92
      });

      tl.addLabel('shift', '+=0.05');

      // 2. Shift remaining array
      stayers.forEach((p, i) => {
        tweenCard(tl, p.el, 'shift', i, m.visible, m.gap, 0.8, 'power2.inOut');
      });

      tl.addLabel('enter', '+=0.05');

      // 3. New enters exactly into last slot
      tweenCard(tl, enterEl, 'enter', m.visible - 1, m.visible, m.gap, 1.0, 'power2.out', {
        opacity: 1, scale: 1, rotationY: 0
      });
    }

    function startTimer() { timer = setInterval(rotate, HOLD); }
    function stopTimer()  { clearInterval(timer); timer = null; }

    startTimer();

    wrapper.addEventListener('mouseenter', stopTimer);
    wrapper.addEventListener('mouseleave', () => { if (!busy) startTimer(); });

    wrapper.addEventListener('mousemove', e => {
      if (busy) return;
      const r = wrapper.getBoundingClientRect();
      const my = ((e.clientY - r.top) / r.height - 0.5) * -7;
      pool.forEach(({ el }) => gsap.to(el, { rotationX: my, duration: 0.5, ease: 'power2.out', overwrite: 'auto' }));
    });
    wrapper.addEventListener('mouseleave', () => {
      pool.forEach(({ el }) => gsap.to(el, { rotationX: 0, duration: 0.6 }));
    });

    window.addEventListener('resize', () => {
      m = getResponsiveMetrics();
      pool.forEach((p, i) => {
        p.el.style.width = getSlotWidthStr(m.visible, m.gap);
        placeCard(p.el, i, m.visible, m.gap);
      });
    });
  }

  // ── Load homepage sections ────────────────────────────
  async function loadHomepageSections() {
    try {
      const data = await api.get('/products/homepage');
      if (!data) return;
      buildShowcase(document.querySelector('#specialOffers .showcase-wrapper'), data.specialOffers);
      buildShowcase(document.querySelector('#newArrivals .showcase-wrapper'),   data.newArrivals);
      buildShowcase(document.querySelector('#mostSold .showcase-wrapper'),      data.mostSold);
    } catch (err) {
      console.warn('Showcase error:', err);
    }
  }

  // ── Scroll reveal ─────────────────────────────────────
  function initReveal() {
    gsap.utils.toArray('.reveal-text').forEach(el => {
      gsap.fromTo(el, { opacity: 0, y: 28 }, {
        opacity: 1, y: 0, duration: 0.9, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 92%', once: true }
      });
    });
  }

  // ── Boot ──────────────────────────────────────────────
  if (typeof cart !== 'undefined') cart.updateUI();
  loadHomepageSections();
  initReveal();

  if (typeof api !== 'undefined') {
    api.get('/site-settings').then(settings => {
      if (settings && settings.subscriptionDiscountEnabled) {
        const desc = document.getElementById('newsletterDesc');
        if (desc) {
          desc.innerHTML = `Subscribe and get <strong style="color:var(--gold);">${settings.discountPercent}% off</strong> your first order. Be the first to discover new collections and exclusive offers.`;
        }
      }
    }).catch(e => console.warn('Failed to load site settings:', e));
  }
})();
