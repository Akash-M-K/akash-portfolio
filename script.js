/**
 * ABISHEK N N — DIGITAL ARCHITECT PORTFOLIO
 * script.js — Complete interaction layer
 * 
 * Modules:
 *  1. Preloader
 *  2. Custom Cursor
 *  3. Navbar (scroll + active)
 *  4. Particle Canvas Background
 *  5. Typewriter Effect
 *  6. Scroll Reveal (Intersection Observer)
 *  7. Magnetic Buttons
 *  8. Project Filtering
 *  9. Contact Form Validation
 * 10. Command Palette
 * 11. Theme Toggle
 * 12. Mobile Menu
 * 13. Back to Top
 * 14. Easter Egg (Konami Code)
 * 15. Developer Console Greeting
 */

'use strict';

// ─── Utility ────────────────────────────────────────────────
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ─── 1. PRELOADER ────────────────────────────────────────────
function initPreloader() {
  const loader = qs('#preloader');
  if (!loader) return;

  // Hide after fill animation completes (~2 s total)
  const hide = () => {
    loader.classList.add('hidden');
    // Re-enable focus after loader gone
    document.body.style.overflow = '';
  };

  document.body.style.overflow = 'hidden';
  setTimeout(hide, 2200);
}

// ─── 2. CUSTOM CURSOR ────────────────────────────────────────
function initCursor() {
  const dot  = qs('#cursor');
  const ring = qs('#cursor-ring');
  if (!dot || !ring) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  let mx = -100, my = -100;
  let rx = -100, ry = -100;
  let rafId;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';
  });

  // Smooth ring follow
  function animateRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    rafId = requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover states
  const HOVER_SELECTORS = 'a, button, [role="button"], input, textarea, .skill-tag, .filter-btn, .cert-card, .project-card';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(HOVER_SELECTORS)) ring.classList.add('hovering');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(HOVER_SELECTORS)) ring.classList.remove('hovering');
  });
  document.addEventListener('mousedown', () => ring.classList.add('clicking'));
  document.addEventListener('mouseup',   () => ring.classList.remove('clicking'));
}

// ─── 3. NAVBAR ───────────────────────────────────────────────
function initNavbar() {
  const navbar  = qs('#navbar');
  const navItems = qsa('.nav-item');
  const sections = qsa('section[id]');
  if (!navbar) return;

  // Scroll: add .scrolled
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Active nav link via IntersectionObserver
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navItems.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => observer.observe(s));
}

// ─── 4. PARTICLE CANVAS BACKGROUND ──────────────────────────
function initCanvas() {
  const canvas = qs('#bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles = [], animationId, enabled = true;
  const PARTICLE_COUNT = window.innerWidth < 768 ? 60 : 120;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  class Particle {
    constructor() { this.reset(true); }
    reset(random = false) {
      this.x  = random ? Math.random() * W : Math.random() * W;
      this.y  = random ? Math.random() * H : Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.r  = Math.random() * 1.5 + 0.5;
      this.life = Math.random();
      this.maxLife = 0.6 + Math.random() * 0.4;
      // Color: blue, violet, cyan
      const colors = ['59,130,246', '139,92,246', '6,182,212'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      // Mouse repulsion
      if (mouse.x) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 100) {
          const force = (100 - dist) / 100 * 0.5;
          this.vx += (dx / dist) * force;
          this.vy += (dy / dist) * force;
        }
      }
      // Damping
      this.vx *= 0.99;
      this.vy *= 0.99;
      // Wrap
      if (this.x < 0) this.x = W;
      if (this.x > W) this.x = 0;
      if (this.y < 0) this.y = H;
      if (this.y > H) this.y = 0;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},0.7)`;
      ctx.fill();
    }
  }

  const mouse = { x: null, y: null };
  const hero  = qs('#hero');

  if (hero) {
    hero.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }, { passive: true });
    hero.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });
  }

  function init() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());
  }

  function drawConnections() {
    const MAX_DIST = 120;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.18;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(59,130,246,${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  function render() {
    if (!enabled) return;
    ctx.clearRect(0, 0, W, H);
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    animationId = requestAnimationFrame(render);
  }

  // Background toggle
  const toggleBtn = qs('#bg-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      enabled = !enabled;
      toggleBtn.style.color = enabled ? '' : 'var(--text-3)';
      if (enabled) { render(); }
      else {
        cancelAnimationFrame(animationId);
        ctx.clearRect(0, 0, W, H);
      }
    });
  }

  window.addEventListener('resize', () => {
    resize();
    init();
  }, { passive: true });

  if (!prefersReducedMotion()) {
    resize();
    init();
    render();
  } else {
    canvas.style.display = 'none';
  }
}

// ─── 5. TYPEWRITER EFFECT ────────────────────────────────────
function initTypewriter() {
  const el = qs('#typewriter');
  if (!el) return;

  const phrases = [

    'AI/ML Engineer & Full-Stack Developer', 
    'turning deep learning models and REST APIs into real-world products',
    'build full-stack web apps',
    'explore machine learning',
  
  ];

  let pIdx = 0, cIdx = 0, deleting = false;
  const TYPE_SPEED   = 70;
  const DELETE_SPEED = 40;
  const PAUSE        = 1800;

  function tick() {
    const phrase = phrases[pIdx];
    if (deleting) {
      cIdx--;
      el.textContent = phrase.slice(0, cIdx);
      if (cIdx === 0) {
        deleting = false;
        pIdx = (pIdx + 1) % phrases.length;
        setTimeout(tick, 400);
        return;
      }
      setTimeout(tick, DELETE_SPEED);
    } else {
      cIdx++;
      el.textContent = phrase.slice(0, cIdx);
      if (cIdx === phrase.length) {
        deleting = true;
        setTimeout(tick, PAUSE);
        return;
      }
      setTimeout(tick, TYPE_SPEED);
    }
  }

  setTimeout(tick, 800);
}

// ─── 6. SCROLL REVEAL ────────────────────────────────────────
function initScrollReveal() {
  if (prefersReducedMotion()) return;

  const elements = qsa('.reveal-up, .reveal-left, .reveal-right');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay || 0);
        setTimeout(() => entry.target.classList.add('in-view'), delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  elements.forEach(el => observer.observe(el));
}

// ─── 7. MAGNETIC BUTTONS ─────────────────────────────────────
function initMagnetic() {
  if (prefersReducedMotion()) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const magnets = qsa('.magnetic');

  magnets.forEach(el => {
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const cx   = rect.left + rect.width / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) * 0.3;
      const dy   = (e.clientY - cy) * 0.3;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
}

// ─── 8. PROJECT FILTERING ────────────────────────────────────
function initProjectFilters() {
  const btns  = qsa('.filter-btn');
  const cards = qsa('.project-card');
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      cards.forEach(card => {
        const cat = card.dataset.category;
        const show = filter === 'all' || cat === filter;
        card.style.display = show ? '' : 'none';
        if (show) {
          card.style.opacity = '0';
          card.style.transform = 'translateY(16px)';
          requestAnimationFrame(() => {
            card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          });
        }
      });
    });
  });
}

// ─── 9. CONTACT FORM ─────────────────────────────────────────
function initContactForm() {
  const form   = qs('#contact-form');
  if (!form) return;

  const nameEl    = qs('#form-name');
  const emailEl   = qs('#form-email');
  const messageEl = qs('#form-message');
  const submitBtn = qs('#form-submit');

  function validate(field, message) {
    const errEl = field.nextElementSibling;
    if (!field.value.trim()) {
      field.classList.add('invalid');
      if (errEl) errEl.textContent = message;
      return false;
    }
    if (field.type === 'email') {
      const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRx.test(field.value.trim())) {
        field.classList.add('invalid');
        if (errEl) errEl.textContent = 'Enter a valid email address.';
        return false;
      }
    }
    field.classList.remove('invalid');
    if (errEl) errEl.textContent = '';
    return true;
  }

  [nameEl, emailEl, messageEl].forEach(f => {
    if (!f) return;
    f.addEventListener('input', () => {
      f.classList.remove('invalid');
      const errEl = f.nextElementSibling;
      if (errEl) errEl.textContent = '';
    });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const nameOk    = validate(nameEl,    'Please enter your name.');
    const emailOk   = validate(emailEl,   'Please enter your email.');
    const messageOk = validate(messageEl, 'Please write a message.');
    if (!nameOk || !emailOk || !messageOk) return;

    // Show loading state
    const textSpan    = qs('.submit-text',    submitBtn);
    const loadingSpan = qs('.submit-loading', submitBtn);
    const successSpan = qs('.submit-success', submitBtn);

    textSpan.hidden    = true;
    loadingSpan.hidden = false;
    submitBtn.disabled = true;

    // Simulate send (replace with a real API endpoint / EmailJS / Formspree)
    await new Promise(r => setTimeout(r, 1500));

    loadingSpan.hidden = true;
    successSpan.hidden = false;
    form.reset();

    setTimeout(() => {
      successSpan.hidden = true;
      textSpan.hidden    = false;
      submitBtn.disabled = false;
    }, 3000);
  });
}

// ─── 10. COMMAND PALETTE ─────────────────────────────────────
function initCommandPalette() {
  const overlay = qs('#cmd-overlay');
  const input   = qs('#cmd-input');
  const list    = qs('#cmd-list');
  const trigger = qs('#cmd-trigger');
  if (!overlay || !input || !list) return;

  const commands = [
    { label: 'Go to Home',        icon: 'fa fa-house',    action: () => scrollToSection('#hero'),           shortcut: '↵' },
    { label: 'Go to About',       icon: 'fa fa-user',     action: () => scrollToSection('#about') },
    { label: 'Go to Skills',      icon: 'fa fa-code',     action: () => scrollToSection('#skills') },
    { label: 'Go to Projects',    icon: 'fa fa-briefcase',action: () => scrollToSection('#projects') },
    { label: 'Go to Contact',     icon: 'fa fa-envelope', action: () => scrollToSection('#contact') },
    { label: 'Download Resume',   icon: 'fa fa-download', action: () => window.open('227003168__AkashM.pdf') },
    { label: 'Open LinkedIn',     icon: 'fab fa-linkedin',action: () => window.open('https://www.linkedin.com/in/akash-m-1966b6378/', '_blank', 'noopener') },
    { label: 'Open Instagram',    icon: 'fab fa-instagram',action: () => window.open('https://www.instagram.com/akash___7754/', '_blank', 'noopener') },
    { label: 'Send Email',        icon: 'fa fa-envelope', action: () => window.location.href = 'mailto:mkpraveenmkakash@gmail.com' },
    { label: 'Toggle Dark/Light', icon: 'fa fa-circle-half-stroke', action: () => toggleTheme(), shortcut: 'T' },
  
  ];

  let filteredCommands = [...commands];
  let activeIdx = 0;

  function scrollToSection(sel) {
    const el = qs(sel);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    close();
  }

  function renderList(cmds) {
    list.innerHTML = '';
    if (!cmds.length) {
      list.innerHTML = '<li class="cmd-empty">No commands found</li>';
      return;
    }
    cmds.forEach((cmd, i) => {
      const li = document.createElement('li');
      li.className = 'cmd-item' + (i === activeIdx ? ' active' : '');
      li.setAttribute('role', 'option');
      li.innerHTML = `
        <span class="cmd-item-icon"><i class="${cmd.icon}" aria-hidden="true"></i></span>
        <span class="cmd-item-label">${cmd.label}</span>
        ${cmd.shortcut ? `<kbd class="cmd-item-shortcut">${cmd.shortcut}</kbd>` : ''}
      `;
      li.addEventListener('mouseenter', () => setActive(i));
      li.addEventListener('click', () => { cmd.action(); close(); });
      list.appendChild(li);
    });
  }

  function setActive(idx) {
    activeIdx = idx;
    qsa('.cmd-item', list).forEach((el, i) => {
      el.classList.toggle('active', i === activeIdx);
    });
  }

  function open() {
    overlay.hidden = false;
    input.value = '';
    filteredCommands = [...commands];
    activeIdx = 0;
    renderList(filteredCommands);
    input.focus();
  }

  function close() {
    overlay.hidden = true;
    input.blur();
  }

  function runActive() {
    if (filteredCommands[activeIdx]) {
      filteredCommands[activeIdx].action();
      close();
    }
  }

  input.addEventListener('input', () => {
    const q = input.value.toLowerCase();
    filteredCommands = commands.filter(c => c.label.toLowerCase().includes(q));
    activeIdx = 0;
    renderList(filteredCommands);
  });

  document.addEventListener('keydown', e => {
    // Open
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      overlay.hidden ? open() : close();
      return;
    }
    if (overlay.hidden) return;

    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((activeIdx + 1) % filteredCommands.length);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((activeIdx - 1 + filteredCommands.length) % filteredCommands.length);
      return;
    }
    if (e.key === 'Enter') { e.preventDefault(); runActive(); }
  });

  overlay.addEventListener('click', e => {
    if (e.target === overlay) close();
  });

  if (trigger) trigger.addEventListener('click', () => open());
}

// ─── 11. THEME TOGGLE ────────────────────────────────────────
function initTheme() {
  const saved = localStorage.getItem('portfolio-theme');
  const pref  = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  const theme = saved || pref;
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeIcon(theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next    = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('portfolio-theme', next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  const icon = qs('#theme-icon');
  if (!icon) return;
  icon.className = theme === 'dark' ? 'fa fa-moon' : 'fa fa-sun';
}

function initThemeToggle() {
  const btn = qs('#theme-toggle');
  if (btn) btn.addEventListener('click', toggleTheme);
}

// ─── 12. MOBILE MENU ─────────────────────────────────────────
function initMobileMenu() {
  const hamburger  = qs('#hamburger');
  const mobileMenu = qs('#mobile-menu');
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!expanded));
    mobileMenu.hidden = expanded;
  });

  // Close on link click
  qsa('.mobile-link', mobileMenu).forEach(link => {
    link.addEventListener('click', () => {
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.hidden = true;
    });
  });
}

// ─── 13. BACK TO TOP ─────────────────────────────────────────
function initBackToTop() {
  const btn = qs('#back-to-top');
  if (!btn) return;
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ─── 14. EASTER EGG: KONAMI CODE ────────────────────────────
function initKonami() {
  const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let pos = 0;

  document.addEventListener('keydown', e => {
    if (e.key === KONAMI[pos]) {
      pos++;
      if (pos === KONAMI.length) {
        pos = 0;
        activateKonami();
      }
    } else {
      pos = 0;
    }
  });

  function activateKonami() {
    // Inject a brief glitch overlay
    const msg = document.createElement('div');
    msg.style.cssText = `
      position:fixed;inset:0;z-index:9999;display:flex;
      align-items:center;justify-content:center;
      background:rgba(8,8,15,0.95);
      font-family:'JetBrains Mono',monospace;
      font-size:clamp(14px,2vw,20px);
      color:#06b6d4;text-align:center;padding:40px;
      animation:fadeInKonami .3s ease;
    `;
    msg.innerHTML = `
      <div>
        <div style="font-size:2.5em;margin-bottom:16px">🎮</div>
        <div style="color:#3b82f6;font-size:1.2em;margin-bottom:12px">// KONAMI CODE UNLOCKED</div>
        <div style="color:#a0a0c0;font-size:.85em;line-height:1.8">
          console.log("Nice one. You've found the easter egg.")<br/>
          console.log("Abishek appreciates curious minds.")<br/>
          console.log("Keep exploring the web. 🚀")
        </div>
        <div style="margin-top:24px;color:#5a5a80;font-size:.75em">Press ESC or click to close</div>
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `@keyframes fadeInKonami { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }`;
    document.head.appendChild(style);
    document.body.appendChild(msg);

    const dismiss = () => { msg.remove(); style.remove(); document.removeEventListener('keydown', onEsc); };
    const onEsc   = e => { if (e.key === 'Escape') dismiss(); };
    msg.addEventListener('click', dismiss);
    document.addEventListener('keydown', onEsc);
  }
}

// ─── 15. DEVELOPER CONSOLE GREETING ─────────────────────────
function initConsoleGreeting() {
  const styles = [
    'background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: #fff; padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: bold;',
    'color: #06b6d4; font-size: 13px;',
    'color: #a0a0c0; font-size: 12px;',
    'color: #3b82f6; font-size: 12px; font-family: monospace;',
  ];

  console.log('%c👋 Hey, curious developer!', styles[0]);
  console.log('%cI\'m Abishek N N — Full-Stack Developer & Digital Architect.', styles[1]);
  console.log('%cYou found the developer console. I love that you\'re here.', styles[2]);
  console.log('%cReach out: abisheknnask@gmail.com', styles[3]);
  console.log('%cPS: Try the Konami code on the page. 🎮', styles[2]);
}

// ─── HERO ENTRANCE ANIMATION ─────────────────────────────────
function initHeroEntrance() {
  if (prefersReducedMotion()) return;

  const elements = qsa('.hero-inner .reveal-up');
  elements.forEach((el, i) => {
    el.style.transitionDelay = `${0.3 + i * 0.12}s`;
    setTimeout(() => el.classList.add('in-view'), 100);
  });
}

// ─── SMOOTH NAV SCROLLING ─────────────────────────────────────
function initSmoothNav() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ─── INIT ALL ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initTheme();
  initCursor();
  initNavbar();
  initCanvas();
  initTypewriter();
  initScrollReveal();
  initMagnetic();
  initProjectFilters();
  initContactForm();
  initCommandPalette();
  initThemeToggle();
  initMobileMenu();
  initBackToTop();
  initKonami();
  initConsoleGreeting();
  initHeroEntrance();
  initSmoothNav();
});
