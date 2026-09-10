/* ============================================
   TERMINAL.JS — Simplified Interactive CLI Modal
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const terminalModal = document.getElementById('terminalModal');
  const termModalBackdrop = document.getElementById('terminalModalBackdrop');
  const closeTermBtns = document.querySelectorAll('#closeTerminalBtn, #closeTerminalIconBtn');
  const openTermTriggers = document.querySelectorAll('[data-open-terminal], #navTerminalBtn');

  const terminalWindow = document.getElementById('embeddedTerminal');
  const termOutput = document.getElementById('terminalOutput');
  const termInput = document.getElementById('terminalInput');
  const termQuickPills = document.querySelectorAll('.term-pill');

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

  // Simplified & Clean Command Set
  const COMMANDS = {
    help: {
      desc: 'Show available commands',
      exec: () => `
<div class="term-res-header">⚡ Available Commands:</div>
<table class="term-table">
  <tr><td><span class="cmd-highlight">about</span></td><td>Bio, focus & education</td></tr>
  <tr><td><span class="cmd-highlight">skills</span></td><td>Tech stack & ML tools</td></tr>
  <tr><td><span class="cmd-highlight">projects</span></td><td>Featured projects & links</td></tr>
  <tr><td><span class="cmd-highlight">resume</span></td><td>Open master resume preview</td></tr>
  <tr><td><span class="cmd-highlight">contact</span></td><td>Email, LinkedIn & GitHub</td></tr>
  <tr><td><span class="cmd-highlight">dino</span></td><td>Play Chrome Dino runner 🦖</td></tr>
  <tr><td><span class="cmd-highlight">theme &lt;name&gt;</span></td><td>cyber, matrix, synthwave, ocean</td></tr>
  <tr><td><span class="cmd-highlight">clear</span></td><td>Clear terminal screen</td></tr>
  <tr><td><span class="cmd-highlight">exit</span></td><td>Close terminal</td></tr>
</table>
<div class="term-hint">💡 Click any quick pill below or type and hit <kbd>Enter</kbd>.</div>`
    },

    about: {
      desc: 'View personal bio and details',
      exec: () => `
<div class="term-res-header">👨‍💻 Saksham Dhumale:</div>
<div class="term-line"><span class="term-accent">Role:</span> Software Engineer | Data Analyst | ML Enthusiast</div>
<div class="term-line"><span class="term-accent">Education:</span> B.E. in Computer Science & Engineering (2022–2026)</div>
<div class="term-line"><span class="term-accent">Focus:</span> Machine Learning, Deep Learning, Full-Stack Web Development, Data Analytics</div>
<div class="term-line"><span class="term-accent">Location:</span> Pune / Amravati, Maharashtra, India</div>`
    },

    skills: {
      desc: 'List core competencies',
      exec: () => `
<div class="term-res-header">🛠️ Technical Skills:</div>
<div class="term-skill-cat"><span class="term-green">▶ Languages:</span> Python, Java, SQL, JavaScript, HTML5/CSS3</div>
<div class="term-skill-cat"><span class="term-cyan">▶ ML & AI:</span> TensorFlow, Keras, OpenCV, Scikit-Learn, Deep Learning, CNN</div>
<div class="term-skill-cat"><span class="term-pink">▶ Web & Tools:</span> Flask, REST APIs, Git, GitHub, PowerBI, MySQL</div>`
    },

    projects: {
      desc: 'List featured projects',
      exec: () => `
<div class="term-res-header">🚀 Featured Projects:</div>
<div class="term-proj-item">
  <div class="term-proj-title">1. <strong class="term-cyan">Chest X-Ray Pneumonia Detection</strong> <span class="term-badge">94.2% Acc</span></div>
  <div class="term-proj-desc">CNN deep learning model with OpenCV preprocessing & Grad-CAM visualization.</div>
</div>
<div class="term-proj-item">
  <div class="term-proj-title">2. <strong class="term-cyan">House Price Prediction Model</strong></div>
  <div class="term-proj-desc">End-to-end regression pipeline with feature engineering and Ridge/Lasso models.</div>
</div>
<div class="term-proj-item">
  <div class="term-proj-title">3. <strong class="term-cyan">IPL Match Win Predictor</strong></div>
  <div class="term-proj-desc">Real-time match win predictor trained on 10+ years of delivery data with Flask UI.</div>
</div>
<div class="term-proj-link">🔗 <a href="https://github.com/SAKSHAMRD8528" target="_blank">View all repositories on GitHub ↗</a></div>`
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
        return `<div class="term-line term-green">📄 Opening Resume Modal...</div>`;
      }
    },

    contact: {
      desc: 'Show contact channels',
      exec: () => `
<div class="term-res-header">📬 Contact Info:</div>
<div class="term-line">📧 <span class="term-accent">Email:</span> <a href="mailto:sakshamrd852@gmail.com">sakshamrd852@gmail.com</a></div>
<div class="term-line">💼 <span class="term-accent">LinkedIn:</span> <a href="https://linkedin.com/" target="_blank">linkedin.com/in/sakshamdhumale</a></div>
<div class="term-line">🐙 <span class="term-accent">GitHub:</span> <a href="https://github.com/SAKSHAMRD8528" target="_blank">github.com/SAKSHAMRD8528</a></div>
<div class="term-line">📞 <span class="term-accent">Phone:</span> +91 9422446157</div>`
    },

    dino: {
      desc: 'Launch Chrome Dino runner mini-game',
      exec: () => {
        closeTerminalModal();
        setTimeout(() => {
          if (typeof window.openGameModal === 'function') {
            window.openGameModal();
          }
        }, 200);
        return `<div class="term-line term-green">🦖 Launching Chrome Dino Runner... Press Space to Jump!</div>`;
      }
    },

    game: {
      desc: 'Launch Chrome Dino runner mini-game',
      exec: () => {
        closeTerminalModal();
        setTimeout(() => {
          if (typeof window.openGameModal === 'function') {
            window.openGameModal();
          }
        }, 200);
        return `<div class="term-line term-green">🦖 Launching Chrome Dino Runner... Press Space to Jump!</div>`;
      }
    },

    play: {
      desc: 'Launch Chrome Dino runner mini-game',
      exec: () => {
        closeTerminalModal();
        setTimeout(() => {
          if (typeof window.openGameModal === 'function') {
            window.openGameModal();
          }
        }, 200);
        return `<div class="term-line term-green">🦖 Launching Chrome Dino Runner... Press Space to Jump!</div>`;
      }
    },

    whoami: {
      desc: 'Show user session info',
      exec: () => `<div class="term-line"><span class="term-green">guest@portfolio</span> — Welcome!</div>`
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
    },

    exit: {
      desc: 'Close terminal modal',
      exec: () => {
        setTimeout(closeTerminalModal, 300);
        return `<div class="term-line term-dim">Closing terminal... Goodbye!</div>`;
      }
    }
  };

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

    if (cmd === 'theme') {
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
        outputHtml = `<div class="term-line term-green">✔ Theme switched to: <strong>${arg}</strong></div>`;
      }
    } else if (COMMANDS[cmd]) {
      const res = COMMANDS[cmd].exec();
      if (res !== null) {
        outputHtml = res;
      }
    } else {
      outputHtml = `<div class="term-error">Command not found: "${escapeHtml(cmd)}". Type <span class="cmd-highlight">help</span> for commands.</div>`;
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
      const allCmds = Object.keys(COMMANDS).concat(['theme cyber', 'theme matrix', 'theme synthwave', 'theme ocean']);
      const match = allCmds.find(c => c.startsWith(currentVal));
      if (match) {
        termInput.value = match;
      }
    }
  });

  // Focus input when clicking terminal
  if (terminalWindow) {
    terminalWindow.addEventListener('click', (e) => {
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
  <span class="term-cyan">⚡ Saksham's Portfolio Terminal</span>
  <br/><span class="term-dim">Type <span class="cmd-highlight">help</span> or click quick pills below. Type <span class="cmd-highlight">dino</span> to play 🦖</span>
</div>`;
});
