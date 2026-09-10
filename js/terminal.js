/* ============================================
   TERMINAL.JS — Popup Interactive CLI Modal
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const terminalModal = document.getElementById('terminalModal');
  const termModalBackdrop = document.getElementById('terminalModalBackdrop');
  const closeTermBtns = document.querySelectorAll('#closeTerminalBtn, #closeTerminalIconBtn');
  const openTermTriggers = document.querySelectorAll('[data-open-terminal], #navTerminalBtn, #heroTerminalBtn');

  const terminalWindow = document.getElementById('embeddedTerminal');
  const termOutput = document.getElementById('terminalOutput');
  const termInput = document.getElementById('terminalInput');
  const termQuickPills = document.querySelectorAll('.term-pill');
  const termCanvas = document.getElementById('terminalMatrixCanvas');

  if (!termOutput || !termInput) return;

  // Terminal Modal Open / Close Logic
  function openTerminalModal() {
    if (!terminalModal) return;
    terminalModal.classList.add('active');
    terminalModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      if (termInput) termInput.focus();
    }, 100);
  }

  function closeTerminalModal() {
    if (!terminalModal) return;
    terminalModal.classList.remove('active');
    terminalModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Expose globally
  window.openTerminalModal = openTerminalModal;
  window.closeTerminalModal = closeTerminalModal;

  openTermTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openTerminalModal();
    });
  });

  closeTermBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      closeTerminalModal();
    });
  });

  if (termModalBackdrop) {
    termModalBackdrop.addEventListener('click', closeTerminalModal);
  }

  // Keyboard shortcut: Escape closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && terminalModal && terminalModal.classList.contains('active')) {
      closeTerminalModal();
    }
  });

  let commandHistory = [];
  let historyIndex = -1;

  const COMMANDS = {
    help: {
      desc: 'Show available terminal commands',
      exec: () => `
<div class="term-res-header">⚡ Available Commands:</div>
<table class="term-table">
  <tr><td><span class="cmd-highlight">help</span></td><td>Display this help cheat-sheet</td></tr>
  <tr><td><span class="cmd-highlight">about</span></td><td>Display quick bio, focus areas & education</td></tr>
  <tr><td><span class="cmd-highlight">skills</span></td><td>List tech stack & machine learning tools</td></tr>
  <tr><td><span class="cmd-highlight">projects</span></td><td>Showcase featured ML & software projects</td></tr>
  <tr><td><span class="cmd-highlight">experience</span></td><td>View academic background & milestones</td></tr>
  <tr><td><span class="cmd-highlight">resume</span></td><td>Open master resume preview & download</td></tr>
  <tr><td><span class="cmd-highlight">contact</span></td><td>Get direct email, LinkedIn, & GitHub links</td></tr>
  <tr><td><span class="cmd-highlight">theme &lt;name&gt;</span></td><td>Switch theme: <span class="term-cyan">cyber</span>, <span class="term-green">matrix</span>, <span class="term-pink">synthwave</span>, <span class="term-blue">ocean</span></td></tr>
  <tr><td><span class="cmd-highlight">matrix</span></td><td>Run the Matrix digital rain animation</td></tr>
  <tr><td><span class="cmd-highlight">cat &lt;file&gt;</span></td><td>Read files (<span class="term-dim">bio.txt, stack.json, secret.txt</span>)</td></tr>
  <tr><td><span class="cmd-highlight">quote</span></td><td>Display an inspiring software/AI quote</td></tr>
  <tr><td><span class="cmd-highlight">whoami</span></td><td>Display current user status</td></tr>
  <tr><td><span class="cmd-highlight">game</span></td><td>Launch Space Blaster arcade mini-game 🚀</td></tr>
  <tr><td><span class="cmd-highlight">clear</span></td><td>Clear terminal screen output</td></tr>
  <tr><td><span class="cmd-highlight">exit</span></td><td>Close the terminal window</td></tr>
</table>
<div class="term-hint">💡 Tip: Use <kbd>Tab</kbd> to autocomplete and <kbd>↑</kbd> <kbd>↓</kbd> to cycle history.</div>`
    },

    about: {
      desc: 'View personal bio and details',
      exec: () => `
<div class="term-res-header">👨‍💻 About Saksham Dhumale:</div>
<div class="term-line"><span class="term-accent">Role:</span> Software Engineer | Data Analyst | ML Enthusiast</div>
<div class="term-line"><span class="term-accent">Education:</span> B.Tech in Artificial Intelligence & Machine Learning</div>
<div class="term-line"><span class="term-accent">Focus:</span> Deep Learning, Computer Vision, Full-Stack Web Development, Data Analytics</div>
<div class="term-line"><span class="term-accent">Location:</span> Nagpur, Maharashtra, India</div>
<div class="term-line"><span class="term-accent">Mission:</span> Building intelligent, high-impact data systems and beautiful digital experiences.</div>`
    },

    skills: {
      desc: 'List core technical competencies',
      exec: () => `
<div class="term-res-header">🛠️ Technical Skill Matrix:</div>
<div class="term-skill-cat"><span class="term-green">▶ Languages:</span> Python, Java, SQL, JavaScript, HTML5/CSS3</div>
<div class="term-skill-cat"><span class="term-cyan">▶ ML & AI:</span> TensorFlow, Keras, OpenCV, Scikit-Learn, CNN, Data Preprocessing</div>
<div class="term-skill-cat"><span class="term-pink">▶ Web & Backend:</span> Flask, REST APIs, Git, GitHub, Linux Shell</div>
<div class="term-skill-cat"><span class="term-blue">▶ Data & Tools:</span> MySQL, PowerBI, Pandas, NumPy, VS Code, Jupyter</div>`
    },

    projects: {
      desc: 'List featured projects with links',
      exec: () => `
<div class="term-res-header">🚀 Featured Projects:</div>
<div class="term-proj-item">
  <div class="term-proj-title">1. <strong class="term-cyan">Chest X-Ray Pneumonia Detection</strong> <span class="term-badge">94.2% Acc</span></div>
  <div class="term-proj-desc">Custom CNN deep learning model with OpenCV preprocessing and clinical heatmap visualization.</div>
  <div class="term-proj-link">🔗 <a href="https://github.com/SAKSHAMRD8528" target="_blank">github.com/SAKSHAMRD8528</a></div>
</div>
<div class="term-proj-item">
  <div class="term-proj-title">2. <strong class="term-cyan">House Price Prediction Model</strong></div>
  <div class="term-proj-desc">End-to-end regression pipeline with feature engineering, Ridge/Lasso, and interactive dashboard.</div>
  <div class="term-proj-link">🔗 <a href="https://github.com/SAKSHAMRD8528" target="_blank">github.com/SAKSHAMRD8528</a></div>
</div>
<div class="term-proj-item">
  <div class="term-proj-title">3. <strong class="term-cyan">IPL Match Win Probability Predictor</strong></div>
  <div class="term-proj-desc">Real-time match predictor trained on 10+ years of ball-by-ball delivery datasets with Flask UI.</div>
  <div class="term-proj-link">🔗 <a href="https://github.com/SAKSHAMRD8528" target="_blank">github.com/SAKSHAMRD8528</a></div>
</div>
<div class="term-proj-item">
  <div class="term-proj-title">4. <strong class="term-cyan">Sign Language Gesture Recognition</strong></div>
  <div class="term-proj-desc">Real-time computer vision system translating 26 ASL hand gestures via webcam with 96% accuracy.</div>
  <div class="term-proj-link">🔗 <a href="https://github.com/SAKSHAMRD8528" target="_blank">github.com/SAKSHAMRD8528</a></div>
</div>`
    },

    experience: {
      desc: 'View education and experience',
      exec: () => `
<div class="term-res-header">🎓 Education & Experience:</div>
<div class="term-line"><strong>2022 – 2026:</strong> B.Tech in Artificial Intelligence & Machine Learning</div>
<div class="term-line term-dim">G.H. Raisoni College of Engineering, Nagpur</div>
<div class="term-line"><strong>Core Coursework:</strong> Deep Learning, Data Structures & Algorithms, DBMS, Operating Systems, Machine Learning</div>`
    },

    resume: {
      desc: 'Open resume viewer modal',
      exec: () => {
        closeTerminalModal();
        setTimeout(() => {
          if (typeof window.openResumeModal === 'function') {
            window.openResumeModal();
          } else {
            const modal = document.getElementById('resumeModal');
            if (modal) modal.classList.add('active');
          }
        }, 300);
        return `
<div class="term-res-header">📄 Opening Resume Modal...</div>
<div class="term-line">If the popup doesn't open automatically:</div>
<div class="term-line">👉 <a href="Saksham_Dhumale_Master_Resume.pdf" target="_blank" class="term-cyan">Click here to download Saksham_Dhumale_Master_Resume.pdf</a></div>`;
      }
    },

    contact: {
      desc: 'Show contact channels',
      exec: () => `
<div class="term-res-header">📬 Get in Touch:</div>
<div class="term-line">📧 <span class="term-accent">Email:</span> <a href="mailto:sakshamrd852@gmail.com">sakshamrd852@gmail.com</a></div>
<div class="term-line">🐙 <span class="term-accent">GitHub:</span> <a href="https://github.com/SAKSHAMRD8528" target="_blank">github.com/SAKSHAMRD8528</a></div>
<div class="term-line">💼 <span class="term-accent">LinkedIn:</span> <a href="https://linkedin.com/" target="_blank">linkedin.com/in/sakshamdhumale</a></div>
<div class="term-line">📍 <span class="term-accent">Location:</span> Nagpur, India</div>`
    },

    quote: {
      desc: 'Display an inspirational tech quote',
      exec: () => {
        const quotes = [
          '"First, solve the problem. Then, write the code." — John Johnson',
          '"Simplicity is prerequisite for reliability." — Edsger W. Dijkstra',
          '"Data is the new oil, but ML is the refinery." — Clive Humby',
          '"Machine learning will automate jobs that most people thought could only be done by people." — Dave Waters',
          '"Code is like humor. When you have to explain it, it’s bad." — Cory House'
        ];
        return `<div class="term-quote">${quotes[Math.floor(Math.random() * quotes.length)]}</div>`;
      }
    },

    whoami: {
      desc: 'Show user session info',
      exec: () => `<div class="term-line"><span class="term-green">guest@portfolio</span> (Guest Visitor — Welcome to my site!)</div>`
    },

    date: {
      desc: 'Show current timestamp',
      exec: () => `<div class="term-line">${new Date().toLocaleString()}</div>`
    },

    exit: {
      desc: 'Close terminal modal',
      exec: () => {
        setTimeout(closeTerminalModal, 300);
        return `<div class="term-line term-dim">Closing terminal session... Goodbye!</div>`;
      }
    },

    game: {
      desc: 'Launch Space Blaster arcade mini-game',
      exec: () => {
        closeTerminalModal();
        setTimeout(() => {
          if (typeof window.openGameModal === 'function') {
            window.openGameModal();
          }
        }, 200);
        return `<div class="term-line term-green">🚀 Launching Space Blaster Arcade... Get ready!</div>`;
      }
    },

    play: {
      desc: 'Launch Space Blaster arcade mini-game',
      exec: () => {
        closeTerminalModal();
        setTimeout(() => {
          if (typeof window.openGameModal === 'function') {
            window.openGameModal();
          }
        }, 200);
        return `<div class="term-line term-green">🚀 Launching Space Blaster Arcade... Get ready!</div>`;
      }
    },

    clear: {
      desc: 'Clear terminal screen',
      exec: () => {
        termOutput.innerHTML = '';
        return null;
      }
    },

    cls: {
      desc: 'Clear terminal screen',
      exec: () => {
        termOutput.innerHTML = '';
        return null;
      }
    }
  };

  // Matrix Rain Animation on Canvas
  let matrixInterval = null;
  function triggerMatrixRain() {
    if (!termCanvas) return;
    termCanvas.style.display = 'block';
    const ctx = termCanvas.getContext('2d');
    termCanvas.width = termCanvas.parentElement.offsetWidth;
    termCanvas.height = 250;

    const chars = '01SAKSHAM1010AI_ML_PYTHON_JAVA_C++_SQL_0123456789';
    const fontSize = 13;
    const columns = Math.floor(termCanvas.width / fontSize);
    const drops = Array(columns).fill(1);

    if (matrixInterval) clearInterval(matrixInterval);

    let frames = 0;
    matrixInterval = setInterval(() => {
      ctx.fillStyle = 'rgba(10, 14, 23, 0.08)';
      ctx.fillRect(0, 0, termCanvas.width, termCanvas.height);

      ctx.fillStyle = '#00ff41';
      ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > termCanvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      frames++;
      if (frames > 120) { // ~6 seconds
        clearInterval(matrixInterval);
        termCanvas.style.display = 'none';
        ctx.clearRect(0, 0, termCanvas.width, termCanvas.height);
      }
    }, 50);
  }

  // Handle Command Execution
  function executeCommand(rawInput) {
    const input = rawInput.trim();
    if (!input) return;

    commandHistory.push(input);
    historyIndex = commandHistory.length;

    // Echo user's typed prompt line
    const entryEl = document.createElement('div');
    entryEl.className = 'term-entry';
    entryEl.innerHTML = `<span class="term-user">saksham@portfolio</span>:<span class="term-path">~</span>$ <span class="term-cmd-text">${escapeHtml(input)}</span>`;
    termOutput.appendChild(entryEl);

    const parts = input.split(' ');
    const cmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ').trim().toLowerCase();

    let outputHtml = '';

    if (cmd === 'matrix' || cmd === 'rain') {
      triggerMatrixRain();
      outputHtml = `<div class="term-line term-green">[SYSTEM] Matrix rain subroutine active... Wake up, Neo.</div>`;
    } else if (cmd === 'theme') {
      const themes = ['cyber', 'matrix', 'synthwave', 'ocean'];
      if (!arg || !themes.includes(arg)) {
        outputHtml = `<div class="term-error">Usage: <code>theme &lt;name&gt;</code>. Available: <span class="term-cyan">cyber</span>, <span class="term-green">matrix</span>, <span class="term-pink">synthwave</span>, <span class="term-blue">ocean</span></div>`;
      } else {
        if (typeof window.applyTheme === 'function') {
          window.applyTheme(arg);
        } else {
          document.body.className = '';
          document.body.classList.add(`theme-${arg}`);
          localStorage.setItem('portfolioTheme', arg);
        }
        outputHtml = `<div class="term-line term-green">✔ Portfolio theme successfully changed to: <strong>${arg}</strong></div>`;
      }
    } else if (cmd === 'sudo') {
      outputHtml = `<div class="term-error">🔒 Permission denied: User 'guest' is not in the sudoers file. This incident has been logged.</div>`;
    } else if (cmd === 'cat') {
      if (arg === 'bio.txt') {
        outputHtml = COMMANDS.about.exec();
      } else if (arg === 'stack.json' || arg === 'skills.json') {
        outputHtml = `<pre class="term-code">{\n  "name": "Saksham Dhumale",\n  "languages": ["Python", "Java", "SQL", "JavaScript"],\n  "ml": ["TensorFlow", "Keras", "OpenCV", "Scikit-Learn"],\n  "frameworks": ["Flask", "Tailwind/CSS", "Git"]\n}</pre>`;
      } else if (arg === 'secret.txt' || arg === 'easteregg.txt') {
        outputHtml = `<div class="term-line term-pink">🎉 You found the hidden Easter egg! Here is a coffee ☕ and my star repo: <a href="https://github.com/SAKSHAMRD8528" target="_blank" class="term-cyan">github.com/SAKSHAMRD8528</a></div>`;
      } else {
        outputHtml = `<div class="term-error">cat: ${escapeHtml(arg || '<file>')}: No such file. Try <code>cat bio.txt</code> or <code>cat stack.json</code></div>`;
      }
    } else if (cmd === 'echo') {
      outputHtml = `<div class="term-line">${escapeHtml(parts.slice(1).join(' '))}</div>`;
    } else if (COMMANDS[cmd]) {
      const res = COMMANDS[cmd].exec();
      if (res !== null) {
        outputHtml = res;
      }
    } else {
      outputHtml = `<div class="term-error">Command not found: "${escapeHtml(cmd)}". Type <span class="cmd-highlight">help</span> to view valid commands.</div>`;
    }

    if (outputHtml) {
      const resEl = document.createElement('div');
      resEl.className = 'term-result';
      resEl.innerHTML = outputHtml;
      termOutput.appendChild(resEl);
    }

    termInput.value = '';
    scrollToBottom();
  }

  function scrollToBottom() {
    termOutput.scrollTop = termOutput.scrollHeight;
    if (terminalWindow) {
      terminalWindow.scrollTop = terminalWindow.scrollHeight;
    }
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Keydown event handling (Enter, Arrow Up/Down, Tab)
  termInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand(termInput.value);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0 && historyIndex > 0) {
        historyIndex--;
        termInput.value = commandHistory[historyIndex];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        termInput.value = commandHistory[historyIndex];
      } else {
        historyIndex = commandHistory.length;
        termInput.value = '';
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const currentVal = termInput.value.trim().toLowerCase();
      if (!currentVal) return;
      const allCmds = Object.keys(COMMANDS).concat(['matrix', 'theme cyber', 'theme matrix', 'theme synthwave', 'theme ocean', 'cat bio.txt', 'cat stack.json', 'sudo']);
      const match = allCmds.find(c => c.startsWith(currentVal));
      if (match) {
        termInput.value = match;
      }
    }
  });

  // Clicking anywhere inside terminal focuses input
  if (terminalWindow) {
    terminalWindow.addEventListener('click', (e) => {
      // If user is clicking a link or button inside, let it work
      if (e.target.tagName !== 'A' && e.target.tagName !== 'BUTTON') {
        termInput.focus();
      }
    });
  }

  // Quick Command Pills
  termQuickPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const cmd = pill.getAttribute('data-cmd');
      if (cmd) {
        termInput.value = cmd;
        executeCommand(cmd);
      }
    });
  });

  // Initial welcome message
  termOutput.innerHTML = `
<div class="term-welcome">
  <span class="term-cyan">Saksham Dhumale Interactive Terminal</span> [v2.4.0]
  <br/><span class="term-dim">Type <span class="cmd-highlight">help</span> or click quick pills below. Type <span class="cmd-highlight">exit</span> or press <kbd>ESC</kbd> to close.</span>
</div>`;
});
