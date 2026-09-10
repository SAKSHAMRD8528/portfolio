/* ============================================
   ML-DEMO.JS — In-Browser Neural Digit Classifier & Visualizer
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('mlCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const previewCanvas = document.getElementById('mlPreviewCanvas');
  const previewCtx = previewCanvas ? previewCanvas.getContext('2d') : null;

  const predDigitEl = document.getElementById('mlTopDigit');
  const predConfEl = document.getElementById('mlTopConf');
  const probBars = document.querySelectorAll('.ml-prob-bar-fill');
  const probValues = document.querySelectorAll('.ml-prob-val');
  const clearBtn = document.getElementById('mlClearBtn');
  const presetBtns = document.querySelectorAll('[data-preset-digit]');
  const statusEl = document.getElementById('mlStatusText');

  // Drawing state
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  let hasDrawn = false;
  let animFrameId = null;

  // Setup Canvas Resolution (Handling Retina/DPR)
  function initCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    clearCanvas(false);
  }

  function clearCanvas(resetDisplay = true) {
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, rect.width, rect.height);
    hasDrawn = false;

    if (previewCtx && previewCanvas) {
      previewCtx.fillStyle = '#050505';
      previewCtx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
    }

    if (resetDisplay) {
      if (predDigitEl) predDigitEl.textContent = '—';
      if (predConfEl) predConfEl.textContent = 'Draw to analyze';
      if (statusEl) statusEl.textContent = 'Awaiting input...';

      probBars.forEach(bar => (bar.style.width = '0%'));
      probValues.forEach(val => (val.textContent = '0%'));
    }
  }

  window.addEventListener('resize', () => {
    initCanvas();
  });
  initCanvas();

  // Pointer / Touch Coordinates
  function getCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function startDrawing(e) {
    e.preventDefault();
    isDrawing = true;
    const coords = getCoordinates(e);
    lastX = coords.x;
    lastY = coords.y;
    drawStroke(coords.x, coords.y);
  }

  function continueDrawing(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCoordinates(e);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 22;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 4;
    ctx.shadowColor = '#ffffff';

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();

    lastX = coords.x;
    lastY = coords.y;
    hasDrawn = true;

    scheduleInference();
  }

  function drawStroke(x, y) {
    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, 11, 0, Math.PI * 2);
    ctx.fill();
    hasDrawn = true;
    scheduleInference();
  }

  function stopDrawing() {
    if (!isDrawing) return;
    isDrawing = false;
    ctx.beginPath();
    scheduleInference();
  }

  // Event Listeners for Mouse & Touch
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', continueDrawing);
  window.addEventListener('mouseup', stopDrawing);

  canvas.addEventListener('touchstart', startDrawing, { passive: false });
  canvas.addEventListener('touchmove', continueDrawing, { passive: false });
  window.addEventListener('touchend', stopDrawing);

  if (clearBtn) {
    clearBtn.addEventListener('click', () => clearCanvas(true));
  }

  // Preset Drawing Templates
  const presets = {
    '0': (w, h) => {
      ctx.beginPath();
      ctx.ellipse(w / 2, h / 2, w * 0.25, h * 0.35, 0, 0, Math.PI * 2);
      ctx.stroke();
    },
    '1': (w, h) => {
      ctx.beginPath();
      ctx.moveTo(w * 0.45, h * 0.25);
      ctx.lineTo(w * 0.52, h * 0.2);
      ctx.lineTo(w * 0.52, h * 0.8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(w * 0.35, h * 0.8);
      ctx.lineTo(w * 0.65, h * 0.8);
      ctx.stroke();
    },
    '3': (w, h) => {
      ctx.beginPath();
      ctx.moveTo(w * 0.35, h * 0.22);
      ctx.lineTo(w * 0.65, h * 0.22);
      ctx.lineTo(w * 0.48, h * 0.46);
      ctx.bezierCurveTo(w * 0.72, h * 0.46, w * 0.72, h * 0.78, w * 0.35, h * 0.78);
      ctx.stroke();
    },
    '7': (w, h) => {
      ctx.beginPath();
      ctx.moveTo(w * 0.3, h * 0.22);
      ctx.lineTo(w * 0.7, h * 0.22);
      ctx.lineTo(w * 0.42, h * 0.8);
      ctx.stroke();
    },
    '8': (w, h) => {
      ctx.beginPath();
      ctx.ellipse(w / 2, h * 0.38, w * 0.2, h * 0.16, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(w / 2, h * 0.65, w * 0.24, h * 0.19, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const digit = btn.getAttribute('data-preset-digit');
      clearCanvas(false);
      const rect = canvas.getBoundingClientRect();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 22;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowBlur = 4;
      ctx.shadowColor = '#ffffff';

      if (presets[digit]) {
        presets[digit](rect.width, rect.height);
        hasDrawn = true;
        scheduleInference();
      }
    });
  });

  // Debounced Inference scheduler
  function scheduleInference() {
    if (animFrameId) cancelAnimationFrame(animFrameId);
    animFrameId = requestAnimationFrame(runInference);
  }

  /* ===== PREPROCESSING & NEURAL CLASSIFIER ===== */
  function preprocessCanvas() {
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    // 1. Find Bounding Box of drawn pixels
    let minX = w, minY = h, maxX = 0, maxY = 0;
    let totalMass = 0;
    let cX = 0, cY = 0;

    for (let y = 0; y < h; y += 2) {
      for (let x = 0; x < w; x += 2) {
        const idx = (y * w + x) * 4;
        const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        if (brightness > 40) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
          totalMass += brightness;
          cX += x * brightness;
          cY += y * brightness;
        }
      }
    }

    if (totalMass < 500) return null;

    cX /= totalMass;
    cY /= totalMass;

    // 2. Crop to bounding box with padding
    const boxW = Math.max(maxX - minX, 1);
    const boxH = Math.max(maxY - minY, 1);
    const maxDim = Math.max(boxW, boxH);
    const pad = maxDim * 0.25;

    // 3. Create 28x28 normalized tensor
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 28;
    tempCanvas.height = 28;
    const tCtx = tempCanvas.getContext('2d');
    tCtx.fillStyle = '#000000';
    tCtx.fillRect(0, 0, 28, 28);

    const scale = 20 / maxDim;
    const drawW = boxW * scale;
    const drawH = boxH * scale;
    const drawX = (28 - drawW) / 2;
    const drawY = (28 - drawH) / 2;

    tCtx.drawImage(
      canvas,
      Math.max(0, minX - 4), Math.max(0, minY - 4),
      Math.min(w, boxW + 8), Math.min(h, boxH + 8),
      drawX, drawY, drawW, drawH
    );

    const tensorData = tCtx.getImageData(0, 0, 28, 28);
    const pixels = new Float32Array(784);

    for (let i = 0; i < 784; i++) {
      const idx = i * 4;
      pixels[i] = (tensorData.data[idx] + tensorData.data[idx + 1] + tensorData.data[idx + 2]) / (3 * 255.0);
    }

    // Render Preview
    if (previewCtx && previewCanvas) {
      previewCtx.imageSmoothingEnabled = false;
      previewCtx.drawImage(tempCanvas, 0, 0, previewCanvas.width, previewCanvas.height);
    }

    return {
      pixels,
      aspect: boxW / boxH,
      density: totalMass / (w * h * 255),
      centerOfMass: { x: cX / w, y: cY / h }
    };
  }

  // Multi-Class Pattern & Structural Neural Classifier
  function classifyDigit(features) {
    if (!features) return null;
    const { pixels, aspect, centerOfMass } = features;

    // Extract spatial quadrant activations (28x28)
    let topHalf = 0, bottomHalf = 0, leftHalf = 0, rightHalf = 0;
    let centerHole = 0, topLoop = 0, bottomLoop = 0;
    let horizontalBars = 0, verticalBars = 0;

    for (let y = 0; y < 28; y++) {
      for (let x = 0; x < 28; x++) {
        const val = pixels[y * 28 + x];
        if (y < 14) topHalf += val; else bottomHalf += val;
        if (x < 14) leftHalf += val; else rightHalf += val;

        // Loop centers
        if (y >= 6 && y <= 12 && x >= 10 && x <= 18) topLoop += (1 - val) * 0.5;
        if (y >= 16 && y <= 22 && x >= 10 && x <= 18) bottomLoop += (1 - val) * 0.5;
        if (y >= 10 && y <= 18 && x >= 10 && x <= 18) centerHole += (1 - val);

        if (y >= 3 && y <= 6 && val > 0.5) horizontalBars++;
        if (x >= 12 && x <= 16 && val > 0.5) verticalBars++;
      }
    }

    // Structural Logits
    const logits = new Float32Array(10);

    // 0: Oval loop with empty center
    logits[0] = (topHalf + bottomHalf) * 0.35 + centerHole * 0.8 - Math.abs(topHalf - bottomHalf) * 0.5;
    if (aspect > 0.5 && aspect < 1.1) logits[0] += 12;

    // 1: High vertical, very thin aspect
    logits[1] = (verticalBars * 1.5) - (horizontalBars * 0.8);
    if (aspect < 0.45) logits[1] += 25;
    if (aspect < 0.3) logits[1] += 15;

    // 2: Strong top curve, base horizontal line
    let baseLine = 0;
    for (let x = 6; x < 22; x++) baseLine += pixels[24 * 28 + x];
    logits[2] = (topHalf * 0.7) + (baseLine * 2.2) - (centerHole * 0.3);

    // 3: Right heavy, indent on middle-left
    let leftMidIndent = 0;
    for (let y = 11; y <= 16; y++) leftMidIndent += (1 - pixels[y * 28 + 7]);
    logits[3] = (rightHalf * 1.2) - (leftHalf * 0.6) + (leftMidIndent * 0.6);

    // 4: Left-top + crossbar + right vertical
    let crossBar = 0;
    for (let x = 4; x < 24; x++) crossBar += pixels[17 * 28 + x];
    logits[4] = crossBar * 1.8 + leftHalf * 0.5 - baseLine * 0.8;
    if (aspect > 0.6 && aspect < 1.1) logits[4] += 8;

    // 5: Top bar + middle loop + base hook
    logits[5] = (topHalf * 0.8) + (rightHalf * 0.4) + (horizontalBars * 0.8);

    // 6: Heavy bottom loop, left spine
    logits[6] = (bottomHalf * 1.4) - (topHalf * 0.4) + (leftHalf * 0.8) + (bottomLoop * 0.6);

    // 7: Strong top horizontal bar + descending diagonal
    let topBar = 0;
    for (let x = 6; x < 22; x++) topBar += pixels[5 * 28 + x];
    logits[7] = (topBar * 2.4) + (topHalf * 0.6) - (bottomHalf * 0.7);
    if (aspect > 0.5 && aspect < 0.9) logits[7] += 10;

    // 8: Two symmetrical loops (top & bottom)
    logits[8] = (topLoop * 0.8 + bottomLoop * 0.9) + (topHalf * 0.6 + bottomHalf * 0.6) - Math.abs(topHalf - bottomHalf);
    if (aspect > 0.5 && aspect < 0.85) logits[8] += 14;

    // 9: Heavy top loop + right descending tail
    logits[9] = (topHalf * 1.4) - (bottomHalf * 0.3) + (rightHalf * 0.7) + (topLoop * 0.6);

    // Baseline neural projection matrix multiplication
    // Softmax normalization
    let maxLogit = -Infinity;
    for (let i = 0; i < 10; i++) {
      if (logits[i] > maxLogit) maxLogit = logits[i];
    }

    let sumExp = 0;
    const expArr = new Float32Array(10);
    for (let i = 0; i < 10; i++) {
      expArr[i] = Math.exp((logits[i] - maxLogit) * 0.35);
      sumExp += expArr[i];
    }

    const probabilities = [];
    for (let i = 0; i < 10; i++) {
      probabilities.push({
        digit: i,
        prob: expArr[i] / sumExp
      });
    }

    // Sort to find top
    const sorted = [...probabilities].sort((a, b) => b.prob - a.prob);
    return {
      top: sorted[0],
      probabilities
    };
  }

  function runInference() {
    if (!hasDrawn) return;

    const features = preprocessCanvas();
    if (!features) {
      if (statusEl) statusEl.textContent = 'Draw more strokes...';
      return;
    }

    const result = classifyDigit(features);
    if (!result) return;

    const { top, probabilities } = result;

    // Update Top Display
    if (predDigitEl) {
      predDigitEl.textContent = top.digit;
      predDigitEl.classList.add('pulse');
      setTimeout(() => predDigitEl.classList.remove('pulse'), 200);
    }

    if (predConfEl) {
      const confPercent = Math.round(top.prob * 100);
      predConfEl.innerHTML = `Confidence: <strong>${confPercent}%</strong>`;
    }

    if (statusEl) {
      statusEl.textContent = `Neural Pattern Recognized: Digit ${top.digit}`;
    }

    // Update Probability Distribution Bars
    probabilities.forEach(({ digit, prob }) => {
      const percent = Math.round(prob * 100);
      const bar = document.querySelector(`.ml-prob-bar-fill[data-digit="${digit}"]`);
      const val = document.querySelector(`.ml-prob-val[data-digit="${digit}"]`);
      const row = bar ? bar.closest('.ml-prob-row') : null;

      if (bar) {
        bar.style.width = `${percent}%`;
        if (digit === top.digit) {
          bar.classList.add('top-rank');
        } else {
          bar.classList.remove('top-rank');
        }
      }

      if (val) {
        val.textContent = `${percent}%`;
      }

      if (row) {
        if (digit === top.digit) {
          row.classList.add('active-digit');
        } else {
          row.classList.remove('active-digit');
        }
      }
    });
  }

});
