/* ============================================
   MAIN.JS — Core Interactions & Animations
   ============================================ */

(function () {
  function initMain() {

  /* ===== LOADING SCREEN ===== */
  const loadingScreen = document.getElementById('loadingScreen');
  const loadingBarFill = document.getElementById('loadingBarFill');
  const loadingText = document.getElementById('loadingText');
  const loadingMessages = [
    'Initializing portfolio...',
    'Loading projects...',
    'Calibrating skills...',
    'Almost ready...'
  ];
  let loadingProgress = 0;
  let loadingMsgIdx = 0;

  function advanceLoading() {
    loadingProgress += Math.random() * 28 + 10;
    if (loadingProgress > 100) loadingProgress = 100;
    if (loadingBarFill) loadingBarFill.style.width = loadingProgress + '%';
    if (loadingText && loadingMsgIdx < loadingMessages.length) {
      loadingText.textContent = loadingMessages[loadingMsgIdx++];
    }
    if (loadingProgress < 100) {
      setTimeout(advanceLoading, 120 + Math.random() * 100);
    } else {
      setTimeout(() => {
        if (loadingScreen) loadingScreen.classList.add('done');
      }, 350);
    }
  }
  advanceLoading();

  /* ===== SCROLL PROGRESS BAR ===== */
  const scrollProgressBar = document.getElementById('scrollProgressBar');
  function updateScrollProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (scrollProgressBar) scrollProgressBar.style.width = pct + '%';
  }
  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  updateScrollProgress();

  /* ===== PROJECT CARD SPOTLIGHT TRACKING ===== */
  document.querySelectorAll('.project-card:not(.project-card-coming-soon)').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--spotlight-x', x + '%');
      card.style.setProperty('--spotlight-y', y + '%');
    });
  });

  /* ===== MAGNETIC BUTTON EFFECT ===== */
  const isMobileDevice = window.innerWidth <= 768;
  if (!isMobileDevice) {
    document.querySelectorAll('.magnetic-btn').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        const strength = 0.28;
        btn.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ===== STAGGER SKILL ITEMS ON REVEAL ===== */
  document.querySelectorAll('.skill-category').forEach(cat => {
    const items = cat.querySelectorAll('.skill-item');
    items.forEach((item, i) => {
      item.classList.add('stagger-' + Math.min(i + 1, 8));
    });
  });

  /* ===== CUSTOM CURSOR (DOT & RING — PC ONLY) ===== */
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  const isMobile = window.innerWidth <= 768;

  // Always force-hide the native OS cursor via JS (CSS alone can miss touchpad on some browsers)
  (function forceHideCursor() {
    const styleEl = document.createElement('style');
    styleEl.id = 'force-cursor-none';
    styleEl.textContent = 'html,html *,html *::before,html *::after{cursor:none!important}';
    document.head.appendChild(styleEl);
    // Belt-and-suspenders: also set via style attribute
    document.documentElement.style.setProperty('cursor', 'none', 'important');
    document.body.style.setProperty('cursor', 'none', 'important');
  })();

  if (isMobile) {
    if (cursorDot) cursorDot.remove();
    if (cursorRing) cursorRing.remove();
  } else if (cursorDot && cursorRing) {
    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;
    let isInitialized = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isInitialized) {
        ringX = mouseX;
        ringY = mouseY;
        isInitialized = true;
      }
      cursorDot.style.left = mouseX + 'px';
      cursorDot.style.top = mouseY + 'px';
      cursorDot.style.opacity = '1';
      cursorRing.style.opacity = '1';
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      cursorDot.style.opacity = '0';
      cursorRing.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
      cursorDot.style.opacity = '1';
      cursorRing.style.opacity = '1';
    });

    function animateRing() {
      ringX += (mouseX - ringX) * 0.2;
      ringY += (mouseY - ringY) * 0.2;
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top = ringY + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();

    // Hover effect on interactive elements via delegation
    document.addEventListener('mouseover', (e) => {
      if (e.target && e.target.closest('a, button, input, textarea, select, label, .project-card, .tech-tag, .skill-category, .timeline-card, .term-pill, .nav-terminal-btn, .theme-swatch, .theme-palette-btn, .hamburger, .btn, .filter-btn, .test-nav-btn, .test-dot, .back-to-top, [role="button"], [data-open-resume], [data-open-game]')) {
        document.body.classList.add('cursor-hover');
      } else {
        document.body.classList.remove('cursor-hover');
      }
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
  const savedTheme = localStorage.getItem('portfolioTheme') || 'cyber';

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

  /* ===== BI-DIRECTIONAL SCROLL REVEAL ANIMATIONS (REVERSIBLE ON SCROLL UP & DOWN) ===== */
  const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  const counters = document.querySelectorAll('.stat-number');
  const skillRings = document.querySelectorAll('.skill-ring');
  const circumference = 2 * Math.PI * 42; // r = 42
  const timelineConnector = document.getElementById('timelineConnector');
  const timeline = document.querySelector('.timeline');

  function animateCounter(el, target) {
    let current = 0;
    const duration = 1200;
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

  function checkReveals() {
    const triggerBottom = window.innerHeight * 0.90;

    revealElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      // Reveal when top enters the viewport (and stays revealed if scrolled past above)
      if (rect.top < triggerBottom) {
        el.classList.add('revealed');
      } else {
        // Reverse animation out when element drops below bottom threshold while scrolling up
        el.classList.remove('revealed');
      }
    });

    // Timeline connector animation
    if (timelineConnector && timeline) {
      const tRect = timeline.getBoundingClientRect();
      if (tRect.top < window.innerHeight * 0.75) {
        timelineConnector.style.height = '100%';
      } else {
        timelineConnector.style.height = '0%';
      }
    }

    // Counters animation
    counters.forEach(c => {
      const rect = c.getBoundingClientRect();
      const target = parseInt(c.getAttribute('data-target'));
      if (rect.top < triggerBottom && rect.bottom > 0) {
        if (!c.dataset.counted) {
          c.dataset.counted = 'true';
          animateCounter(c, target);
        }
      } else if (rect.top >= triggerBottom) {
        c.dataset.counted = '';
        c.textContent = '0';
      }
    });

    // Skill ring progress animation
    skillRings.forEach(ring => {
      const rect = ring.getBoundingClientRect();
      const percent = parseInt(ring.getAttribute('data-percent'));
      const progress = ring.querySelector('.ring-progress');
      if (progress && !isNaN(percent)) {
        if (rect.top < triggerBottom && rect.bottom > 0) {
          progress.style.strokeDashoffset = circumference - (percent / 100) * circumference;
        } else if (rect.top >= triggerBottom) {
          progress.style.strokeDashoffset = circumference;
        }
      }
    });
  }

  window.addEventListener('scroll', checkReveals, { passive: true });
  window.addEventListener('resize', checkReveals, { passive: true });

  // Initial check on page load
  checkReveals();
  setTimeout(checkReveals, 100);
  setTimeout(checkReveals, 400);

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

      // Check anti-spam honeypot
      const honeyField = contactForm.querySelector('input[name="_honey"]');
      if (honeyField && honeyField.value) {
        // Silent bot discard
        return;
      }

      const btnSpan = submitBtn ? submitBtn.querySelector('span') : null;
      const originalText = btnSpan ? btnSpan.textContent : 'Send Message';

      if (submitBtn) submitBtn.disabled = true;
      if (btnSpan) btnSpan.textContent = 'Sending... ⏳';
      if (formStatus) {
        formStatus.style.display = 'none';
        formStatus.className = 'form-status-msg';
      }

      const name = document.getElementById('formName') ? document.getElementById('formName').value.trim() : '';
      const email = document.getElementById('formEmail') ? document.getElementById('formEmail').value.trim() : '';
      const subject = document.getElementById('formSubject') ? document.getElementById('formSubject').value.trim() : '';
      const message = document.getElementById('formMessage') ? document.getElementById('formMessage').value.trim() : '';

      // Sync hidden fields for FormSubmit
      const hiddenSubject = document.getElementById('formHiddenSubject');
      if (hiddenSubject) hiddenSubject.value = `[Portfolio Contact] ${subject || 'New Message'} — from ${name}`;
      const hiddenNext = document.getElementById('formHiddenNext');
      if (hiddenNext) hiddenNext.value = window.location.href;

      // When tested locally via direct file:/// opening, submit via native POST
      if (window.location.protocol === 'file:') {
        contactForm.submit();
        return;
      }

      try {
        const payload = {
          name: name,
          email: email,
          _subject: `[Portfolio Contact] ${subject || 'New Message'} — from ${name}`,
          message: message,
          _captcha: 'false',
          _template: 'table'
        };

        const response = await fetch('https://formsubmit.co/ajax/sakshamrd852@gmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        // FormSubmit returns success: "true" or true or message regarding activation
        if (response.ok && (result.success === 'true' || result.success === true || (result.message && result.message.includes('Activation')))) {
          if (btnSpan) btnSpan.textContent = 'Message Sent! ✓';
          if (formStatus) {
            formStatus.innerHTML = `🎉 <strong>Thank you, ${name || 'friend'}!</strong> Your message has been sent successfully to Saksham.`;
            formStatus.className = 'form-status-msg success';
            formStatus.style.display = 'block';
          }
          contactForm.reset();
        } else {
          throw new Error(result.message || 'Submission failed');
        }
      } catch (err) {
        console.warn('FormSubmit AJAX error:', err);
        // Fallback gracefully to direct mailto if offline or API unavailable
        if (formStatus) {
          formStatus.innerHTML = `⚠️ Couldn't send automatically. <a href="mailto:sakshamrd852@gmail.com?subject=${encodeURIComponent('[Portfolio] ' + subject)}&body=${encodeURIComponent('Hi Saksham,\n\n' + message + '\n\nFrom: ' + name + ' (' + email + ')')}" style="color:var(--accent-primary); text-decoration:underline; font-weight:600;">Click here to send email directly ↗</a>`;
          formStatus.className = 'form-status-msg error';
          formStatus.style.display = 'block';
        }
        if (btnSpan) btnSpan.textContent = 'Try Again';
      } finally {
        if (submitBtn) submitBtn.disabled = false;
        setTimeout(() => {
          if (btnSpan && (btnSpan.textContent === 'Message Sent! ✓' || btnSpan.textContent === 'Try Again')) {
            btnSpan.textContent = originalText;
          }
        }, 5000);
      }
    });
  }

  /* ===== RESUME MODAL VIEWER WITH PDF.JS RENDERING ===== */
  const resumeModal = document.getElementById('resumeModal');
  const closeResumeModal = document.getElementById('closeResumeModal');
  const resumeBackdrop = document.getElementById('resumeModalBackdrop');
  const resumeTriggers = document.querySelectorAll('[data-open-resume]');
  const resumePdfContainer = document.getElementById('resumePdfContainer');

  let resumeOpenedFrom = null;
  let pdfRendered = false;

  async function loadAndRenderPdf() {
    if (pdfRendered || !resumePdfContainer) return;

    if (typeof window.pdfjsLib !== 'undefined') {
      try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        resumePdfContainer.innerHTML = '<div class="resume-loading"><div class="resume-spinner"></div><span>Loading Resume Document...</span></div>';

        const loadingTask = pdfjsLib.getDocument('Saksham_Dhumale_Master_Resume.pdf');
        const pdf = await loadingTask.promise;

        resumePdfContainer.innerHTML = '';

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const canvas = document.createElement('canvas');
          canvas.className = 'resume-page-canvas';
          const ctx = canvas.getContext('2d');

          // Render at high resolution (2x or devicePixelRatio) for crisp vector text
          const viewport = page.getViewport({ scale: Math.max(window.devicePixelRatio || 1, 2) });
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({ canvasContext: ctx, viewport: viewport }).promise;
          resumePdfContainer.appendChild(canvas);
        }
        pdfRendered = true;
      } catch (err) {
        console.warn('PDF.js inline render fallback:', err);
        const isMobile = window.innerWidth <= 768;
        if (isMobile && window.location.protocol.startsWith('http')) {
          const fullPdfUrl = new URL('Saksham_Dhumale_Master_Resume.pdf', window.location.href).href;
          resumePdfContainer.innerHTML = `<iframe src="https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(fullPdfUrl)}" class="resume-iframe" title="Resume Document"></iframe>`;
        } else {
          resumePdfContainer.innerHTML = `<iframe src="Saksham_Dhumale_Master_Resume.pdf#toolbar=0" class="resume-iframe" title="Resume Document"></iframe>`;
        }
      }
    }
  }

  function openResume(e, source) {
    if (e && e.preventDefault) e.preventDefault();
    resumeOpenedFrom = source || null;

    if (resumeModal) {
      resumeModal.classList.add('active');
      resumeModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      loadAndRenderPdf();
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

  /* ============================================================
     WORLD-CLASS INTERACTIVE ENGINES — AWARD-WINNING V37
     ============================================================ */

  /* 1. NO-OP AUDIO & TROPHY STUBS */
  const AudioEngine = {
    playHover() {},
    playClick() {},
    playChime() {},
    playAchievement() {}
  };
  window.AudioEngine = AudioEngine;

  const AchievementManager = {
    unlock() {}
  };
  window.unlockAchievement = AchievementManager.unlock;

  /* 3. 3D CARD PERSPECTIVE TILT EFFECT */
  if (!isMobileDevice) {
    document.querySelectorAll('.project-card, .skill-category, .testimonial-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = -((y - centerY) / centerY) * 5;
        const rotateY = ((x - centerX) / centerX) * 5;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* 5. PROJECT CATEGORY FILTER & DEEP DETAIL MODAL */
  (function initProjectCategoryAndModal() {
    const filterTabs = document.querySelectorAll('#projectFilterBar .filter-tab');
    const projectCards = document.querySelectorAll('#projectsGrid .project-card');

    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        AudioEngine.playClick();
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const category = tab.getAttribute('data-filter');
        projectCards.forEach(card => {
          const cardCat = card.getAttribute('data-category');
          if (category === 'all' || cardCat === category) {
            card.style.display = 'block';
            card.style.animation = 'fadeIn 0.4s ease forwards';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });

    const modal = document.getElementById('projectDetailModal');
    const backdrop = document.getElementById('projectModalBackdrop');
    const closeBtn = document.getElementById('closeProjectModal');
    const headerContainer = document.getElementById('projectModalHeader');
    const bodyContainer = document.getElementById('projectModalBody');

    const projectDetailsData = {
      '1': {
        title: 'Endometrium Cancer Detection System',
        tags: ['Flask', 'CNN', 'OpenCV', 'TensorFlow', 'Python'],
        desc: 'An end-to-end medical AI application engineered to assist pathologists in accurately detecting and classifying endometrial carcinoma from biopsy histopathological slides.',
        highlights: [
          'Achieved high accuracy leveraging custom Deep Convolutional Neural Network architectures trained on augmented histopathological dataset.',
          'Integrated OpenCV preprocessing pipelines for contrast enhancement, noise reduction, and adaptive thresholding.',
          'Built lightweight interactive Web UI using Flask to allow medical users to upload high-res images and get instant heatmap diagnostics.'
        ],
        github: 'https://github.com/SAKSHAMRD8528/endometrium-cancer-detection'
      },
      '2': {
        title: 'Pizza Sales Business Analytics Engine',
        tags: ['MySQL', 'Python', 'Pandas', 'Plotly', 'Data Analytics'],
        desc: 'A comprehensive data analytics pipeline designed to extract strategic operational insights from multi-thousand row restaurant transactional databases.',
        highlights: [
          'Wrote 25+ optimized SQL queries featuring window functions, aggregations, and subqueries to calculate Average Order Value, Revenue by Category, and Hourly Order Volume.',
          'Created interactive visual dashboards in Python demonstrating peak dining trends, order size distribution, and top-performing menu items.',
          'Formulated actionable recommendations for inventory optimization and targeted promotional campaigns.'
        ],
        github: 'https://github.com/SAKSHAMRD8528'
      },
      '3': {
        title: 'Cyber Multi-Agent Framework',
        tags: ['Python', 'LLM Orchestration', 'REST API', 'AsyncIO'],
        desc: 'High-performance asynchronous agent orchestrator that coordinates automated research subagents, code generation tools, and self-healing execution loops.',
        highlights: [
          'Designed decoupled agent communication layer for agent-to-agent task delegation and state sync.',
          'Implemented automated retry & error rollback mechanisms to maintain robust long-running task completion.',
          'Built custom CLI terminal bindings and RESTful WebSocket endpoints for live monitoring.'
        ],
        github: 'https://github.com/SAKSHAMRD8528'
      }
    };

    document.querySelectorAll('[data-open-project-modal="true"], .btn-deep-modal').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const card = trigger.closest('.project-card');
        if (!card) return;
        const pId = card.getAttribute('data-project-id');
        const data = projectDetailsData[pId];
        if (!data) return;

        AudioEngine.playClick();

        if (headerContainer && bodyContainer) {
          headerContainer.innerHTML = `
            <div class="pm-header-tags">${data.tags.map(t => `<span class="project-tag">${t}</span>`).join('')}</div>
            <h2 class="pm-title">${data.title}</h2>
          `;
          bodyContainer.innerHTML = `
            <div class="pm-section-label">Problem Statement &amp; Overview</div>
            <p class="pm-desc">${data.desc}</p>
            <div class="pm-section-label">Key Engineering Highlights</div>
            <ul class="pm-highlights-list">
              ${data.highlights.map(h => `<li>${h}</li>`).join('')}
            </ul>
            <div class="pm-actions">
              <a href="${data.github}" target="_blank" rel="noopener" class="btn btn-primary magnetic-btn">
                <span>View Full Source Code on GitHub →</span>
              </a>
            </div>
          `;
        }

        if (modal) modal.classList.add('active');
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', () => modal && modal.classList.remove('active'));
    if (backdrop) backdrop.addEventListener('click', () => modal && modal.classList.remove('active'));
  })();

  /* 6. SKILL CATEGORY FILTER & CONTACT FEATURES */
  (function initSkillFilterAndContact() {
    const skillTabs = document.querySelectorAll('#skillFilterBar .skill-filter-tab');
    const skillCategories = document.querySelectorAll('.skills-grid .skill-category');
    const techTags = document.querySelectorAll('.tech-tags .tech-tag');

    skillTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        AudioEngine.playClick();
        skillTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const filter = tab.getAttribute('data-skill-filter');

        // Filter skill category cards
        skillCategories.forEach(cat => {
          const catKey = cat.getAttribute('data-skill-category');
          if (filter === 'all' || catKey === filter) {
            cat.style.display = '';
            cat.style.animation = 'fadeIn 0.3s ease forwards';
          } else {
            cat.style.display = 'none';
          }
        });

        // Filter bottom tech tags
        techTags.forEach(tag => {
          const tagKey = tag.getAttribute('data-skill-category');
          if (filter === 'all' || tagKey === filter) {
            tag.style.display = '';
          } else {
            tag.style.display = 'none';
          }
        });
      });
    });

    // Contact Quick Copy
    document.querySelectorAll('.contact-copy-item').forEach(item => {
      item.addEventListener('click', () => {
        const text = item.getAttribute('data-copy-text');
        const badge = item.querySelector('.contact-copy-badge');
        if (text) {
          navigator.clipboard.writeText(text);
          AudioEngine.playChime();
          if (badge) {
            const orig = badge.textContent;
            badge.textContent = 'Copied! ✓';
            badge.classList.add('copied');
            setTimeout(() => {
              badge.textContent = orig;
              badge.classList.remove('copied');
            }, 2000);
          }
        }
      });
    });

    // Live Local IST Clock
    const clockEl = document.getElementById('localTimeClock');
    function updateClock() {
      if (!clockEl) return;
      const now = new Date();
      const options = { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
      clockEl.textContent = `${now.toLocaleTimeString('en-US', options)} (IST)`;
    }
    setInterval(updateClock, 1000);
    updateClock();

    // Footer scroll tracking for Speed Reader achievement
    let footerReached = false;
    window.addEventListener('scroll', () => {
      if (!footerReached && (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
        footerReached = true;
        AchievementManager.unlock('speed');
      }
    });
  })();
}

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMain);
  } else {
    initMain();
  }
})();

