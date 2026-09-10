/* ============================================
   MAIN.JS — Core Interactions & Animations
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ===== CUSTOM CURSOR ===== */
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');

  if (cursorDot && cursorRing && window.matchMedia('(pointer: fine)').matches) {
    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = mouseX + 'px';
      cursorDot.style.top = mouseY + 'px';
    });

    function animateRing() {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top = ringY + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();

    // Hover effect on interactive elements
    const hoverTargets = document.querySelectorAll('a, button, .project-card, .tech-tag, .skill-category, .timeline-card');
    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  /* ===== NAVBAR SCROLL EFFECT ===== */
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('backToTop');

  function handleNavScroll() {
    const scrolled = window.scrollY > 50;
    navbar.classList.toggle('scrolled', scrolled);
    if (backToTop) {
      backToTop.classList.toggle('visible', window.scrollY > 400);
    }
  }
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  /* ===== MOBILE NAV ===== */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
      });
    });
  }

  /* ===== ACTIVE NAV LINK TRACKING ===== */
  const sections = document.querySelectorAll('.section, .hero');
  const navLinkItems = document.querySelectorAll('.nav-link');

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinkItems.forEach(link => {
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, { threshold: 0, rootMargin: '-40% 0px -60% 0px' });

  sections.forEach(sec => navObserver.observe(sec));

  /* ===== DARK / LIGHT MODE & MULTI-THEME PICKER ===== */
  const themeToggle  = document.getElementById('themeToggle');
  const paletteBtn   = document.getElementById('themePaletteBtn');
  const themeDropdown = document.getElementById('themeDropdown');
  const swatches     = document.querySelectorAll('.theme-swatch');

  // Load saved settings
  const savedMode  = localStorage.getItem('portfolioMode') || 'dark';
  const savedTheme = localStorage.getItem('portfolioTheme') || 'matrix';

  applyMode(savedMode);
  applyTheme(savedTheme);

  // --- Dark/Light Mode Toggle ---
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentMode = document.documentElement.getAttribute('data-mode') || 'dark';
      const newMode = currentMode === 'dark' ? 'light' : 'dark';
      applyMode(newMode);
      localStorage.setItem('portfolioMode', newMode);
    });
  }

  function applyMode(mode) {
    document.documentElement.setAttribute('data-mode', mode);
  }

  // --- Multi-Theme Palette Picker ---
  if (paletteBtn && themeDropdown) {
    paletteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = themeDropdown.classList.contains('open');
      themeDropdown.classList.toggle('open', !isOpen);
      paletteBtn.setAttribute('aria-expanded', String(!isOpen));
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      const picker = document.getElementById('themePicker');
      if (picker && !picker.contains(e.target)) {
        themeDropdown.classList.remove('open');
        paletteBtn.setAttribute('aria-expanded', 'false');
      }
    });

    // Swatch click
    swatches.forEach(swatch => {
      swatch.addEventListener('click', () => {
        const theme = swatch.getAttribute('data-palette') || swatch.getAttribute('data-theme');
        applyTheme(theme);
        localStorage.setItem('portfolioTheme', theme);
        themeDropdown.classList.remove('open');
        paletteBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    // Toggle matrix-only scanline/glow class
    document.body.classList.toggle('theme-matrix', theme === 'matrix');
    // Update active swatch
    swatches.forEach(s => {
      const p = s.getAttribute('data-palette') || s.getAttribute('data-theme');
      s.classList.toggle('active', p === theme);
    });
  }

  /* ===== TYPEWRITER EFFECT ===== */
  const typewriterEl = document.getElementById('typewriter');
  const roles = [
    'Software Engineer',
    'Data Analyst',
    'Machine Learning Enthusiast',
    'Full-Stack Developer',
    'Problem Solver'
  ];
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typeSpeed = 80;

  function typewrite() {
    const current = roles[roleIndex];

    if (isDeleting) {
      typewriterEl.textContent = current.substring(0, charIndex - 1);
      charIndex--;
      typeSpeed = 40;
    } else {
      typewriterEl.textContent = current.substring(0, charIndex + 1);
      charIndex++;
      typeSpeed = 80;
    }

    if (!isDeleting && charIndex === current.length) {
      isDeleting = true;
      typeSpeed = 2000; // Pause at end
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typeSpeed = 400; // Pause before typing next
    }

    setTimeout(typewrite, typeSpeed);
  }
  if (typewriterEl) typewrite();

  /* ===== SCROLL REVEAL ANIMATION ===== */
  const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      } else {
        entry.target.classList.remove('revealed');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  revealElements.forEach(el => revealObserver.observe(el));

  /* ===== ANIMATED COUNTERS ===== */
  const counters = document.querySelectorAll('.stat-number');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.getAttribute('data-target'));
        animateCounter(entry.target, target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => counterObserver.observe(c));

  function animateCounter(el, target) {
    let current = 0;
    const duration = 1500;
    const step = target / (duration / 16);

    function tick() {
      current += step;
      if (current >= target) {
        el.textContent = target;
        return;
      }
      el.textContent = Math.floor(current);
      requestAnimationFrame(tick);
    }
    tick();
  }

  /* ===== SKILL RING ANIMATION ===== */
  const skillRings = document.querySelectorAll('.skill-ring');
  const circumference = 2 * Math.PI * 42; // r = 42

  const ringObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const percent = parseInt(entry.target.getAttribute('data-percent'));
        const progress = entry.target.querySelector('.ring-progress');
        if (progress) {
          const offset = circumference - (percent / 100) * circumference;
          progress.style.strokeDashoffset = offset;
        }
        ringObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  skillRings.forEach(ring => ringObserver.observe(ring));

  /* ===== TIMELINE CONNECTOR ANIMATION ===== */
  const timelineConnector = document.getElementById('timelineConnector');
  const timeline = document.querySelector('.timeline');

  if (timelineConnector && timeline) {
    const timelineObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          timelineConnector.style.height = '100%';
        } else {
          timelineConnector.style.height = '0%';
        }
      });
    }, { threshold: 0.1 });

    timelineObserver.observe(timeline);
  }

  /* ===== 3D TILT ON PROJECT CARDS ===== */
  const projectCards = document.querySelectorAll('.project-card');

  projectCards.forEach(card => {
    const inner = card.querySelector('.project-card-inner');

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      if (inner) {
        inner.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      }
    });

    card.addEventListener('mouseleave', () => {
      if (inner) {
        inner.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      }
    });
  });

  /* ===== TESTIMONIAL SLIDER ===== */
  const track = document.getElementById('testimonialTrack');
  const prevBtn = document.getElementById('testPrev');
  const nextBtn = document.getElementById('testNext');
  const dotsContainer = document.getElementById('testDots');

  if (track && prevBtn && nextBtn && dotsContainer) {
    const cards = track.querySelectorAll('.testimonial-card');
    let currentSlide = 0;
    const totalSlides = cards.length;

    // Create dots
    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement('div');
      dot.classList.add('test-dot');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    }

    const dots = dotsContainer.querySelectorAll('.test-dot');

    function goToSlide(index) {
      currentSlide = index;
      track.style.transform = `translateX(-${currentSlide * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
    }

    prevBtn.addEventListener('click', () => {
      goToSlide(currentSlide > 0 ? currentSlide - 1 : totalSlides - 1);
    });

    nextBtn.addEventListener('click', () => {
      goToSlide(currentSlide < totalSlides - 1 ? currentSlide + 1 : 0);
    });

    // Auto-rotate every 5 seconds
    let autoSlide = setInterval(() => {
      goToSlide(currentSlide < totalSlides - 1 ? currentSlide + 1 : 0);
    }, 5000);

    // Pause on hover
    track.addEventListener('mouseenter', () => clearInterval(autoSlide));
    track.addEventListener('mouseleave', () => {
      autoSlide = setInterval(() => {
        goToSlide(currentSlide < totalSlides - 1 ? currentSlide + 1 : 0);
      }, 5000);
    });
  }

  /* ===== BACK TO TOP ===== */
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ===== CONTACT FORM (Visual Only) ===== */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('.btn-submit span');
      const originalText = btn.textContent;
      btn.textContent = 'Sent! ✓';
      contactForm.reset();

      setTimeout(() => {
        btn.textContent = originalText;
      }, 3000);
    });
  }

  /* ===== SMOOTH SCROLL FOR ALL ANCHOR LINKS ===== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

});
