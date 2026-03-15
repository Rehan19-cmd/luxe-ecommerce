/* ══════════════════════════════════════════════════════════
   GSAP + ScrollTrigger Animations — Full Rewrite
   ══════════════════════════════════════════════════════════ */

(function initAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  // ── Loader Animation ──
  const loader = document.getElementById('loader');
  if (loader) {
    const tl = gsap.timeline();
    tl.to('.loader__diamond', { rotation: 405, duration: 1.2, ease: 'power2.inOut' })
      .to('.loader__text', { opacity: 0, y: -20, duration: 0.4 }, '-=0.5')
      .to('.loader__diamond', { scale: 0, opacity: 0, duration: 0.5 }, '-=0.3')
      .to(loader, {
        yPercent: -100,
        duration: 0.8,
        ease: 'power4.inOut',
        onComplete: () => { loader.style.display = 'none'; },
      })
      .from('.nav', { y: -80, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.4');
  }

  // ── Helper: Animate a single reveal element ──
  function revealElement(el, type, delay) {
    if (el.dataset.gsapRevealed) return; // prevent double-animation
    el.dataset.gsapRevealed = 'true';

    const fromVars = type === 'text'
      ? { opacity: 0, y: 30 }
      : { opacity: 0, y: 50 };

    gsap.fromTo(el, fromVars, {
      scrollTrigger: {
        trigger: el,
        start: 'top 92%',
        toggleActions: 'play none none none',
      },
      opacity: 1,
      y: 0,
      duration: type === 'text' ? 1 : 0.8,
      delay: delay || 0,
      ease: 'power3.out',
    });
  }

  // ── Reveal all existing elements on page load ──
  function revealExisting() {
    document.querySelectorAll('.reveal-text').forEach((el) => revealElement(el, 'text', 0));
    document.querySelectorAll('.reveal-up').forEach((el, i) => revealElement(el, 'up', (i % 4) * 0.1));
  }
  revealExisting();

  // ── MutationObserver: auto-reveal dynamically-added cards ──
  // Watch ALL dynamic grids: featured, offers, trending, collection
  const dynamicContainers = document.querySelectorAll(
    '#featuredGrid, #offersGrid, #trendingSlider, .collection-grid__inner'
  );
  dynamicContainers.forEach((container) => {
    const observer = new MutationObserver(() => {
      const cards = container.querySelectorAll('.product-card, .offer-card, .reveal-up');
      cards.forEach((card, i) => {
        if (card.dataset.gsapRevealed) return;
        card.dataset.gsapRevealed = 'true';
        gsap.fromTo(
          card,
          { opacity: 0, y: 40, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            delay: i * 0.08,
            ease: 'power3.out',
          }
        );
      });
    });
    observer.observe(container, { childList: true });
  });

  // ── Parallax Banner Background ──
  const parallaxBg = document.querySelector('.parallax-banner__bg');
  if (parallaxBg) {
    gsap.to(parallaxBg, {
      scrollTrigger: {
        trigger: '.parallax-banner',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5,
      },
      yPercent: 20,
      ease: 'none',
    });
  }

  // ── Category Cards Hover Magnification ──
  document.querySelectorAll('.category-card').forEach((card) => {
    card.addEventListener('mouseenter', () => gsap.to(card, { scale: 1.03, duration: 0.4, ease: 'power2.out' }));
    card.addEventListener('mouseleave', () => gsap.to(card, { scale: 1, duration: 0.4, ease: 'power2.out' }));
  });

  // ── Hero Parallax (content fades out as you scroll) ──
  const heroContent = document.querySelector('.hero__content');
  if (heroContent) {
    gsap.to(heroContent, {
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      },
      y: -100,
      opacity: 0,
      ease: 'none',
    });
  }

  // ── Section Headers — Animated Line Draw ──
  document.querySelectorAll('.section-header').forEach((header) => {
    gsap.fromTo(
      header,
      { '--line-width': '0%' },
      {
        scrollTrigger: { trigger: header, start: 'top 80%' },
        '--line-width': '100%',
        duration: 1.2,
        ease: 'power2.out',
      }
    );
  });

  // (Scroll background particles now handled by scroll-bg.js Three.js system)


  // ── Sections Scale-In Effect ──
  document.querySelectorAll('.categories, .featured, .special-offers, .trending, .newsletter').forEach((section) => {
    gsap.fromTo(section, {
      scale: 0.97,
      borderRadius: '20px',
    }, {
      scrollTrigger: {
        trigger: section,
        start: 'top 85%',
        end: 'top 30%',
        scrub: 1,
      },
      scale: 1,
      borderRadius: '0px',
      ease: 'power2.out',
    });
  });

  // ── Horizontal Scroll Color Accent Lines ──
  document.querySelectorAll('.section-header').forEach((header) => {
    const line = document.createElement('div');
    line.className = 'scroll-accent-line';
    header.style.position = 'relative';
    header.appendChild(line);

    gsap.fromTo(line, { width: '0%' }, {
      scrollTrigger: {
        trigger: header,
        start: 'top 80%',
        end: 'top 50%',
        scrub: 1,
      },
      width: '60%',
      ease: 'power2.out',
    });
  });

  // ── Newsletter CTA Glow Pulse ──
  const newsletter = document.querySelector('.newsletter__inner');
  if (newsletter) {
    gsap.fromTo(newsletter, {
      boxShadow: '0 0 0px rgba(201, 168, 76, 0)',
    }, {
      scrollTrigger: {
        trigger: newsletter,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
      boxShadow: '0 0 40px rgba(201, 168, 76, 0.15)',
      duration: 1.5,
      ease: 'power2.out',
    });
  }

})();
