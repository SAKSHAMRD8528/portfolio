/* ============================================
   GAME.JS — Chrome Dino Runner (T-Rex Arcade)
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const gameModal = document.getElementById('gameModal');
  const gameModalBackdrop = document.getElementById('gameModalBackdrop');
  const closeGameBtns = document.querySelectorAll('#closeGameBtn, #closeGameIconBtn');
  const openGameTriggers = document.querySelectorAll('[data-open-game]');

  const canvas = document.getElementById('arcadeCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const scoreEl = document.getElementById('gameScore');
  const highScoreEl = document.getElementById('gameHighScore');
  const restartBtn = document.getElementById('gameRestartBtn');
  const overlayScreen = document.getElementById('gameOverOverlay');
  const overlayTitle = document.getElementById('gameOverTitle');
  const overlaySubtitle = document.getElementById('gameOverSubtitle');

  const touchDuckBtn = document.getElementById('touchDuckBtn');
  const touchJumpBtn = document.getElementById('touchJumpBtn');

  // Web Audio Synth for 8-bit Sound Effects
  let audioCtx = null;
  function playSound(type) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'jump') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'score') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(659.25, now);
        osc.frequency.setValueAtTime(880, now + 0.08);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'hit') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.25);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch (e) {
      // Audio might fail in non-interactive environments
    }
  }

  // High Score
  let highScore = parseInt(localStorage.getItem('chromeDinoHighScore') || '0', 10);
  if (highScoreEl) highScoreEl.textContent = String(highScore).padStart(5, '0');

  // Canvas Dimensions
  let width = 640;
  let height = 240;
  const GROUND_Y = 200;

  function resizeCanvas() {
    const container = canvas.parentElement;
    if (container) {
      width = Math.min(container.clientWidth - 4, 700);
      height = 240;
      canvas.width = width;
      canvas.height = height;
    }
  }

  // Game Loop State
  let animationFrameId = null;
  let isRunning = false;
  let isGameOver = false;
  let score = 0;
  let rawScore = 0;
  let gameSpeed = 6;
  let speedMultiplier = 1;
  let lastScoreMilestone = 0;
  let tick = 0;

  // Day / Night Theme
  let isNight = false;

  // Clouds
  let clouds = [];
  function initClouds() {
    clouds = [
      { x: 100, y: 35, speed: 0.6, width: 46 },
      { x: 320, y: 55, speed: 0.8, width: 52 },
      { x: 550, y: 40, speed: 0.5, width: 40 }
    ];
  }

  // Ground Line Points & Pebbles
  let groundOffset = 0;
  let groundBumps = [];
  function initGround() {
    groundBumps = [];
    for (let x = 0; x < 900; x += 30 + Math.random() * 40) {
      groundBumps.push({
        x: x,
        length: 4 + Math.random() * 12,
        yOffset: Math.random() > 0.5 ? 4 : 8
      });
    }
  }

  // Dino Character State
  const dino = {
    x: 45,
    y: GROUND_Y - 44,
    baseY: GROUND_Y - 44,
    width: 40,
    height: 44,
    duckHeight: 26,
    vy: 0,
    gravity: 0.65,
    jumpPower: -11.5,
    isGrounded: true,
    isDucking: false,
    legState: 0,
    stepTimer: 0,
    isDead: false
  };

  // Obstacles
  let obstacles = [];
  let nextObstacleDistance = 250;

  function spawnObstacle() {
    const minDistance = Math.max(160, 280 - gameSpeed * 12);
    const randomExtra = Math.random() * 160;
    nextObstacleDistance = width + minDistance + randomExtra;

    // Types: 0: Small Cactus, 1: Double Small Cactus, 2: Tall Cactus, 3: Bird (Pterodactyl)
    const canSpawnBird = score > 120;
    const rand = Math.random();

    let type = 'small_cactus';
    let obsWidth = 16;
    let obsHeight = 34;
    let obsY = GROUND_Y - 34;
    let flyAltitude = 0;

    if (canSpawnBird && rand > 0.72) {
      type = 'bird';
      obsWidth = 38;
      obsHeight = 24;
      // 3 altitudes: 0 = must duck, 1 = must jump, 2 = jump or duck
      const altType = Math.random();
      if (altType < 0.35) {
        obsY = GROUND_Y - 24; // Low (jump over)
      } else if (altType < 0.7) {
        obsY = GROUND_Y - 52; // Mid (must duck under)
      } else {
        obsY = GROUND_Y - 80; // High (fly over head)
      }
    } else if (rand > 0.45) {
      type = 'tall_cactus';
      obsWidth = 22;
      obsHeight = 44;
      obsY = GROUND_Y - 44;
    } else if (rand > 0.25) {
      type = 'double_cactus';
      obsWidth = 32;
      obsHeight = 34;
      obsY = GROUND_Y - 34;
    }

    obstacles.push({
      type,
      x: width + 20,
      y: obsY,
      width: obsWidth,
      height: obsHeight,
      frame: 0,
      frameTimer: 0
    });
  }

  // Jump Action
  function jump() {
    if (isGameOver) {
      resetGame();
      animationFrameId = requestAnimationFrame(gameLoop);
      return;
    }
    if (!isRunning) {
      resetGame();
      animationFrameId = requestAnimationFrame(gameLoop);
      return;
    }
    if (dino.isGrounded) {
      dino.vy = dino.jumpPower;
      dino.isGrounded = false;
      playSound('jump');
    }
  }

  // Duck Action
  function duck(active) {
    if (dino.isDead) return;
    dino.isDucking = active;
    if (active && !dino.isGrounded) {
      // Fast drop when ducking mid-air
      dino.vy += 2.5;
    }
  }

  // Reset Game
  function resetGame() {
    isRunning = true;
    isGameOver = false;
    dino.isDead = false;
    dino.isGrounded = true;
    dino.isDucking = false;
    dino.vy = 0;
    dino.y = dino.baseY;

    score = 0;
    rawScore = 0;
    gameSpeed = 6.5;
    speedMultiplier = 1;
    lastScoreMilestone = 0;
    tick = 0;
    isNight = false;

    obstacles = [];
    nextObstacleDistance = 300;

    initClouds();
    initGround();

    if (overlayScreen) overlayScreen.style.display = 'none';
    if (scoreEl) scoreEl.textContent = '00000';
  }

  function gameOver() {
    isRunning = false;
    isGameOver = true;
    dino.isDead = true;
    cancelAnimationFrame(animationFrameId);
    playSound('hit');

    if (score > highScore) {
      highScore = score;
      localStorage.setItem('chromeDinoHighScore', highScore);
      if (highScoreEl) highScoreEl.textContent = String(highScore).padStart(5, '0');
    }

    if (overlayScreen) {
      overlayScreen.style.display = 'flex';
      if (overlaySubtitle) {
        overlaySubtitle.textContent = `Score: ${score}  |  HI: ${highScore}`;
      }
    }
  }

  // Collision Box Detection (AABB with slight padding for fairness)
  function checkCollision(d, obs) {
    const padX = 4;
    const padY = 4;

    const dHeight = d.isDucking ? d.duckHeight : d.height;
    const dY = d.isDucking ? (GROUND_Y - d.duckHeight) : d.y;

    const dLeft = d.x + padX;
    const dRight = d.x + d.width - padX;
    const dTop = dY + padY;
    const dBottom = dY + dHeight;

    const obsLeft = obs.x + padX;
    const obsRight = obs.x + obs.width - padX;
    const obsTop = obs.y + padY;
    const obsBottom = obs.y + obs.height;

    return !(dRight < obsLeft || dLeft > obsRight || dBottom < obsTop || dTop > obsBottom);
  }

  // DRAWING FUNCTIONS
  function drawDino() {
    const fgColor = isNight ? '#00d4ff' : '#27c93f';
    ctx.fillStyle = fgColor;

    const dY = dino.isDucking ? (GROUND_Y - dino.duckHeight) : dino.y;
    const dX = dino.x;

    if (dino.isDucking) {
      // Ducking Dino Body (Horizontal Profile)
      ctx.fillRect(dX, dY + 6, 38, 14);
      // Head
      ctx.fillRect(dX + 26, dY, 18, 14);
      // Eye
      ctx.fillStyle = isNight ? '#0a0e17' : '#0a0e17';
      ctx.fillRect(dX + 38, dY + 3, 3, 3);
      ctx.fillStyle = fgColor;
      // Snout
      ctx.fillRect(dX + 40, dY + 8, 8, 6);
      // Tail
      ctx.fillRect(dX - 6, dY + 8, 8, 6);
      // Legs (Crawling)
      if (dino.legState === 0) {
        ctx.fillRect(dX + 8, dY + 20, 6, 6);
        ctx.fillRect(dX + 22, dY + 20, 6, 3);
      } else {
        ctx.fillRect(dX + 8, dY + 20, 6, 3);
        ctx.fillRect(dX + 22, dY + 20, 6, 6);
      }
    } else {
      // Standing / Running Dino Body
      ctx.fillRect(dX + 8, dY + 12, 22, 22);
      // Head
      ctx.fillRect(dX + 16, dY, 20, 14);
      // Eye
      ctx.fillStyle = isNight ? '#0a0e17' : '#0a0e17';
      if (dino.isDead) {
        // X Eye
        ctx.fillRect(dX + 28, dY + 3, 4, 2);
        ctx.fillRect(dX + 29, dY + 2, 2, 4);
      } else {
        ctx.fillRect(dX + 28, dY + 3, 3, 3);
      }
      ctx.fillStyle = fgColor;
      // Snout / Mouth
      ctx.fillRect(dX + 32, dY + 6, 8, 8);
      // Arms
      ctx.fillRect(dX + 28, dY + 18, 6, 3);
      ctx.fillRect(dX + 32, dY + 19, 2, 4);
      // Tail
      ctx.fillRect(dX, dY + 18, 8, 10);
      ctx.fillRect(dX - 4, dY + 14, 6, 8);

      // Legs
      if (!dino.isGrounded) {
        // Jumping legs (pulled together)
        ctx.fillRect(dX + 12, dY + 34, 4, 10);
        ctx.fillRect(dX + 20, dY + 34, 4, 10);
      } else if (dino.isDead) {
        ctx.fillRect(dX + 12, dY + 34, 4, 10);
        ctx.fillRect(dX + 20, dY + 34, 4, 10);
      } else {
        // Alternating Run Legs
        if (dino.legState === 0) {
          ctx.fillRect(dX + 12, dY + 34, 4, 10);
          ctx.fillRect(dX + 12, dY + 42, 6, 2);
          ctx.fillRect(dX + 22, dY + 34, 4, 5);
        } else {
          ctx.fillRect(dX + 12, dY + 34, 4, 5);
          ctx.fillRect(dX + 22, dY + 34, 4, 10);
          ctx.fillRect(dX + 22, dY + 42, 6, 2);
        }
      }
    }
  }

  function drawCactus(obs) {
    ctx.fillStyle = isNight ? '#ff2d78' : '#27c93f';

    if (obs.type === 'tall_cactus') {
      // Main trunk
      ctx.fillRect(obs.x + 7, obs.y, 8, obs.height);
      // Left arm
      ctx.fillRect(obs.x, obs.y + 10, 7, 4);
      ctx.fillRect(obs.x, obs.y + 4, 4, 10);
      // Right arm
      ctx.fillRect(obs.x + 15, obs.y + 16, 7, 4);
      ctx.fillRect(obs.x + 18, obs.y + 10, 4, 10);
    } else if (obs.type === 'double_cactus') {
      // First small cactus
      ctx.fillRect(obs.x + 4, obs.y + 4, 6, obs.height - 4);
      ctx.fillRect(obs.x, obs.y + 12, 4, 3);
      ctx.fillRect(obs.x, obs.y + 8, 3, 7);
      // Second small cactus
      ctx.fillRect(obs.x + 18, obs.y, 6, obs.height);
      ctx.fillRect(obs.x + 24, obs.y + 10, 4, 3);
      ctx.fillRect(obs.x + 25, obs.y + 6, 3, 7);
    } else {
      // Single Small Cactus
      ctx.fillRect(obs.x + 5, obs.y, 6, obs.height);
      ctx.fillRect(obs.x, obs.y + 10, 5, 3);
      ctx.fillRect(obs.x, obs.y + 6, 3, 7);
      ctx.fillRect(obs.x + 11, obs.y + 14, 5, 3);
      ctx.fillRect(obs.x + 13, obs.y + 10, 3, 7);
    }
  }

  function drawBird(obs) {
    ctx.fillStyle = isNight ? '#ffbd2e' : '#00d4ff';

    const bX = obs.x;
    const bY = obs.y;

    // Body
    ctx.fillRect(bX + 8, bY + 8, 20, 8);
    // Beak / Head
    ctx.fillRect(bX, bY + 10, 8, 4);
    // Eye
    ctx.fillStyle = '#080c14';
    ctx.fillRect(bX + 6, bY + 9, 2, 2);
    ctx.fillStyle = isNight ? '#ffbd2e' : '#00d4ff';

    // Wings (Flapping Animation: 2 frames)
    if (obs.frame === 0) {
      // Wings UP
      ctx.fillRect(bX + 12, bY, 8, 8);
      ctx.fillRect(bX + 16, bY - 4, 4, 4);
    } else {
      // Wings DOWN
      ctx.fillRect(bX + 12, bY + 16, 8, 8);
      ctx.fillRect(bX + 16, bY + 24, 4, 4);
    }
  }

  function drawGround() {
    ctx.strokeStyle = isNight ? 'rgba(0, 212, 255, 0.4)' : 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 2;

    // Main line
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(width, GROUND_Y);
    ctx.stroke();

    // Bumps & texture
    ctx.fillStyle = isNight ? 'rgba(0, 212, 255, 0.5)' : 'rgba(255, 255, 255, 0.4)';
    for (const b of groundBumps) {
      const renderX = (b.x - groundOffset) % (width + 100);
      if (renderX >= -20 && renderX <= width) {
        ctx.fillRect(renderX, GROUND_Y + b.yOffset, b.length, 2);
      }
    }
  }

  function drawClouds() {
    ctx.fillStyle = isNight ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.25)';
    for (const c of clouds) {
      ctx.fillRect(c.x, c.y, c.width, 10);
      ctx.fillRect(c.x + 8, c.y - 6, c.width - 16, 6);
      ctx.fillRect(c.x + 14, c.y - 10, c.width - 28, 4);
    }
  }

  function drawMoonStars() {
    if (!isNight) return;
    // Stars
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(80, 30, 2, 2);
    ctx.fillRect(190, 45, 1, 1);
    ctx.fillRect(340, 25, 2, 2);
    ctx.fillRect(490, 50, 1, 1);
    ctx.fillRect(610, 35, 2, 2);

    // Glowing Cyber Moon
    ctx.fillStyle = '#00d4ff';
    ctx.fillRect(width - 70, 20, 18, 18);
    ctx.fillStyle = '#080c14';
    ctx.fillRect(width - 66, 18, 14, 14);
  }

  // MAIN GAME LOOP
  function gameLoop() {
    tick++;

    // Clear Canvas with Day/Night Background
    ctx.fillStyle = isNight ? '#060a12' : '#0a0e17';
    ctx.fillRect(0, 0, width, height);

    // Score & Speed update
    rawScore += 0.15;
    score = Math.floor(rawScore);
    if (scoreEl) scoreEl.textContent = String(score).padStart(5, '0');

    // Day / Night cycle every 500 points
    isNight = Math.floor(score / 500) % 2 === 1;

    // Speed progression
    gameSpeed = 6.5 + Math.min(score * 0.006, 7.5);

    // 100 pt milestone audio chime
    if (score > 0 && score % 100 === 0 && score !== lastScoreMilestone) {
      lastScoreMilestone = score;
      playSound('score');
    }

    // Scroll Clouds
    for (const c of clouds) {
      c.x -= c.speed;
      if (c.x + c.width < 0) c.x = width + Math.random() * 80;
    }
    drawMoonStars();
    drawClouds();

    // Scroll Ground
    groundOffset += gameSpeed;
    drawGround();

    // Update Dino Physics
    if (!dino.isGrounded) {
      dino.vy += dino.gravity;
      dino.y += dino.vy;

      if (dino.y >= dino.baseY) {
        dino.y = dino.baseY;
        dino.vy = 0;
        dino.isGrounded = true;
      }
    }

    // Dino Legs animation
    dino.stepTimer += gameSpeed;
    if (dino.stepTimer > 8) {
      dino.legState = dino.legState === 0 ? 1 : 0;
      dino.stepTimer = 0;
    }

    drawDino();

    // Obstacle management
    if (obstacles.length === 0 || (width - obstacles[obstacles.length - 1].x) > (200 + Math.random() * 180)) {
      if (Math.random() < 0.035) {
        spawnObstacle();
      }
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obs = obstacles[i];
      obs.x -= gameSpeed;

      if (obs.type === 'bird') {
        obs.frameTimer++;
        if (obs.frameTimer > 10) {
          obs.frame = obs.frame === 0 ? 1 : 0;
          obs.frameTimer = 0;
        }
        drawBird(obs);
      } else {
        drawCactus(obs);
      }

      // Check collision
      if (checkCollision(dino, obs)) {
        drawDino(); // Render dead state
        gameOver();
        return;
      }

      // Remove off-screen obstacles
      if (obs.x + obs.width < -30) {
        obstacles.splice(i, 1);
      }
    }

    if (isRunning) {
      animationFrameId = requestAnimationFrame(gameLoop);
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
    isRunning = false;
    isGameOver = true;
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

  // Keyboard Event Handlers (Space, Up, Down)
  window.addEventListener('keydown', (e) => {
    if (gameModal && gameModal.classList.contains('active')) {
      if (e.code === 'Space' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        jump();
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        duck(true);
      } else if (e.key === 'Escape') {
        closeGameModal();
      }
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
      duck(false);
    }
  });

  // Mouse & Touch Tap to Jump
  canvas.addEventListener('mousedown', () => {
    jump();
  });

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    jump();
  }, { passive: false });

  // On-screen touch buttons for mobile
  if (touchJumpBtn) {
    touchJumpBtn.addEventListener('touchstart', (e) => { e.preventDefault(); jump(); }, { passive: false });
    touchJumpBtn.addEventListener('mousedown', () => jump());
  }

  if (touchDuckBtn) {
    touchDuckBtn.addEventListener('touchstart', (e) => { e.preventDefault(); duck(true); }, { passive: false });
    touchDuckBtn.addEventListener('touchend', (e) => { e.preventDefault(); duck(false); }, { passive: false });
    touchDuckBtn.addEventListener('mousedown', () => duck(true));
    touchDuckBtn.addEventListener('mouseup', () => duck(false));
  }

  window.addEventListener('resize', () => {
    if (gameModal && gameModal.classList.contains('active')) {
      resizeCanvas();
    }
  });
});
