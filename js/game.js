/* ============================================
   GAME.JS — Dual Cyber Arcade (Dino & Space Blaster)
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const gameModal = document.getElementById('gameModal');
  const gameModalBackdrop = document.getElementById('gameModalBackdrop');
  const closeGameBtns = document.querySelectorAll('#closeGameBtn, #closeGameIconBtn');
  const openGameTriggers = document.querySelectorAll('[data-open-game]');

  const canvas = document.getElementById('arcadeCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const tabDino = document.getElementById('tabDino');
  const tabSpace = document.getElementById('tabSpace');

  const scoreEl = document.getElementById('gameScore');
  const highScoreEl = document.getElementById('gameHighScore');
  const livesEl = document.getElementById('gameLives');
  const livesWrapper = document.getElementById('hudLivesWrapper');
  const restartBtn = document.getElementById('gameRestartBtn');
  const overlayScreen = document.getElementById('gameOverOverlay');
  const overlayTitle = document.getElementById('gameOverTitle');
  const overlaySubtitle = document.getElementById('gameOverSubtitle');
  const instructionsEl = document.getElementById('gameInstructions');

  const dinoControls = document.getElementById('dinoTouchControls');
  const spaceControls = document.getElementById('spaceTouchControls');

  const touchDuckBtn = document.getElementById('touchDuckBtn');
  const touchJumpBtn = document.getElementById('touchJumpBtn');
  const touchLeftBtn = document.getElementById('touchLeftBtn');
  const touchRightBtn = document.getElementById('touchRightBtn');
  const touchFireBtn = document.getElementById('touchFireBtn');

  let currentGame = 'dino'; // 'dino' | 'space'

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
      } else if (type === 'laser') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.1);
        gain.gain.setValueAtTime(0.12, now);
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
      // Audio might fail on non-interactive environments
    }
  }

  // Canvas Dimensions
  let width = 640;
  let height = 260;
  let GROUND_Y = 220;

  function resizeCanvas() {
    const container = canvas.parentElement;
    if (container) {
      width = Math.min(container.clientWidth - 4, 700);
      height = currentGame === 'dino' ? 240 : 340;
      GROUND_Y = height - 35;
      canvas.width = width;
      canvas.height = height;
    }
  }

  let animationFrameId = null;
  let isRunning = false;
  let isGameOver = false;

  /* ==========================================
     GAME 1: CHROME DINO RUNNER
     ========================================== */
  let dinoScore = 0;
  let dinoRawScore = 0;
  let dinoHighScore = parseInt(localStorage.getItem('chromeDinoHighScore') || '0', 10);
  let dinoSpeed = 6.5;
  let dinoLastMilestone = 0;
  let dinoIsNight = false;

  let dinoClouds = [];
  let dinoGroundOffset = 0;
  let dinoGroundBumps = [];

  const dino = {
    x: 45,
    y: 175,
    baseY: 175,
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

  let dinoObstacles = [];

  function initDino() {
    dinoScore = 0;
    dinoRawScore = 0;
    dinoSpeed = 6.5;
    dinoLastMilestone = 0;
    dinoIsNight = false;
    dinoGroundOffset = 0;

    dino.y = GROUND_Y - 44;
    dino.baseY = GROUND_Y - 44;
    dino.vy = 0;
    dino.isGrounded = true;
    dino.isDucking = false;
    dino.isDead = false;

    dinoClouds = [
      { x: 100, y: 35, speed: 0.6, width: 46 },
      { x: 320, y: 55, speed: 0.8, width: 52 },
      { x: 550, y: 40, speed: 0.5, width: 40 }
    ];

    dinoGroundBumps = [];
    for (let x = 0; x < 900; x += 30 + Math.random() * 40) {
      dinoGroundBumps.push({
        x: x,
        length: 4 + Math.random() * 12,
        yOffset: Math.random() > 0.5 ? 4 : 8
      });
    }

    dinoObstacles = [];
  }

  function spawnDinoObstacle() {
    const canSpawnBird = dinoScore > 120;
    const rand = Math.random();

    let type = 'small_cactus';
    let obsWidth = 16;
    let obsHeight = 34;
    let obsY = GROUND_Y - 34;

    if (canSpawnBird && rand > 0.72) {
      type = 'bird';
      obsWidth = 38;
      obsHeight = 24;
      const altType = Math.random();
      if (altType < 0.35) {
        obsY = GROUND_Y - 24;
      } else if (altType < 0.7) {
        obsY = GROUND_Y - 52;
      } else {
        obsY = GROUND_Y - 80;
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

    dinoObstacles.push({
      type,
      x: width + 20,
      y: obsY,
      width: obsWidth,
      height: obsHeight,
      frame: 0,
      frameTimer: 0
    });
  }

  function dinoJump() {
    if (isGameOver) {
      resetActiveGame();
      animationFrameId = requestAnimationFrame(gameLoop);
      return;
    }
    if (dino.isGrounded) {
      dino.vy = dino.jumpPower;
      dino.isGrounded = false;
      playSound('jump');
    }
  }

  function dinoDuck(active) {
    if (dino.isDead) return;
    dino.isDucking = active;
    if (active && !dino.isGrounded) {
      dino.vy += 2.5;
    }
  }

  function checkDinoCollision(d, obs) {
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

  function drawDinoSprite() {
    const fgColor = dinoIsNight ? '#00d4ff' : '#27c93f';
    ctx.fillStyle = fgColor;

    const dY = dino.isDucking ? (GROUND_Y - dino.duckHeight) : dino.y;
    const dX = dino.x;

    if (dino.isDucking) {
      ctx.fillRect(dX, dY + 6, 38, 14);
      ctx.fillRect(dX + 26, dY, 18, 14);
      ctx.fillStyle = '#0a0e17';
      ctx.fillRect(dX + 38, dY + 3, 3, 3);
      ctx.fillStyle = fgColor;
      ctx.fillRect(dX + 40, dY + 8, 8, 6);
      ctx.fillRect(dX - 6, dY + 8, 8, 6);
      if (dino.legState === 0) {
        ctx.fillRect(dX + 8, dY + 20, 6, 6);
        ctx.fillRect(dX + 22, dY + 20, 6, 3);
      } else {
        ctx.fillRect(dX + 8, dY + 20, 6, 3);
        ctx.fillRect(dX + 22, dY + 20, 6, 6);
      }
    } else {
      ctx.fillRect(dX + 8, dY + 12, 22, 22);
      ctx.fillRect(dX + 16, dY, 20, 14);
      ctx.fillStyle = '#0a0e17';
      if (dino.isDead) {
        ctx.fillRect(dX + 28, dY + 3, 4, 2);
        ctx.fillRect(dX + 29, dY + 2, 2, 4);
      } else {
        ctx.fillRect(dX + 28, dY + 3, 3, 3);
      }
      ctx.fillStyle = fgColor;
      ctx.fillRect(dX + 32, dY + 6, 8, 8);
      ctx.fillRect(dX + 28, dY + 18, 6, 3);
      ctx.fillRect(dX + 32, dY + 19, 2, 4);
      ctx.fillRect(dX, dY + 18, 8, 10);
      ctx.fillRect(dX - 4, dY + 14, 6, 8);

      if (!dino.isGrounded || dino.isDead) {
        ctx.fillRect(dX + 12, dY + 34, 4, 10);
        ctx.fillRect(dX + 20, dY + 34, 4, 10);
      } else {
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

  function drawDinoObstacle(obs) {
    if (obs.type === 'bird') {
      ctx.fillStyle = dinoIsNight ? '#ffbd2e' : '#00d4ff';
      const bX = obs.x;
      const bY = obs.y;
      ctx.fillRect(bX + 8, bY + 8, 20, 8);
      ctx.fillRect(bX, bY + 10, 8, 4);
      ctx.fillStyle = '#080c14';
      ctx.fillRect(bX + 6, bY + 9, 2, 2);
      ctx.fillStyle = dinoIsNight ? '#ffbd2e' : '#00d4ff';
      if (obs.frame === 0) {
        ctx.fillRect(bX + 12, bY, 8, 8);
        ctx.fillRect(bX + 16, bY - 4, 4, 4);
      } else {
        ctx.fillRect(bX + 12, bY + 16, 8, 8);
        ctx.fillRect(bX + 16, bY + 24, 4, 4);
      }
    } else {
      ctx.fillStyle = dinoIsNight ? '#ff2d78' : '#27c93f';
      if (obs.type === 'tall_cactus') {
        ctx.fillRect(obs.x + 7, obs.y, 8, obs.height);
        ctx.fillRect(obs.x, obs.y + 10, 7, 4);
        ctx.fillRect(obs.x, obs.y + 4, 4, 10);
        ctx.fillRect(obs.x + 15, obs.y + 16, 7, 4);
        ctx.fillRect(obs.x + 18, obs.y + 10, 4, 10);
      } else if (obs.type === 'double_cactus') {
        ctx.fillRect(obs.x + 4, obs.y + 4, 6, obs.height - 4);
        ctx.fillRect(obs.x, obs.y + 12, 4, 3);
        ctx.fillRect(obs.x, obs.y + 8, 3, 7);
        ctx.fillRect(obs.x + 18, obs.y, 6, obs.height);
        ctx.fillRect(obs.x + 24, obs.y + 10, 4, 3);
        ctx.fillRect(obs.x + 25, obs.y + 6, 3, 7);
      } else {
        ctx.fillRect(obs.x + 5, obs.y, 6, obs.height);
        ctx.fillRect(obs.x, obs.y + 10, 5, 3);
        ctx.fillRect(obs.x, obs.y + 6, 3, 7);
        ctx.fillRect(obs.x + 11, obs.y + 14, 5, 3);
        ctx.fillRect(obs.x + 13, obs.y + 10, 3, 7);
      }
    }
  }

  function updateAndRenderDino() {
    ctx.fillStyle = dinoIsNight ? '#060a12' : '#0a0e17';
    ctx.fillRect(0, 0, width, height);

    dinoRawScore += 0.15;
    dinoScore = Math.floor(dinoRawScore);
    if (scoreEl) scoreEl.textContent = String(dinoScore).padStart(5, '0');

    dinoIsNight = Math.floor(dinoScore / 500) % 2 === 1;
    dinoSpeed = 6.5 + Math.min(dinoScore * 0.006, 7.5);

    if (dinoScore > 0 && dinoScore % 100 === 0 && dinoScore !== dinoLastMilestone) {
      dinoLastMilestone = dinoScore;
      playSound('score');
    }

    // Clouds
    ctx.fillStyle = dinoIsNight ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.25)';
    for (const c of dinoClouds) {
      c.x -= c.speed;
      if (c.x + c.width < 0) c.x = width + Math.random() * 80;
      ctx.fillRect(c.x, c.y, c.width, 10);
      ctx.fillRect(c.x + 8, c.y - 6, c.width - 16, 6);
    }

    // Ground
    dinoGroundOffset += dinoSpeed;
    ctx.strokeStyle = dinoIsNight ? 'rgba(0, 212, 255, 0.4)' : 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(width, GROUND_Y);
    ctx.stroke();

    ctx.fillStyle = dinoIsNight ? 'rgba(0, 212, 255, 0.5)' : 'rgba(255, 255, 255, 0.4)';
    for (const b of dinoGroundBumps) {
      const renderX = (b.x - dinoGroundOffset) % (width + 100);
      if (renderX >= -20 && renderX <= width) {
        ctx.fillRect(renderX, GROUND_Y + b.yOffset, b.length, 2);
      }
    }

    // Physics
    if (!dino.isGrounded) {
      dino.vy += dino.gravity;
      dino.y += dino.vy;
      if (dino.y >= dino.baseY) {
        dino.y = dino.baseY;
        dino.vy = 0;
        dino.isGrounded = true;
      }
    }

    dino.stepTimer += dinoSpeed;
    if (dino.stepTimer > 8) {
      dino.legState = dino.legState === 0 ? 1 : 0;
      dino.stepTimer = 0;
    }

    drawDinoSprite();

    // Obstacles
    if (dinoObstacles.length === 0 || (width - dinoObstacles[dinoObstacles.length - 1].x) > (200 + Math.random() * 180)) {
      if (Math.random() < 0.035) {
        spawnDinoObstacle();
      }
    }

    for (let i = dinoObstacles.length - 1; i >= 0; i--) {
      const obs = dinoObstacles[i];
      obs.x -= dinoSpeed;

      if (obs.type === 'bird') {
        obs.frameTimer++;
        if (obs.frameTimer > 10) {
          obs.frame = obs.frame === 0 ? 1 : 0;
          obs.frameTimer = 0;
        }
      }

      drawDinoObstacle(obs);

      if (checkDinoCollision(dino, obs)) {
        dino.isDead = true;
        drawDinoSprite();
        handleGameOver(dinoScore, dinoHighScore, 'chromeDinoHighScore');
        return;
      }

      if (obs.x + obs.width < -30) {
        dinoObstacles.splice(i, 1);
      }
    }
  }

  /* ==========================================
     GAME 2: SPACE ARCADE BLASTER
     ========================================== */
  let spaceScore = 0;
  let spaceHighScore = parseInt(localStorage.getItem('spaceBlasterHighScore') || '0', 10);
  let spaceLives = 3;
  let spaceLasers = [];
  let spaceEnemies = [];
  let spaceParticles = [];
  let spaceStars = [];
  let spaceLastShot = 0;
  let spaceInvulnerableTimer = 0;

  const player = {
    x: 320,
    y: 290,
    width: 28,
    height: 28,
    speed: 7.5
  };

  const spaceKeys = {
    left: false,
    right: false,
    fire: false
  };

  function initSpace() {
    spaceScore = 0;
    spaceLives = 3;
    spaceLasers = [];
    spaceEnemies = [];
    spaceParticles = [];
    spaceInvulnerableTimer = 0;
    player.x = width / 2;
    player.y = height - 40;

    spaceStars = [];
    for (let i = 0; i < 60; i++) {
      spaceStars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 1.8 + 0.6,
        color: ['#ffffff', '#6c63ff', '#00d4ff', '#ff2d78'][Math.floor(Math.random() * 4)]
      });
    }

    // Spawn 2 initial enemies immediately so action begins right away
    for (let i = 0; i < 2; i++) {
      spawnSpaceEnemy(Math.random() * -100 - 20);
    }

    updateSpaceLivesHUD();
  }

  function updateSpaceLivesHUD() {
    if (livesEl) {
      livesEl.textContent = '❤️'.repeat(Math.max(0, spaceLives));
    }
  }

  function fireSpaceLaser() {
    if (!isRunning || isGameOver) return;
    const now = Date.now();
    if (now - spaceLastShot < 140) return;
    spaceLastShot = now;

    // Dual plasma cannons
    spaceLasers.push({ x: player.x - 7, y: player.y - 14, vx: 0, vy: -10 });
    spaceLasers.push({ x: player.x + 7, y: player.y - 14, vx: 0, vy: -10 });
    playSound('laser');
  }

  function spawnSpaceEnemy(customY) {
    const types = ['invader', 'asteroid', 'cruiser'];
    const type = types[Math.floor(Math.random() * types.length)];
    const size = type === 'asteroid' ? 24 : 20;

    spaceEnemies.push({
      type,
      x: Math.random() * (width - 60) + 30,
      y: customY !== undefined ? customY : -25,
      size,
      speed: Math.random() * 1.5 + 2.0,
      hp: type === 'cruiser' ? 2 : 1,
      color: type === 'invader' ? '#ff2d78' : type === 'asteroid' ? '#8b949e' : '#ffbd2e'
    });
  }

  function createExplosion(x, y, color) {
    for (let i = 0; i < 14; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4.5 + 1.2;
      spaceParticles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 1,
        color: color || '#ff2d78',
        life: 1
      });
    }
  }

  function updateAndRenderSpace() {
    ctx.fillStyle = '#05070e';
    ctx.fillRect(0, 0, width, height);

    if (scoreEl) scoreEl.textContent = String(spaceScore).padStart(5, '0');

    // Background Stars
    for (const s of spaceStars) {
      s.y += s.speed;
      if (s.y > height) s.y = 0;
      ctx.fillStyle = s.color;
      ctx.fillRect(s.x, s.y, s.size, s.size);
    }

    // Player Movement
    if (spaceKeys.left) player.x -= player.speed;
    if (spaceKeys.right) player.x += player.speed;
    if (spaceKeys.fire) fireSpaceLaser();

    player.x = Math.max(player.width / 2, Math.min(width - player.width / 2, player.x));
    player.y = height - 40;

    if (spaceInvulnerableTimer > 0) spaceInvulnerableTimer--;

    // Render Player Ship (with flicker if invulnerable)
    if (spaceInvulnerableTimer % 4 < 2) {
      ctx.fillStyle = '#00d4ff';
      ctx.beginPath();
      ctx.moveTo(player.x, player.y - 14);
      ctx.lineTo(player.x - 14, player.y + 12);
      ctx.lineTo(player.x, player.y + 6);
      ctx.lineTo(player.x + 14, player.y + 12);
      ctx.closePath();
      ctx.fill();

      // Cockpit
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(player.x - 2, player.y - 4, 4, 6);

      // Thruster flame
      ctx.fillStyle = Math.random() > 0.5 ? '#ff2d78' : '#ffbd2e';
      ctx.fillRect(player.x - 3, player.y + 8, 6, Math.random() * 8 + 4);
    }

    // Lasers
    ctx.fillStyle = '#00ff41';
    for (let i = spaceLasers.length - 1; i >= 0; i--) {
      const l = spaceLasers[i];
      l.y += l.vy;
      ctx.fillRect(l.x - 2, l.y, 4, 12);
      if (l.y < -15) spaceLasers.splice(i, 1);
    }

    // Spawn Enemies
    if (Math.random() < 0.038) spawnSpaceEnemy();

    // Update Enemies
    for (let i = spaceEnemies.length - 1; i >= 0; i--) {
      const e = spaceEnemies[i];
      e.y += e.speed;
      ctx.fillStyle = e.color;

      if (e.type === 'invader') {
        ctx.fillRect(e.x - 8, e.y - 6, 16, 12);
        ctx.fillRect(e.x - 12, e.y - 2, 24, 6);
        ctx.fillRect(e.x - 6, e.y + 6, 4, 4);
        ctx.fillRect(e.x + 2, e.y + 6, 4, 4);
      } else if (e.type === 'asteroid') {
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(e.x, e.y + 12);
        ctx.lineTo(e.x - 12, e.y - 10);
        ctx.lineTo(e.x + 12, e.y - 10);
        ctx.closePath();
        ctx.fill();
      }

      // Check collision with player
      if (spaceInvulnerableTimer <= 0) {
        const distToPlayer = Math.hypot(player.x - e.x, player.y - e.y);
        if (distToPlayer < 22) {
          createExplosion(e.x, e.y, '#ff2d78');
          spaceEnemies.splice(i, 1);
          spaceLives--;
          spaceInvulnerableTimer = 45; // 0.75s grace period
          updateSpaceLivesHUD();
          playSound('hit');

          if (spaceLives <= 0) {
            handleGameOver(spaceScore, spaceHighScore, 'spaceBlasterHighScore');
            return;
          }
          continue;
        }
      }

      // Check collision with lasers
      for (let j = spaceLasers.length - 1; j >= 0; j--) {
        const l = spaceLasers[j];
        if (Math.hypot(l.x - e.x, l.y - e.y) < e.size) {
          createExplosion(e.x, e.y, e.color);
          spaceLasers.splice(j, 1);
          e.hp--;
          if (e.hp <= 0) {
            spaceScore += 20;
            spaceEnemies.splice(i, 1);
            playSound('hit');
          }
          break;
        }
      }

      if (e.y > height + 30) {
        spaceEnemies.splice(i, 1);
      }
    }

    // Particles
    for (let i = spaceParticles.length - 1; i >= 0; i--) {
      const p = spaceParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.04;
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillRect(p.x, p.y, p.size, p.size);
      ctx.globalAlpha = 1;
      if (p.life <= 0) spaceParticles.splice(i, 1);
    }
  }

  // GAME OVER HANDLER
  function handleGameOver(finalScore, currentHigh, storageKey) {
    isRunning = false;
    isGameOver = true;
    cancelAnimationFrame(animationFrameId);
    playSound('hit');

    if (finalScore > currentHigh) {
      localStorage.setItem(storageKey, finalScore);
      if (storageKey === 'chromeDinoHighScore') dinoHighScore = finalScore;
      if (storageKey === 'spaceBlasterHighScore') spaceHighScore = finalScore;
    }

    const effectiveHigh = Math.max(finalScore, currentHigh);
    if (highScoreEl) highScoreEl.textContent = String(effectiveHigh).padStart(5, '0');

    if (overlayScreen) {
      overlayScreen.style.display = 'flex';
      if (overlaySubtitle) {
        overlaySubtitle.textContent = `Score: ${finalScore}  |  HI: ${effectiveHigh}`;
      }
    }
  }

  // MAIN RUNNING LOOP
  function gameLoop() {
    if (currentGame === 'dino') {
      updateAndRenderDino();
    } else {
      updateAndRenderSpace();
    }

    if (isRunning) {
      animationFrameId = requestAnimationFrame(gameLoop);
    }
  }

  function resetActiveGame() {
    isRunning = true;
    isGameOver = false;
    if (overlayScreen) overlayScreen.style.display = 'none';

    if (currentGame === 'dino') {
      initDino();
      if (highScoreEl) highScoreEl.textContent = String(dinoHighScore).padStart(5, '0');
    } else {
      initSpace();
      if (highScoreEl) highScoreEl.textContent = String(spaceHighScore).padStart(5, '0');
    }
  }

  function switchGame(gameType) {
    currentGame = gameType;

    if (tabDino && tabSpace) {
      if (gameType === 'dino') {
        tabDino.classList.add('active');
        tabSpace.classList.remove('active');
        if (livesWrapper) livesWrapper.style.display = 'none';
        if (dinoControls) dinoControls.style.display = 'flex';
        if (spaceControls) spaceControls.style.display = 'none';
        if (instructionsEl) instructionsEl.innerHTML = '<span>⌨️ <strong>Space</strong> / <strong>↑</strong> to Jump | <strong>↓</strong> to Duck | Tap Screen</span>';
      } else {
        tabSpace.classList.add('active');
        tabDino.classList.remove('active');
        if (livesWrapper) livesWrapper.style.display = 'flex';
        if (dinoControls) dinoControls.style.display = 'none';
        if (spaceControls) spaceControls.style.display = 'flex';
        if (instructionsEl) instructionsEl.innerHTML = '<span>⌨️ <strong>← →</strong> / <strong>A D</strong> or Mouse Drag | <strong>Space</strong> / Click to Fire</span>';
      }
    }

    resizeCanvas();
    resetActiveGame();
    if (!isRunning) {
      animationFrameId = requestAnimationFrame(gameLoop);
    }
  }

  if (tabDino) tabDino.addEventListener('click', () => switchGame('dino'));
  if (tabSpace) tabSpace.addEventListener('click', () => switchGame('space'));

  // Open & Close Modal
  function openGameModal(initialGame = 'dino') {
    if (!gameModal) return;
    gameModal.classList.add('active');
    gameModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    switchGame(initialGame);
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

  if (gameModalBackdrop) gameModalBackdrop.addEventListener('click', closeGameModal);

  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      resetActiveGame();
      animationFrameId = requestAnimationFrame(gameLoop);
    });
  }

  // Keyboard Event Handlers
  window.addEventListener('keydown', (e) => {
    if (gameModal && gameModal.classList.contains('active')) {
      if (currentGame === 'dino') {
        if (e.code === 'Space' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
          e.preventDefault();
          dinoJump();
        } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
          e.preventDefault();
          dinoDuck(true);
        }
      } else {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
          e.preventDefault();
          spaceKeys.left = true;
        }
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          e.preventDefault();
          spaceKeys.right = true;
        }
        if (e.code === 'Space') {
          e.preventDefault();
          if (isGameOver) {
            resetActiveGame();
            animationFrameId = requestAnimationFrame(gameLoop);
          } else {
            fireSpaceLaser();
          }
        }
      }

      if (e.key === 'Escape') closeGameModal();
    }
  });

  window.addEventListener('keyup', (e) => {
    if (currentGame === 'dino') {
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        dinoDuck(false);
      }
    } else {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') spaceKeys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') spaceKeys.right = false;
    }
  });

  // Canvas Mouse & Touch controls
  canvas.addEventListener('mousedown', (e) => {
    if (currentGame === 'dino') {
      dinoJump();
    } else {
      if (isGameOver) {
        resetActiveGame();
        animationFrameId = requestAnimationFrame(gameLoop);
      } else {
        fireSpaceLaser();
      }
    }
  });

  canvas.addEventListener('mousemove', (e) => {
    if (currentGame === 'space' && isRunning && !isGameOver) {
      const rect = canvas.getBoundingClientRect();
      player.x = Math.max(player.width / 2, Math.min(width - player.width / 2, e.clientX - rect.left));
    }
  });

  canvas.addEventListener('touchstart', (e) => {
    if (currentGame === 'dino') {
      e.preventDefault();
      dinoJump();
    } else {
      if (isGameOver) {
        resetActiveGame();
        animationFrameId = requestAnimationFrame(gameLoop);
      } else {
        const rect = canvas.getBoundingClientRect();
        if (e.touches && e.touches[0]) {
          player.x = Math.max(player.width / 2, Math.min(width - player.width / 2, e.touches[0].clientX - rect.left));
        }
        fireSpaceLaser();
      }
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    if (currentGame === 'space' && isRunning && !isGameOver) {
      const rect = canvas.getBoundingClientRect();
      if (e.touches && e.touches[0]) {
        player.x = Math.max(player.width / 2, Math.min(width - player.width / 2, e.touches[0].clientX - rect.left));
      }
    }
  }, { passive: true });

  // Touch button binds
  if (touchJumpBtn) {
    touchJumpBtn.addEventListener('touchstart', (e) => { e.preventDefault(); dinoJump(); }, { passive: false });
    touchJumpBtn.addEventListener('mousedown', () => dinoJump());
  }
  if (touchDuckBtn) {
    touchDuckBtn.addEventListener('touchstart', (e) => { e.preventDefault(); dinoDuck(true); }, { passive: false });
    touchDuckBtn.addEventListener('touchend', (e) => { e.preventDefault(); dinoDuck(false); }, { passive: false });
    touchDuckBtn.addEventListener('mousedown', () => dinoDuck(true));
    touchDuckBtn.addEventListener('mouseup', () => dinoDuck(false));
  }
  if (touchLeftBtn) {
    touchLeftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); spaceKeys.left = true; }, { passive: false });
    touchLeftBtn.addEventListener('touchend', (e) => { e.preventDefault(); spaceKeys.left = false; }, { passive: false });
    touchLeftBtn.addEventListener('mousedown', () => spaceKeys.left = true);
    touchLeftBtn.addEventListener('mouseup', () => spaceKeys.left = false);
  }
  if (touchRightBtn) {
    touchRightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); spaceKeys.right = true; }, { passive: false });
    touchRightBtn.addEventListener('touchend', (e) => { e.preventDefault(); spaceKeys.right = false; }, { passive: false });
    touchRightBtn.addEventListener('mousedown', () => spaceKeys.right = true);
    touchRightBtn.addEventListener('mouseup', () => spaceKeys.right = false);
  }
  if (touchFireBtn) {
    touchFireBtn.addEventListener('touchstart', (e) => { e.preventDefault(); fireSpaceLaser(); }, { passive: false });
    touchFireBtn.addEventListener('mousedown', () => fireSpaceLaser());
  }

  window.addEventListener('resize', () => {
    if (gameModal && gameModal.classList.contains('active')) {
      resizeCanvas();
    }
  });
});
