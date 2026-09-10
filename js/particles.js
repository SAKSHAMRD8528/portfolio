/* ============================================
   PARTICLES.JS — Neural Network Canvas Engine
   ============================================ */

(function () {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouse = { x: null, y: null, radius: 150 };
  let animFrameId;
  let width, height;

  // Settings
  const PARTICLE_COUNT_DESKTOP = 90;
  const PARTICLE_COUNT_MOBILE = 40;
  const CONNECTION_DISTANCE = 150;
  const MOUSE_REPEL_FORCE = 0.08;

  function getParticleCount() {
    return window.innerWidth < 768 ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP;
  }

  function getAccentColor() {
    const theme = document.documentElement.getAttribute('data-theme');
    return theme === 'light' ? 'rgba(0, 102, 0,' : 'rgba(0, 255, 65,';
  }

  function getSecondaryColor() {
    const theme = document.documentElement.getAttribute('data-theme');
    return theme === 'light' ? 'rgba(0, 153, 0,' : 'rgba(0, 204, 51,';
  }

  function resize() {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  }

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 2.5 + 0.8;
      this.speedX = (Math.random() - 0.5) * 0.8;
      this.speedY = (Math.random() - 0.5) * 0.8;
      this.opacity = Math.random() * 0.5 + 0.3;
      this.isAccent = Math.random() > 0.7;
    }

    update() {
      // Mouse repel
      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x += dx / dist * force * MOUSE_REPEL_FORCE * 10;
          this.y += dy / dist * force * MOUSE_REPEL_FORCE * 10;
        }
      }

      this.x += this.speedX;
      this.y += this.speedY;

      // Wrap around edges
      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;
    }

    draw() {
      const colorBase = this.isAccent ? getSecondaryColor() : getAccentColor();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = colorBase + this.opacity + ')';
      ctx.fill();

      // Glow effect for accent particles
      if (this.isAccent) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = colorBase + (this.opacity * 0.1) + ')';
        ctx.fill();
      }
    }
  }

  function connectParticles() {
    const accent = getAccentColor();
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECTION_DISTANCE) {
          const opacity = (1 - dist / CONNECTION_DISTANCE) * 0.2;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = accent + opacity + ')';
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    connectParticles();
    animFrameId = requestAnimationFrame(animate);
  }

  function init() {
    resize();
    particles = [];
    const count = getParticleCount();
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
    if (animFrameId) cancelAnimationFrame(animFrameId);
    animate();
  }

  // Event Listeners
  window.addEventListener('resize', () => {
    resize();
    // Re-init if particle count changes based on breakpoint
    const targetCount = getParticleCount();
    if (Math.abs(particles.length - targetCount) > 10) {
      init();
    }
  });

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  canvas.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Initialize
  init();

  // Re-init on theme change (colors change)
  const observer = new MutationObserver(() => {
    // Colors are handled dynamically in draw, no re-init needed
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
})();
