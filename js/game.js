/* ============================================
   GAME.JS — Cyber Space Blaster / Asteroids Arcade
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const gameModal = document.getElementById('gameModal');
  const gameModalBackdrop = document.getElementById('gameModalBackdrop');
  const closeGameBtns = document.querySelectorAll('#closeGameBtn, #closeGameIconBtn');
  const openGameTriggers = document.querySelectorAll('[data-open-game], #navGameBtn, #heroGameBtn');

  const canvas = document.getElementById('arcadeCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const scoreEl = document.getElementById('gameScore');
  const highScoreEl = document.getElementById('gameHighScore');
  const livesEl = document.getElementById('gameLives');
  const restartBtn = document.getElementById('gameRestartBtn');
  const overlayScreen = document.getElementById('gameOverOverlay');
  const overlayTitle = document.getElementById('gameOverTitle');
  const overlaySubtitle = document.getElementById('gameOverSubtitle');

  // Audio synthesizer (8-bit Web Audio API)
  let audioCtx = null;
  function playSound(type) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;

      if (type === 'laser') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'hit') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'powerup') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(660, now + 0.08);
        osc.frequency.setValueAtTime(880, now + 0.16);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'gameover') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.5);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      }
    } catch (e) {
      // Audio might be blocked on some environments
    }
  }

  let animationFrameId = null;
  let isGameRunning = false;
  let score = 0;
  let highScore = parseInt(localStorage.getItem('spaceBlasterHighScore') || '0', 10);
  let lives = 3;
  let wave = 1;

  if (highScoreEl) highScoreEl.textContent = highScore;

  // Game dimensions
  let width = 600;
  let height = 400;

  function resizeCanvas() {
    const container = canvas.parentElement;
    if (container) {
      width = Math.min(container.clientWidth - 4, 700);
      height = Math.min(window.innerHeight * 0.55, 450);
      canvas.width = width;
      canvas.height = height;
    }
  }

  // Player State
  const player = {
    x: width / 2,
    y: height - 40,
    width: 26,
    height: 26,
    speed: 6.5,
    isShooting: false,
    lastShot: 0,
    shootCooldown: 180,
    powerup: 'normal',
    powerupTimer: 0,
    invincibleTimer: 0
  };

  // Game Entities
  let lasers = [];
  let enemies = [];
  let particles = [];
  let powerups = [];
  let stars = [];

  // Keys state
  const keys = {
    left: false,
    right: false,
    up: false,
    down: false,
    space: false
  };

  // Generate background stars
  function initStars() {
    stars = [];
    for (let i = 0; i < 60; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 1.5 + 0.5,
        color: ['#ffffff', '#6c63ff', '#00d4ff', '#ff2d78'][Math.floor(Math.random() * 4)]
      });
    }
  }

  // Initialize/Reset Game
  function resetGame() {
    score = 0;
    lives = 3;
    wave = 1;
    lasers = [];
    enemies = [];
    particles = [];
    powerups = [];
    player.x = width / 2;
    player.y = height - 45;
    player.powerup = 'normal';
    player.powerupTimer = 0;
    player.invincibleTimer = 60;
    updateHUD();
    initStars();
    if (overlayScreen) overlayScreen.style.display = 'none';
    isGameRunning = true;
  }

  function updateHUD() {
    if (scoreEl) scoreEl.textContent = score;
    if (highScoreEl) highScoreEl.textContent = highScore;
    if (livesEl) {
      livesEl.innerHTML = '❤️'.repeat(Math.max(0, lives));
    }
  }

  // Spawn Enemies / Asteroids
  let lastSpawn = 0;
  function spawnEnemy(timestamp) {
    const spawnRate = Math.max(700, 1600 - (wave * 80));
    if (timestamp - lastSpawn > spawnRate) {
      lastSpawn = timestamp;
      const type = Math.random() > 0.35 ? 'asteroid' : 'invader';
      const size = type === 'asteroid' ? (Math.random() * 14 + 16) : 22;
      enemies.push({
        type: type,
        x: Math.random() * (width - size * 2) + size,
        y: -size,
        size: size,
        speed: Math.random() * 1.8 + 1.2 + (wave * 0.15),
        hp: type === 'asteroid' && size > 24 ? 2 : 1,
        angle: 0,
        rotSpeed: (Math.random() - 0.5) * 0.08,
        color: type === 'invader' ? '#ff2d78' : '#00d4ff'
      });
    }
  }

  // Create Explosion Particles
  function createExplosion(x, y, color, count = 16) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1.5;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 1.5,
        color: color,
        alpha: 1,
        decay: Math.random() * 0.03 + 0.02
      });
    }
  }

  // Shoot Laser
  function fireLaser() {
    const now = performance.now();
    if (now - player.lastShot < player.shootCooldown) return;
    player.lastShot = now;

    playSound('laser');

    if (player.powerup === 'spread') {
      lasers.push({ x: player.x, y: player.y - 12, vx: 0, vy: -8, color: '#00ff41' });
      lasers.push({ x: player.x - 6, y: player.y - 8, vx: -2, vy: -7.5, color: '#00ff41' });
      lasers.push({ x: player.x + 6, y: player.y - 8, vx: 2, vy: -7.5, color: '#00ff41' });
    } else if (player.powerup === 'rapid') {
      lasers.push({ x: player.x, y: player.y - 12, vx: 0, vy: -9, color: '#ffbd2e' });
    } else {
      lasers.push({ x: player.x, y: player.y - 12, vx: 0, vy: -8, color: '#00d4ff' });
    }
  }

  // Game Loop
  let lastTimestamp = 0;
  function gameLoop(timestamp) {
    if (!isGameRunning) return;

    ctx.clearRect(0, 0, width, height);

    // 1. Draw Starfield
    stars.forEach(star => {
      star.y += star.speed;
      if (star.y > height) {
        star.y = 0;
        star.x = Math.random() * width;
      }
      ctx.fillStyle = star.color;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // 2. Player Movement
    if (keys.left && player.x > player.width / 2 + 5) {
      player.x -= player.speed;
    }
    if (keys.right && player.x < width - player.width / 2 - 5) {
      player.x += player.speed;
    }
    if (keys.space) {
      fireLaser();
    }

    if (player.invincibleTimer > 0) player.invincibleTimer--;
    if (player.powerupTimer > 0) {
      player.powerupTimer--;
      if (player.powerupTimer <= 0) {
        player.powerup = 'normal';
        player.shootCooldown = 180;
      }
    }

    // Draw Player Ship
    if (player.invincibleTimer % 6 < 3) {
      ctx.save();
      ctx.translate(player.x, player.y);

      // Ship body
      ctx.fillStyle = player.powerup === 'spread' ? '#00ff41' : (player.powerup === 'rapid' ? '#ffbd2e' : '#6c63ff');
      ctx.beginPath();
      ctx.moveTo(0, -14);
      ctx.lineTo(12, 12);
      ctx.lineTo(0, 7);
      ctx.lineTo(-12, 12);
      ctx.closePath();
      ctx.fill();

      // Cockpit glow
      ctx.fillStyle = '#00d4ff';
      ctx.beginPath();
      ctx.arc(0, -2, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Thruster flame
      ctx.fillStyle = Math.random() > 0.5 ? '#ff2d78' : '#ffbd2e';
      ctx.beginPath();
      ctx.moveTo(-4, 9);
      ctx.lineTo(0, 16 + Math.random() * 5);
      ctx.lineTo(4, 9);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    // 3. Update & Draw Lasers
    for (let i = lasers.length - 1; i >= 0; i--) {
      const l = lasers[i];
      l.x += l.vx;
      l.y += l.vy;

      ctx.fillStyle = l.color;
      ctx.shadowColor = l.color;
      ctx.shadowBlur = 8;
      ctx.fillRect(l.x - 2, l.y, 4, 10);
      ctx.shadowBlur = 0;

      if (l.y < -20 || l.x < 0 || l.x > width) {
        lasers.splice(i, 1);
      }
    }

    // 4. Update & Draw Enemies
    spawnEnemy(timestamp);

    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      e.y += e.speed;
      e.angle += e.rotSpeed;

      ctx.save();
      ctx.translate(e.x, e.y);
      ctx.rotate(e.angle);

      if (e.type === 'asteroid') {
        ctx.strokeStyle = e.color;
        ctx.lineWidth = 2;
        ctx.fillStyle = 'rgba(0, 212, 255, 0.15)';
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
          const r = e.size * (0.8 + Math.sin(a * 3) * 0.2);
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          if (a === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else {
        // Space Invader Bug
        ctx.fillStyle = e.color;
        ctx.shadowColor = e.color;
        ctx.shadowBlur = 6;
        ctx.fillRect(-10, -8, 20, 16);
        ctx.fillStyle = '#fff';
        ctx.fillRect(-6, -4, 3, 3);
        ctx.fillRect(3, -4, 3, 3);
        ctx.shadowBlur = 0;
      }
      ctx.restore();

      // Check Laser vs Enemy Collision
      for (let j = lasers.length - 1; j >= 0; j--) {
        const l = lasers[j];
        const dist = Math.hypot(e.x - l.x, e.y - l.y);
        if (dist < e.size + 4) {
          e.hp--;
          lasers.splice(j, 1);

          if (e.hp <= 0) {
            playSound('hit');
            createExplosion(e.x, e.y, e.color, 14);

            // Chance to drop powerup
            if (Math.random() < 0.18) {
              powerups.push({
                x: e.x,
                y: e.y,
                type: Math.random() > 0.5 ? 'spread' : 'rapid',
                vy: 1.5
              });
            }

            score += e.type === 'invader' ? 25 : 15;
            if (score > highScore) {
              highScore = score;
              localStorage.setItem('spaceBlasterHighScore', highScore.toString());
            }
            updateHUD();

            // Progress waves
            if (score % 200 === 0) {
              wave++;
            }

            enemies.splice(i, 1);
            break;
          }
        }
      }

      // Check Player vs Enemy Collision
      if (player.invincibleTimer <= 0) {
        const pDist = Math.hypot(e.x - player.x, e.y - player.y);
        if (pDist < e.size + 12) {
          playSound('gameover');
          createExplosion(player.x, player.y, '#ff5f56', 24);
          lives--;
          player.invincibleTimer = 80;
          player.powerup = 'normal';
          updateHUD();
          enemies.splice(i, 1);

          if (lives <= 0) {
            gameOver();
            return;
          }
        }
      }

      // Despawn offscreen
      if (e.y > height + 40) {
        enemies.splice(i, 1);
      }
    }

    // 5. Update & Draw Powerups
    for (let i = powerups.length - 1; i >= 0; i--) {
      const p = powerups[i];
      p.y += p.vy;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.fillStyle = p.type === 'spread' ? '#00ff41' : '#ffbd2e';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.font = 'bold 9px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.type === 'spread' ? 'S' : 'R', 0, 1);
      ctx.restore();

      // Pickup Collision
      if (Math.hypot(p.x - player.x, p.y - player.y) < 20) {
        playSound('powerup');
        player.powerup = p.type;
        player.powerupTimer = 400; // ~7 seconds
        if (p.type === 'rapid') player.shootCooldown = 90;
        createExplosion(p.x, p.y, '#ffffff', 10);
        powerups.splice(i, 1);
      } else if (p.y > height + 20) {
        powerups.splice(i, 1);
      }
    }

    // 6. Update & Draw Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const pt = particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.alpha -= pt.decay;

      if (pt.alpha <= 0) {
        particles.splice(i, 1);
      } else {
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = Math.max(0, pt.alpha);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    animationFrameId = requestAnimationFrame(gameLoop);
  }

  function gameOver() {
    isGameRunning = false;
    cancelAnimationFrame(animationFrameId);
    if (overlayScreen) {
      overlayTitle.textContent = 'GAME OVER';
      overlaySubtitle.textContent = `Score: ${score} | High Score: ${highScore}`;
      overlayScreen.style.display = 'flex';
    }
  }

  // Modal Open / Close Logic
  function openGameModal() {
    if (!gameModal) return;
    gameModal.classList.add('active');
    gameModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    resizeCanvas();
    resetGame();
    animationFrameId = requestAnimationFrame(gameLoop);
  }

  function closeGameModal() {
    if (!gameModal) return;
    isGameRunning = false;
    cancelAnimationFrame(animationFrameId);
    gameModal.classList.remove('active');
    gameModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Expose globally
  window.openGameModal = openGameModal;
  window.closeGameModal = closeGameModal;

  openGameTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openGameModal();
    });
  });

  closeGameBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      closeGameModal();
    });
  });

  if (gameModalBackdrop) {
    gameModalBackdrop.addEventListener('click', closeGameModal);
  }

  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      resetGame();
      animationFrameId = requestAnimationFrame(gameLoop);
    });
  }

  // Keyboard Event Handlers
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true;
    if (e.key === ' ' || e.code === 'Space') {
      if (gameModal && gameModal.classList.contains('active')) {
        e.preventDefault();
        keys.space = true;
        if (!isGameRunning) {
          resetGame();
          animationFrameId = requestAnimationFrame(gameLoop);
        }
      }
    }
    if (e.key === 'Escape' && gameModal && gameModal.classList.contains('active')) {
      closeGameModal();
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
    if (e.key === ' ' || e.code === 'Space') keys.space = false;
  });

  // Mobile On-Screen Controls
  const btnLeft = document.getElementById('touchLeftBtn');
  const btnRight = document.getElementById('touchRightBtn');
  const btnFire = document.getElementById('touchFireBtn');

  if (btnLeft && btnRight && btnFire) {
    const bindTouch = (el, keyName) => {
      el.addEventListener('touchstart', (e) => { e.preventDefault(); keys[keyName] = true; });
      el.addEventListener('touchend', (e) => { e.preventDefault(); keys[keyName] = false; });
      el.addEventListener('mousedown', () => { keys[keyName] = true; });
      el.addEventListener('mouseup', () => { keys[keyName] = false; });
    };
    bindTouch(btnLeft, 'left');
    bindTouch(btnRight, 'right');
    bindTouch(btnFire, 'space');
  }

  // Mouse / Drag Move on Canvas
  canvas.addEventListener('mousemove', (e) => {
    if (!isGameRunning) return;
    const rect = canvas.getBoundingClientRect();
    const targetX = e.clientX - rect.left;
    player.x = Math.max(player.width / 2, Math.min(width - player.width / 2, targetX));
  });

  canvas.addEventListener('mousedown', () => {
    if (isGameRunning) fireLaser();
  });

  window.addEventListener('resize', () => {
    if (gameModal && gameModal.classList.contains('active')) {
      resizeCanvas();
    }
  });
});
