/* ============================================
   MAIN.JS — Core Interactions & Animations
   ============================================ */

(function () {
  function initMain() {



  /* ===== CUSTOM CURSOR (DOT & RING — PC ONLY) ===== */
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 768) || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);

  if (isTouchDevice) {
    if (cursorDot) cursorDot.remove();
    if (cursorRing) cursorRing.remove();
  } else if (cursorDot && cursorRing) {
    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = mouseX + 'px';
      cursorDot.style.top = mouseY + 'px';
      cursorDot.style.opacity = '1';
      cursorRing.style.opacity = '1';
    });

    document.addEventListener('mouseleave', () => {
      cursorDot.style.opacity = '0';
      cursorRing.style.opacity = '0';
    });

    function animateRing() {
      ringX += (mouseX - ringX) * 0.2;
      ringY += (mouseY - ringY) * 0.2;
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top = ringY + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();

    // Hover effect on interactive elements
    const hoverTargets = document.querySelectorAll('a, button, .project-card, .tech-tag, .skill-category, .timeline-card, .term-pill, .nav-terminal-btn');
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

  /* ===== SCROLL REVEAL & ONE-TIME ANIMATIONS ===== */
  const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  const counters = document.querySelectorAll('.stat-number');
  const skillRings = document.querySelectorAll('.skill-ring');
  const circumference = 2 * Math.PI * 42; // r = 42
  const timelineConnector = document.getElementById('timelineConnector');
  const timeline = document.querySelector('.timeline');

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

  const hasVisited = sessionStorage.getItem('portfolioVisited');

  if (hasVisited) {
    // If the site has already loaded before in this session, show elements immediately
    revealElements.forEach(el => el.classList.add('revealed'));
    if (timelineConnector) timelineConnector.style.height = '100%';

    counters.forEach(c => {
      const target = c.getAttribute('data-target');
      if (target) c.textContent = target;
    });

    skillRings.forEach(ring => {
      const percent = parseInt(ring.getAttribute('data-percent'));
      const progress = ring.querySelector('.ring-progress');
      if (progress && !isNaN(percent)) {
        progress.style.strokeDashoffset = circumference - (percent / 100) * circumference;
      }
    });
  } else {
    // First time site loads: mark session and run smooth animations once
    sessionStorage.setItem('portfolioVisited', 'true');

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05 });

    revealElements.forEach(el => revealObserver.observe(el));

    setTimeout(() => {
      revealElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          el.classList.add('revealed');
        }
      });
    }, 100);

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

    if (timelineConnector && timeline) {
      const timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            timelineConnector.style.height = '100%';
            timelineObserver.unobserve(timeline);
          }
        });
      }, { threshold: 0.1 });

      timelineObserver.observe(timeline);
    }
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

  /* ===== CONTACT FORM (LIVE EMAIL INTEGRATION) ===== */
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatusMsg');
  const submitBtn = document.getElementById('contactSubmitBtn');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const btnSpan = submitBtn ? submitBtn.querySelector('span') : null;
      const originalText = btnSpan ? btnSpan.textContent : 'Send Message';

      if (submitBtn) submitBtn.disabled = true;
      if (btnSpan) btnSpan.textContent = 'Sending... ⏳';
      if (formStatus) {
        formStatus.style.display = 'none';
        formStatus.className = 'form-status-msg';
      }

      const name = document.getElementById('formName') ? document.getElementById('formName').value : '';
      const email = document.getElementById('formEmail') ? document.getElementById('formEmail').value : '';
      const subject = document.getElementById('formSubject') ? document.getElementById('formSubject').value : '';
      const message = document.getElementById('formMessage') ? document.getElementById('formMessage').value : '';

      try {
        const payload = {
          name: name,
          email: email,
          subject: `[Portfolio Contact] ${subject}`,
          message: message,
          to: 'sakshamrd852@gmail.com',
          access_key: '64ee9c5b-38d7-4d76-88ce-ba78c93549ee' // Web3Forms Public Access Key
        };

        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok && (result.success || result.status === 200)) {
          if (btnSpan) btnSpan.textContent = 'Message Sent! ✓';
          if (formStatus) {
            formStatus.textContent = '🎉 Thank you! Your message has been sent to Saksham directly.';
            formStatus.className = 'form-status-msg success';
            formStatus.style.display = 'block';
          }
          contactForm.reset();
        } else {
          throw new Error(result.message || 'Submission failed');
        }
      } catch (err) {
        // Fallback gracefully to direct mailto if offline or API unavailable
        if (formStatus) {
          formStatus.innerHTML = `⚠️ Couldn't send automatically. <a href="mailto:sakshamrd852@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent('Hi Saksham,\n\n' + message + '\n\nFrom: ' + name + ' (' + email + ')')}" style="color:#00d4ff; text-decoration:underline;">Click here to send email directly ↗</a>`;
          formStatus.className = 'form-status-msg error';
          formStatus.style.display = 'block';
        }
        if (btnSpan) btnSpan.textContent = 'Try Again';
      } finally {
        if (submitBtn) submitBtn.disabled = false;
        setTimeout(() => {
          if (btnSpan && btnSpan.textContent === 'Message Sent! ✓') {
            btnSpan.textContent = originalText;
          }
        }, 5000);
      }
    });
  }

  /* ===== RESUME MODAL VIEWER ===== */
  const resumeModal = document.getElementById('resumeModal');
  const closeResumeModal = document.getElementById('closeResumeModal');
  const backResumeBtn = document.getElementById('backResumeBtn');
  const backResumeBtnText = document.getElementById('backResumeBtnText');
  const resumeBackdrop = document.getElementById('resumeModalBackdrop');
  const resumeTriggers = document.querySelectorAll('[data-open-resume]');

  let resumeOpenedFrom = null;

  function openResume(e, source) {
    if (e && e.preventDefault) e.preventDefault();
    resumeOpenedFrom = source || null;

    if (backResumeBtn && backResumeBtnText) {
      if (resumeOpenedFrom === 'terminal') {
        backResumeBtnText.textContent = 'Terminal';
        backResumeBtn.setAttribute('title', 'Return to Terminal');
      } else {
        backResumeBtnText.textContent = 'Back';
        backResumeBtn.setAttribute('title', 'Close Resume');
      }
    }

    if (resumeModal) {
      resumeModal.classList.add('active');
      resumeModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeResume() {
    if (resumeModal) {
      resumeModal.classList.remove('active');
      resumeModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';

      if (resumeOpenedFrom === 'terminal') {
        resumeOpenedFrom = null;
        setTimeout(() => {
          if (typeof window.openTerminalModal === 'function') {
            window.openTerminalModal();
          }
        }, 150);
      }
    }
  }

  window.openResumeModal = openResume;
  window.closeResumeModal = closeResume;

  resumeTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => openResume(e, null));
  });

  if (backResumeBtn) backResumeBtn.addEventListener('click', closeResume);
  if (closeResumeModal) closeResumeModal.addEventListener('click', closeResume);
  if (resumeBackdrop) resumeBackdrop.addEventListener('click', closeResume);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && resumeModal && resumeModal.classList.contains('active')) {
      closeResume();
    }
  });

  /* ===== SMOOTH SCROLL FOR ALL ANCHOR LINKS ===== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href && href.length > 1) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
}

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMain);
  } else {
    initMain();
  }
})();
