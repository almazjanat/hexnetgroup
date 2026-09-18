/**
 * HexNetGroup — Core Interactions & Motion
 * Precision Lenis Smooth Scroll + GSAP Motion + Custom Crosshair
 */

(function () {
  'use strict';

  // Check reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Lenis Smooth Scroll ---
  let lenis = null;
  if (!prefersReducedMotion && typeof window.Lenis !== 'undefined') {
    lenis = new window.Lenis({
      duration: 1.15,
      smoothWheel: true,
    });

    if (window.gsap && window.ScrollTrigger) {
      lenis.on('scroll', window.ScrollTrigger.update);
      window.gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      window.gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }

  // Smooth scroll helper
  function smoothScrollTo(target) {
    if (!target) return;
    if (lenis) {
      lenis.scrollTo(target, { duration: 1.4 });
    } else {
      const el = typeof target === 'string' ? document.querySelector(target) : target;
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  // Attach smooth scrolling to all anchor links
  document.querySelectorAll('a[href^="#"], button[data-scroll]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const target = link.getAttribute('data-scroll') || link.getAttribute('href');
      if (target && target !== '#') {
        e.preventDefault();
        smoothScrollTo(target);
        closeMobileMenu();
      }
    });
  });

  // --- Mobile Menu Toggle ---
  const mobileToggle = document.querySelector('[data-menu-toggle]');
  const mobileDrawer = document.querySelector('[data-mobile-drawer]');
  const mobileLinks = mobileDrawer ? mobileDrawer.querySelectorAll('a, button') : [];

  function closeMobileMenu() {
    if (mobileToggle && mobileDrawer) {
      mobileToggle.setAttribute('aria-expanded', 'false');
      mobileDrawer.classList.remove('is-open');
      document.body.classList.remove('menu-open');
    }
  }

  function toggleMobileMenu() {
    if (!mobileToggle || !mobileDrawer) return;
    const isOpen = mobileToggle.getAttribute('aria-expanded') === 'true';
    mobileToggle.setAttribute('aria-expanded', String(!isOpen));
    mobileDrawer.classList.toggle('is-open', !isOpen);
    document.body.classList.toggle('menu-open', !isOpen);
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('click', toggleMobileMenu);
  }
  mobileLinks.forEach((l) => l.addEventListener('click', closeMobileMenu));

  // --- Custom Crosshair Cursor ---
  const cursorRoot = document.getElementById('cursor');
  if (cursorRoot && !window.matchMedia('(hover: none), (pointer: coarse)').matches) {
    let mouseX = -100;
    let mouseY = -100;
    let currentX = -100;
    let currentY = -100;
    let isMoving = false;

    window.addEventListener(
      'mousemove',
      (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!isMoving) {
          isMoving = true;
          currentX = mouseX;
          currentY = mouseY;
        }
        const target = e.target;
        const interactive = target && target.closest('a, button, [data-hover], input, textarea, label');
        cursorRoot.classList.toggle('is-active', !!interactive);
      },
      { passive: true }
    );

    function cursorLoop() {
      if (isMoving) {
        currentX += (mouseX - currentX) * 0.18;
        currentY += (mouseY - currentY) * 0.18;
        cursorRoot.style.transform = `translate(${currentX}px, ${currentY}px)`;
      }
      requestAnimationFrame(cursorLoop);
    }
    requestAnimationFrame(cursorLoop);
  }

  // --- Preloader & Motion Init ---
  const preloader = document.getElementById('preloader');
  const counterEl = document.getElementById('preloader-counter');

  function initMotion() {
    if (prefersReducedMotion || !window.gsap) {
      document.querySelectorAll('.mask-inner').forEach((m) => (m.style.transform = 'none'));
      document.querySelectorAll('[data-reveal]').forEach((r) => {
        r.style.opacity = '1';
        r.style.transform = 'none';
      });
      return;
    }

    const { gsap, ScrollTrigger } = window;
    if (ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }

    // Hero line masks (above the fold)
    gsap.to('#top .mask-inner', {
      y: 0,
      duration: 1.1,
      ease: 'power4.out',
      stagger: 0.09,
      delay: 0.1,
    });

    if (ScrollTrigger) {
      // Line mask reveals below the fold
      gsap.utils
        .toArray('.mask-inner')
        .filter((el) => !el.closest('#top'))
        .forEach((el) => {
          gsap.to(el, {
            y: 0,
            duration: 1.1,
            ease: 'power4.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
            },
          });
        });

      // Batch reveals
      gsap.set('[data-reveal]', { y: 30, opacity: 0 });
      ScrollTrigger.batch('[data-reveal]', {
        start: 'top 90%',
        onEnter: (batch) =>
          gsap.to(batch, {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'power3.out',
            stagger: 0.15,
            overwrite: true,
          }),
      });

      // Parallax hero wordmark
      gsap.to('[data-hero-mark]', {
        yPercent: 20,
        ease: 'none',
        scrollTrigger: {
          trigger: '#top',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      ScrollTrigger.refresh();
    }
  }

  if (preloader && counterEl && window.gsap) {
    const counterObj = { v: 0 };
    const tl = window.gsap.timeline({
      onComplete: () => {
        initMotion();
      },
    });

    tl.to(counterObj, {
      v: 100,
      duration: 1.4,
      ease: 'power2.inOut',
      onUpdate: () => {
        counterEl.textContent = `${String(Math.round(counterObj.v)).padStart(2, '0')}%`;
      },
    });

    tl.to(preloader, {
      clipPath: 'inset(0 0 100% 0)',
      duration: 0.85,
      ease: 'power4.inOut',
      delay: 0.1,
      onComplete: () => {
        preloader.style.display = 'none';
      },
    });
  } else {
    if (preloader) preloader.style.display = 'none';
    initMotion();
  }

  // --- Contact Form Handling ---
  const contactForm = document.querySelector('[data-contact-form]');
  const formStatus = document.querySelector('[data-form-status]');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const formData = new FormData(contactForm);

      if (formData.get('_honey')) return;

      if (submitBtn) submitBtn.disabled = true;
      if (formStatus) formStatus.textContent = 'Отправляем сообщение…';

      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(Object.fromEntries(formData.entries())),
        });

        const result = await response.json().catch(() => ({}));
        if (!response.ok || result.success === false || result.success === 'false') {
          throw new Error(result.message || 'Submission failed');
        }

        contactForm.reset();
        if (formStatus) formStatus.textContent = 'Сообщение отправлено. Мы ответим в течение дня.';
      } catch (err) {
        if (formStatus) {
          formStatus.textContent = 'Не удалось отправить форму. Напишите напрямую: hexnetgroup@outlook.com';
        }
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  // Year in footer
  const yearEl = document.querySelector('[data-year]');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();
