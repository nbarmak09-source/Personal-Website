document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.nav-link');
  const tabContents = document.querySelectorAll('.tab-content');
  const overlay = document.getElementById('cardOverlay');
  const expandedCards = document.querySelectorAll('.expanded-card');

  function closeAllCards() {
    expandedCards.forEach(card => card.classList.remove('open'));
    overlay.classList.remove('open');
  }

  function switchTab(targetId) {
    closeAllCards();

    tabContents.forEach(tab => {
      tab.classList.remove('active');
      tab.style.opacity = '0';
    });

    navLinks.forEach(link => link.classList.remove('active'));

    const target = document.getElementById(targetId);
    const activeLink = document.querySelector(`.nav-link[data-tab="${targetId}"]`);
    const brand = document.getElementById('navBrand');

    if (target && activeLink) {
      activeLink.classList.add('active');
      if (brand) brand.classList.toggle('nav-brand--active', targetId === 'home');
      target.classList.add('active');
      requestAnimationFrame(() => {
        target.style.opacity = '1';
      });
      history.replaceState(null, '', `#${targetId}`);
      updateNavIndicator();
    }
  }

  // Restore tab from URL hash on load/refresh
  const hash = window.location.hash.slice(1);
  if (hash && ['home', 'resume', 'projects', 'personal'].includes(hash)) {
    switchTab(hash);
  } else {
    switchTab('home');
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = link.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  const navBrand = document.getElementById('navBrand');
  if (navBrand) {
    navBrand.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab('home');
    });
  }

  function updateNavIndicator() {
    const indicator = document.getElementById('navIndicator');
    const wrap = document.getElementById('navLinks');
    const active = document.querySelector('.nav-link.active');
    if (!indicator || !wrap || !active) return;
    const left = active.offsetLeft;
    const width = active.offsetWidth;
    indicator.style.width = `${width}px`;
    indicator.style.transform = `translateX(${left}px)`;
    indicator.style.opacity = width ? '1' : '0';
  }

  let indicatorRaf = 0;
  function scheduleNavIndicator() {
    cancelAnimationFrame(indicatorRaf);
    indicatorRaf = requestAnimationFrame(() => {
      indicatorRaf = requestAnimationFrame(updateNavIndicator);
    });
  }

  window.addEventListener('resize', scheduleNavIndicator);

  const navbar = document.getElementById('navbar');
  function updateNavbarScroll() {
    if (!navbar) return;
    navbar.classList.toggle('navbar--scrolled', window.scrollY > 12);
  }
  window.addEventListener('scroll', updateNavbarScroll, { passive: true });
  updateNavbarScroll();

  scheduleNavIndicator();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(scheduleNavIndicator);
  }

  // Roadmap: click to expand cards
  const stopContents = document.querySelectorAll('.stop-content');
  const closeButtons = document.querySelectorAll('.card-close');

  stopContents.forEach(stop => {
    stop.addEventListener('click', () => {
      const interest = stop.getAttribute('data-interest');
      const card = document.getElementById(`card-${interest}`);

      if (card) {
        closeAllCards();
        card.classList.add('open');
        overlay.classList.add('open');
      }
    });
  });

  closeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllCards();
    });
  });

  overlay.addEventListener('click', closeAllCards);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllCards();
  });

  // Contact dropdown toggle
  const contactTrigger = document.getElementById('contactTrigger');
  const contactDropdown = document.getElementById('contactDropdown');

  contactTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    contactTrigger.classList.toggle('open');
  });

  document.addEventListener('click', () => {
    contactTrigger.classList.remove('open');
  });

  contactDropdown.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // ============================================================
  // FEATURE: Falling theme-colored stars (Home hero)
  // ============================================================
  function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const THEME_RGB = [
      [91, 154, 139],
      [100, 168, 152],
      [120, 185, 168],
      [76, 138, 126],
    ];

    let w = 0;
    let h = 0;
    let stars = [];

    function pickRgb() {
      return THEME_RGB[Math.floor(Math.random() * THEME_RGB.length)];
    }

    function makeStars(width, height) {
      const list = [];
      const n = 72;
      for (let i = 0; i < n; i++) {
        const rgb = pickRgb();
        list.push({
          x: Math.random() * width,
          y: Math.random() * (height + height * 0.45) - height * 0.4,
          vy: Math.random() * 1.05 + 0.32,
          vx: (Math.random() - 0.5) * 0.42,
          arm: Math.random() * 1.45 + 0.45,
          opacity: Math.random() * 0.22 + 0.14,
          rgb,
        });
      }
      return list;
    }

    function layoutCanvas() {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = makeStars(w, h);
    }

    window.addEventListener('resize', layoutCanvas);
    layoutCanvas();

    function drawStar(s) {
      const [r, g, b] = s.rgb;
      const alpha = Math.min(0.52, s.opacity);
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.92})`;
      ctx.lineWidth = 0.6;
      const a = s.arm;
      ctx.beginPath();
      ctx.moveTo(s.x - a, s.y);
      ctx.lineTo(s.x + a, s.y);
      ctx.moveTo(s.x, s.y - a);
      ctx.lineTo(s.x, s.y + a);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(s.x, s.y, a * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }

    function tick() {
      ctx.clearRect(0, 0, w, h);
      stars.forEach(s => {
        if (!reduceMotion) {
          s.y += s.vy;
          s.x += s.vx;
          if (s.y > h + 14) {
            s.y = -10 - Math.random() * h * 0.3;
            s.x = Math.random() * w;
            s.vy = Math.random() * 1.05 + 0.32;
            s.vx = (Math.random() - 0.5) * 0.42;
            s.rgb = pickRgb();
            s.opacity = Math.random() * 0.22 + 0.14;
            s.arm = Math.random() * 1.45 + 0.45;
          }
          if (s.x < -8) s.x = w + 8;
          if (s.x > w + 8) s.x = -8;
        }
        drawStar(s);
      });
      if (!reduceMotion) requestAnimationFrame(tick);
    }

    if (reduceMotion) {
      tick();
    } else {
      requestAnimationFrame(tick);
    }
  }

  // ============================================================
  // FEATURE: Typewriter effect on Home
  // ============================================================
  function initTypewriter() {
    const el = document.getElementById('typewriter');
    if (!el) return;

    const phrases = ['HBA Candidate', 'Investor', 'Builder'];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
      const current = phrases[phraseIndex];

      if (isDeleting) {
        charIndex--;
        el.textContent = current.slice(0, charIndex);
        if (charIndex === 0) {
          isDeleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          setTimeout(type, 450);
        } else {
          setTimeout(type, 45);
        }
      } else {
        charIndex++;
        el.textContent = current.slice(0, charIndex);
        if (charIndex === current.length) {
          isDeleting = true;
          setTimeout(type, 1800);
        } else {
          setTimeout(type, 95);
        }
      }
    }

    setTimeout(type, 900);
  }

  // ============================================================
  // FEATURE: Cursor glow
  // ============================================================
  function initCursorGlow() {
    const glow = document.getElementById('cursorGlow');
    if (!glow) return;

    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;
    let visible = false;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!visible) {
        glow.style.opacity = '1';
        visible = true;
      }
    });

    document.addEventListener('mouseleave', () => {
      glow.style.opacity = '0';
      visible = false;
    });

    function animateGlow() {
      glowX += (mouseX - glowX) * 0.1;
      glowY += (mouseY - glowY) * 0.1;
      glow.style.left = glowX + 'px';
      glow.style.top = glowY + 'px';
      requestAnimationFrame(animateGlow);
    }
    animateGlow();
  }

  // ============================================================
  // FEATURE: Position wave line at roadmap center
  // ============================================================
  function initWavePosition() {
    const bleed = document.querySelector('.roadmap-line-bleed');
    const contents = document.querySelector('.roadmap-contents');
    const wrapper = document.querySelector('.roadmap-wrapper');
    if (!bleed || !contents || !wrapper) return;

    function positionWave() {
      const wrapperRect = wrapper.getBoundingClientRect();
      const contentsRect = contents.getBoundingClientRect();
      const centerY = contentsRect.top + contentsRect.height / 2 - wrapperRect.top;
      bleed.style.top = (centerY - 28) + 'px';
    }

    positionWave();
    window.addEventListener('resize', positionWave);
    window.addEventListener('scroll', positionWave, { passive: true });
  }

  // Init all features
  initParticles();
  initTypewriter();
  initCursorGlow();
  initWavePosition();
});
