/* ==========================================================================
   WEALTH / OCHEN JOSHUA — PROGRESSIVE EXPERIENCE ENGINE v2.0
   Zero third-party dependencies · Graceful degradation · Reduced-motion safe
   ========================================================================== */

(function () {
  'use strict';

  const prefersReducedMotion = () =>
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const toastEl = () => document.getElementById('wealth-toast');
  let toastTimer = null;

  function showToast(message) {
    const el = toastEl();
    if (!el) return;
    el.textContent = message;
    el.classList.add('is-shown');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.classList.remove('is-shown');
    }, 2800);
  }

  /* ------------------------------------------------------------------------
     1. Live Kampala EAT Telemetry Clock + Footer Year
     ------------------------------------------------------------------------ */
  function initTelemetryClock() {
    const yr = document.getElementById('wealth-year');
    if (yr) yr.textContent = String(new Date().getFullYear());

    const clockNodes = document.querySelectorAll('[data-kampala-time]');
    if (!clockNodes.length) return;

    const update = () => {
      try {
        const formatted = new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Africa/Kampala',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).format(new Date());
        clockNodes.forEach((n) => {
          n.textContent = `KLA · ${formatted} EAT`;
        });
      } catch {
        clockNodes.forEach((n) => {
          n.textContent = 'KLA · UTC+3';
        });
      }
    };
    update();
    setInterval(update, 30000);
  }

  /* ------------------------------------------------------------------------
     2. Progressive Scroll Reveal (Crawlable & Failsafe)
     ------------------------------------------------------------------------ */
  function initScrollReveals() {
    const targets = document.querySelectorAll('[data-reveal]');
    if (!targets.length) return;

    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
    );

    targets.forEach((el) => observer.observe(el));

    // Safety fallback so above-fold or non-scrolling viewports never remain hidden
    setTimeout(() => {
      targets.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 1.15) {
          el.classList.add('is-revealed');
        }
      });
    }, 600);
  }

  /* ------------------------------------------------------------------------
     3. Subtle Desktop-Only Cursor Parallax on Crest Card
     ------------------------------------------------------------------------ */
  function initDesktopParallax() {
    if (prefersReducedMotion()) return;
    if (!window.matchMedia || !window.matchMedia('(pointer: fine)').matches) return;

    const card = document.querySelector('[data-parallax-card]');
    if (!card) return;

    card.addEventListener('pointermove', (e) => {
      if (prefersReducedMotion()) return;
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const rotY = (x * 5).toFixed(2);
      const rotX = (-y * 5).toFixed(2);
      card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    });

    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  }

  /* ------------------------------------------------------------------------
     4. Accessible Mobile Drawer Navigation
     ------------------------------------------------------------------------ */
  function initMobileDrawer() {
    const openBtn = document.getElementById('menu-toggle');
    const drawer = document.getElementById('mobile-drawer');
    const closeBtn = document.getElementById('drawer-close');
    if (!openBtn || !drawer || !closeBtn) return;

    const closeDrawer = () => {
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
      openBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      openBtn.focus();
    };

    const openDrawer = () => {
      drawer.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');
      openBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    };

    openBtn.addEventListener('click', openDrawer);
    closeBtn.addEventListener('click', closeDrawer);

    drawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        document.body.style.overflow = '';
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
        closeDrawer();
      }
    });
  }

  /* ------------------------------------------------------------------------
     5. Studio Audio Engine + Real-Time Web Audio Spectrum Analyzer
     ------------------------------------------------------------------------ */
  function formatTime(sec) {
    if (!Number.isFinite(sec) || sec < 0) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function initStudioAudio() {
    const audio = document.getElementById('wealth-audio');
    if (!audio) return;

    const toggleButtons = document.querySelectorAll('[data-audio-toggle]');
    const seekSliders = document.querySelectorAll('[data-audio-seek]');
    const volumeSliders = document.querySelectorAll('[data-audio-volume]');
    const loopBtn = document.querySelector('[data-audio-loop]');
    const timeLabels = document.querySelectorAll('[data-audio-time]');
    const vinyl = document.getElementById('studio-vinyl');
    const canvases = document.querySelectorAll('[data-spectrum-canvas]');

    let audioCtx = null;
    let analyser = null;
    let dataArray = null;
    let rafId = null;

    // Restore volume & position gently without unsolicited autoplay on cold visits
    try {
      const savedVol = parseFloat(sessionStorage.getItem('wealth_vol') || '0.68');
      audio.volume = Number.isFinite(savedVol) ? Math.min(1, Math.max(0, savedVol)) : 0.68;
      volumeSliders.forEach((s) => {
        s.value = String(Math.round(audio.volume * 100));
      });

      const savedPos = parseFloat(sessionStorage.getItem('wealth_pos') || '0');
      if (Number.isFinite(savedPos) && savedPos > 0) {
        audio.addEventListener(
          'loadedmetadata',
          () => {
            if (savedPos < audio.duration - 2) {
              audio.currentTime = savedPos;
            }
          },
          { once: true }
        );
      }
    } catch {
      audio.volume = 0.68;
    }

    function ensureAnalyser() {
      if (analyser || prefersReducedMotion()) return;
      const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextCtor) return;
      try {
        audioCtx = new AudioContextCtor();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.82;
        const source = audioCtx.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        dataArray = new Uint8Array(analyser.frequencyBinCount);
      } catch {
        analyser = null;
      }
    }

    function drawIdleBars(canvas) {
      const ctx = canvas.getContext && canvas.getContext('2d');
      if (!ctx) return;
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth || 480;
      const height = canvas.clientHeight || 84;
      if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const bars = 36;
      const gap = 4;
      const barWidth = Math.max(2, (width - (bars - 1) * gap - 24) / bars);
      for (let i = 0; i < bars; i++) {
        const wave = Math.sin(i * 0.42) * 0.35 + Math.cos(i * 0.19) * 0.25 + 0.42;
        const bh = Math.max(5, Math.round(wave * height * 0.42));
        const x = 12 + i * (barWidth + gap);
        const y = height - bh - 10;
        ctx.fillStyle = audio.paused ? 'rgba(201, 168, 105, 0.28)' : 'rgba(201, 168, 105, 0.72)';
        ctx.fillRect(x, y, barWidth, bh);
      }
    }

    function renderSpectrum() {
      if (!canvases.length) return;
      if (prefersReducedMotion() || audio.paused || !analyser || !dataArray) {
        canvases.forEach(drawIdleBars);
        return;
      }
      analyser.getByteFrequencyData(dataArray);
      canvases.forEach((canvas) => {
        const ctx = canvas.getContext && canvas.getContext('2d');
        if (!ctx) return;
        const dpr = window.devicePixelRatio || 1;
        const width = canvas.clientWidth || 480;
        const height = canvas.clientHeight || 84;
        if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
          canvas.width = Math.floor(width * dpr);
          canvas.height = Math.floor(height * dpr);
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);

        const bars = 36;
        const gap = 4;
        const barWidth = Math.max(2, (width - (bars - 1) * gap - 24) / bars);
        for (let i = 0; i < bars; i++) {
          const val = dataArray[i] / 255;
          const bh = Math.max(4, Math.round(val * (height - 20)));
          const x = 12 + i * (barWidth + gap);
          const y = height - bh - 10;
          ctx.fillStyle = val > 0.72 ? '#E2C78E' : '#C9A869';
          ctx.fillRect(x, y, barWidth, bh);
        }
      });
      rafId = requestAnimationFrame(renderSpectrum);
    }

    function syncUI() {
      const playing = !audio.paused;
      toggleButtons.forEach((btn) => {
        btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
        const txt = btn.querySelector('[data-audio-label]');
        if (txt) {
          txt.textContent = playing
            ? txt.getAttribute('data-label-playing') || 'Pause'
            : txt.getAttribute('data-label-paused') || 'Sound';
        }
      });

      if (vinyl) {
        vinyl.classList.toggle('is-spinning', playing && !prefersReducedMotion());
      }

      if (playing && !prefersReducedMotion()) {
        cancelAnimationFrame(rafId);
        renderSpectrum();
      } else {
        cancelAnimationFrame(rafId);
        canvases.forEach(drawIdleBars);
      }
    }

    function updateProgress() {
      const cur = audio.currentTime || 0;
      const dur = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 211;
      const pct = Math.min(100, Math.max(0, (cur / dur) * 100));
      seekSliders.forEach((slider) => {
        slider.value = String(pct.toFixed(1));
      });
      timeLabels.forEach((lbl) => {
        lbl.textContent = `${formatTime(cur)} / ${formatTime(dur)}`;
      });
    }

    toggleButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        ensureAnalyser();
        if (audioCtx && audioCtx.state === 'suspended') {
          audioCtx.resume().catch(() => {});
        }
        if (audio.paused) {
          audio.play().catch(() => {
            showToast('Audio ready — click again if blocked by browser policy.');
          });
        } else {
          audio.pause();
        }
      });
    });

    seekSliders.forEach((slider) => {
      slider.addEventListener('input', () => {
        const dur = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 211;
        audio.currentTime = (parseFloat(slider.value) / 100) * dur;
        updateProgress();
      });
    });

    volumeSliders.forEach((slider) => {
      slider.addEventListener('input', () => {
        const vol = Math.min(1, Math.max(0, parseFloat(slider.value) / 100));
        audio.volume = vol;
        try {
          sessionStorage.setItem('wealth_vol', String(vol));
        } catch {}
      });
    });

    if (loopBtn) {
      loopBtn.addEventListener('click', () => {
        audio.loop = !audio.loop;
        loopBtn.setAttribute('aria-pressed', audio.loop ? 'true' : 'false');
        showToast(audio.loop ? 'Session loop enabled' : 'Session loop disabled');
      });
    }

    audio.addEventListener('play', syncUI);
    audio.addEventListener('pause', syncUI);
    audio.addEventListener('ended', syncUI);
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateProgress);

    window.addEventListener('pagehide', () => {
      try {
        sessionStorage.setItem('wealth_pos', String(audio.currentTime || 0));
      } catch {}
    });

    canvases.forEach(drawIdleBars);
    updateProgress();
  }

  /* ------------------------------------------------------------------------
     6. Work Showcase Filter (/work/)
     ------------------------------------------------------------------------ */
  function initWorkFilter() {
    const buttons = document.querySelectorAll('[data-work-filter]');
    const items = document.querySelectorAll('[data-project-status]');
    const countAnnouncement = document.querySelector('[data-filter-count]');
    if (!buttons.length || !items.length) return;

    function applyFilter(filterKey, updateUrl) {
      let visibleCount = 0;
      items.forEach((item) => {
        const st = item.getAttribute('data-project-status');
        const match = filterKey === 'all' || st === filterKey;
        item.hidden = !match;
        if (match) visibleCount++;
      });

      buttons.forEach((btn) => {
        const isCurrent = btn.getAttribute('data-work-filter') === filterKey;
        btn.setAttribute('aria-pressed', isCurrent ? 'true' : 'false');
      });

      if (countAnnouncement) {
        const labelMap = {
          all: 'All projects',
          live: 'Live projects',
          prototype: 'Prototype builds',
          'in-development': 'Projects in development'
        };
        countAnnouncement.textContent = `Showing ${visibleCount} — ${labelMap[filterKey] || 'Projects'}`;
      }

      if (updateUrl && window.history && window.history.replaceState) {
        const url = new URL(window.location.href);
        if (filterKey === 'all') url.searchParams.delete('status');
        else url.searchParams.set('status', filterKey);
        window.history.replaceState({}, '', url.toString());
      }
    }

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        applyFilter(btn.getAttribute('data-work-filter') || 'all', true);
      });
    });

    const initial = new URLSearchParams(window.location.search).get('status');
    if (initial && ['all', 'live', 'prototype', 'in-development'].includes(initial)) {
      applyFilter(initial, false);
    }
  }

  /* ------------------------------------------------------------------------
     7. Engineering Code Vault Tabs & Copy Buttons
     ------------------------------------------------------------------------ */
  function initCodeTabsAndCopy() {
    const tabs = document.querySelectorAll('[data-code-tab]');
    const panels = document.querySelectorAll('[data-code-panel]');

    if (tabs.length && panels.length) {
      const activate = (id) => {
        tabs.forEach((t) => {
          const active = t.getAttribute('data-code-tab') === id;
          t.setAttribute('aria-selected', active ? 'true' : 'false');
          t.tabIndex = active ? 0 : -1;
        });
        panels.forEach((p) => {
          p.hidden = p.getAttribute('data-code-panel') !== id;
        });
      };

      tabs.forEach((tab, idx) => {
        tab.addEventListener('click', () => activate(tab.getAttribute('data-code-tab')));
        tab.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            e.preventDefault();
            const dir = e.key === 'ArrowRight' ? 1 : -1;
            const next = tabs[(idx + dir + tabs.length) % tabs.length];
            next.focus();
            activate(next.getAttribute('data-code-tab'));
          }
        });
      });
    }

    document.querySelectorAll('[data-copy-text]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const val = btn.getAttribute('data-copy-text') || '';
        const msg = btn.getAttribute('data-copy-label') || 'Copied to clipboard';
        try {
          await navigator.clipboard.writeText(val);
          showToast(msg);
        } catch {
          showToast(val);
        }
      });
    });

    document.querySelectorAll('[data-copy-target]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const selector = btn.getAttribute('data-copy-target');
        const target = selector ? document.querySelector(selector) : null;
        if (!target) return;
        const text = target.innerText || target.textContent || '';
        const msg = btn.getAttribute('data-copy-label') || 'Copied to clipboard';
        try {
          await navigator.clipboard.writeText(text.trim());
          showToast(msg);
        } catch {
          showToast('Select text manually to copy');
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     8. Live GitHub Repository Telemetry Sync (/engineering/)
     ------------------------------------------------------------------------ */
  async function initGitHubSync() {
    const syncBadge = document.querySelector('[data-gh-sync-status]');
    if (!syncBadge || typeof fetch !== 'function') return;

    try {
      const cached = sessionStorage.getItem('wealth_gh_repos');
      let repos = cached ? JSON.parse(cached) : null;

      if (!repos) {
        const res = await fetch('https://api.github.com/users/ochenjoshua5-jpg/repos?per_page=15&sort=pushed', {
          headers: { Accept: 'application/vnd.github+json' }
        });
        if (!res.ok) return;
        repos = await res.json();
        sessionStorage.setItem('wealth_gh_repos', JSON.stringify(repos));
      }

      if (Array.isArray(repos)) {
        repos.forEach((repo) => {
          const row = document.querySelector(`[data-repo-name="${repo.name}"]`);
          if (!row) return;
          const updatedNode = row.querySelector('[data-repo-updated]');
          if (updatedNode && repo.pushed_at) {
            const d = new Date(repo.pushed_at);
            updatedNode.textContent = d.toISOString().slice(0, 10);
          }
        });
        syncBadge.textContent = `LIVE GITHUB TELEMETRY · ${repos.length} PUBLIC REPOSITORIES VERIFIED`;
      }
    } catch {
      // Graceful fallback to pre-rendered static repository data
    }
  }

  /* ------------------------------------------------------------------------
     9. Dual-Mode Contact Form (Netlify Forms + Direct Mailto/Clipboard Backup)
     ------------------------------------------------------------------------ */
  function initContactForm() {
    const form = document.getElementById('wealth-contact-form');
    if (!form) return;

    const statusBox = document.getElementById('wealth-form-status');
    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!submitBtn || !statusBox) return;

      const fd = new FormData(form);
      const name = String(fd.get('name') || '').trim();
      const email = String(fd.get('email') || '').trim();
      const subject = String(fd.get('subject') || 'Direct Inquiry via Wealth Digital Profile').trim();
      const message = String(fd.get('message') || '').trim();

      if (!name || !email || !message) {
        statusBox.textContent = 'Please complete your name, email address, and message before sending.';
        statusBox.classList.add('is-visible');
        return;
      }

      const originalLabel = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'DISPATCHING...';

      const formattedBody = `Name: ${name}\nEmail: ${email}\nInquiry Type: ${subject}\n\n${message}`;
      const mailtoHref = `mailto:ochenjoshua5@gmail.com?subject=${encodeURIComponent(
        `[WEALTH INQUIRY] ${subject} — ${name}`
      )}&body=${encodeURIComponent(formattedBody)}`;

      try {
        const bodyParams = new URLSearchParams();
        fd.forEach((value, key) => {
          bodyParams.append(key, String(value));
        });

        const response = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: bodyParams.toString()
        });

        if (response.ok) {
          form.reset();
          statusBox.innerHTML =
            '<strong>Message received.</strong> Your dispatch has been logged directly for Ochen Joshua. For time-sensitive inquiries, you can also write directly to <a href="mailto:ochenjoshua5@gmail.com">ochenjoshua5@gmail.com</a>.';
          statusBox.classList.add('is-visible');
          showToast('Dispatch delivered');
        } else {
          throw new Error('Static preview fallback');
        }
      } catch {
        statusBox.innerHTML = `<strong>Direct email dispatch ready:</strong> Opening your mail client addressed to <a href="${mailtoHref}">ochenjoshua5@gmail.com</a> with your message pre-filled.`;
        statusBox.classList.add('is-visible');
        window.location.href = mailtoHref;
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initTelemetryClock();
    initScrollReveals();
    initDesktopParallax();
    initMobileDrawer();
    initStudioAudio();
    initWorkFilter();
    initCodeTabsAndCopy();
    initGitHubSync();
    initContactForm();
  });
})();
