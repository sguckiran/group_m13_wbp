// Small shim: robustly trigger homepage rendering when available.
// It will call `initHomepage()` when it becomes available (polling up to ~2s).
(function () {
  const MAX_ATTEMPTS = 40; // ~40 * 50ms = 2000ms
  const INTERVAL = 50;
  let attempts = 0;

  // helper to get translations (use window.TRANSLATIONS if present, otherwise fetch)
  function getTranslations() {
    return new Promise((resolve) => {
      if (window.TRANSLATIONS) return resolve(window.TRANSLATIONS);
      // try to fetch translations.json; if fails resolve null
      if (typeof fetch !== 'function') return resolve(null);
      fetch('json/translations.json').then(r => r.json()).then(t => {
        window.TRANSLATIONS = t;
        resolve(t);
      }).catch(() => resolve(null));
    });
  }

  function createGoalCardShim(goal) {
    const card = document.createElement('article');
    card.className = 'goal-card shim';

    if (goal.image) {
      const img = document.createElement('img');
      img.src = goal.image;
      img.alt = goal.title || 'goal image';
      card.appendChild(img);
    }

    const body = document.createElement('div');
    body.className = 'goal-body';

    if (goal.category) {
      const cat = document.createElement('p');
      cat.className = 'goal-category';
      cat.textContent = goal.category;
      body.appendChild(cat);
    }

    const title = document.createElement('h3');
    title.textContent = goal.title;
    body.appendChild(title);

    if (goal.description) {
      const desc = document.createElement('p');
      desc.textContent = goal.description;
      body.appendChild(desc);
    }

    if (goal.link) {
      const a = document.createElement('a');
      a.href = goal.link;
      a.textContent = 'Read more';
      body.appendChild(a);
    }

    card.appendChild(body);
    return card;
  }

  function renderGoalsShim(goals) {
    try {
      const container = document.getElementById('goals-container');
      if (!container) return false;
      container.innerHTML = '';
      (goals || []).forEach(g => container.appendChild(createGoalCardShim(g)));
      return true;
    } catch (e) {
      return false;
    }
  }

  function renderFooterShim(footerData) {
    try {
      const footer = document.getElementById('site-footer');
      if (!footer) return false;
      footer.innerHTML = '';
      const wrapper = document.createElement('div');
      wrapper.className = 'footer-inner shim';

      const left = document.createElement('div');
      left.className = 'footer-left';
      const logo = document.createElement('img');
      logo.src = (footerData && footerData.logo) || 'assets/logo.png';
      logo.alt = 'logo';
      logo.className = 'footer-logo';
      left.appendChild(logo);

      const links = document.createElement('nav');
      links.className = 'footer-links';
      (footerData && footerData.links || []).forEach(l => {
        const a = document.createElement('a');
        a.href = l.href || '#';
        a.textContent = l.label;
        links.appendChild(a);
      });
      left.appendChild(links);

      wrapper.appendChild(left);

      const right = document.createElement('div');
      right.className = 'footer-right';
      const copy = document.createElement('div');
      copy.textContent = (footerData && footerData.copyright) || '';
      right.appendChild(copy);
      wrapper.appendChild(right);

      footer.appendChild(wrapper);
      return true;
    } catch (e) {
      return false;
    }
  }

  function manualRenderWithBuiltin(d) {
    // apply translations if available
    const dict = window.TRANSLATIONS || null;
    const lang = window.currentLang || 'English';
    const data = (typeof window.translateData === 'function' && dict) ? window.translateData(d, lang, dict) : d;

    const hero = data && data.hero ? data.hero : {};
    const heroEl = document.getElementById('hero');
    if (!heroEl) return false;
    heroEl.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'hero-inner shim';

    const text = document.createElement('div');
    text.className = 'hero-text shim';

    const h1 = document.createElement('h1');
    h1.textContent = hero.title || '';
    text.appendChild(h1);

    const p = document.createElement('p');
    p.textContent = hero.subtitle || '';
    text.appendChild(p);

    if (hero.button && hero.button.text) {
      const a = document.createElement('a');
      a.className = 'hero-button shim';
      a.href = hero.button.href || '#';
      a.textContent = hero.button.text || 'Learn more';
      text.appendChild(a);
    }

    container.appendChild(text);

    if (hero.image) {
      const imgWrap = document.createElement('div');
      imgWrap.className = 'hero-image shim';
      const img = document.createElement('img');
      img.src = hero.image;
      img.alt = hero.title || 'Hero image';
      imgWrap.appendChild(img);
      container.appendChild(imgWrap);
    }

    heroEl.appendChild(container);

    // also render goals if present
    renderGoalsShim(data && data.goals ? data.goals : []);
    return true;
  }

  function manualFallback() {
    if (window.__diagLog) window.__diagLog('homepage.js: fallback -> manual render');
    if (typeof fetch !== 'function') {
      if (window.__diagLog) window.__diagLog('homepage.js: manual fallback not possible (missing fetch)');
      return;
    }

    // load homepage.json and translations in parallel
    Promise.all([
      fetch('json/homepage.json').then(r => r.json()).catch(() => null),
      getTranslations()
    ]).then(([d, dict]) => {
      if (!d) {
        if (window.__diagLog) window.__diagLog('homepage.js: failed to load homepage.json');
        return;
      }
      const lang = window.currentLang || 'English';
      const data = (typeof window.translateData === 'function' && dict) ? window.translateData(d, lang, dict) : d;

      const heroEl = document.getElementById('hero');
      if (heroEl) {
        heroEl.innerHTML = '';
        if (typeof createHeroSection === 'function') {
          try {
            heroEl.appendChild(createHeroSection(data.hero || {}));
            if (window.__diagLog) window.__diagLog('homepage.js: manual render of hero done (via createHeroSection)');
          } catch (e) {
            if (manualRenderWithBuiltin(data)) {
              if (window.__diagLog) window.__diagLog('homepage.js: manual render of hero done (builtin fallback)');
            } else {
              if (window.__diagLog) window.__diagLog('homepage.js: manual render failed - heroEl missing');
            }
          }
        } else {
          if (manualRenderWithBuiltin(data)) {
            if (window.__diagLog) window.__diagLog('homepage.js: manual render of hero done (builtin)');
          }
        }
      } else {
        if (window.__diagLog) window.__diagLog('homepage.js: manual render - hero element not found');
      }

      // render goals (via createGoalCard if available, otherwise via shim)
      try {
        if (data && data.goals) {
          if (typeof createGoalCard === 'function') {
            const gc = document.getElementById('goals-container');
            if (gc) {
              gc.innerHTML = '';
              data.goals.forEach(g => gc.appendChild(createGoalCard(g)));
              if (window.__diagLog) window.__diagLog('homepage.js: manual render goals via createGoalCard');
            }
          } else {
            renderGoalsShim(data.goals);
            if (window.__diagLog) window.__diagLog('homepage.js: manual render goals via shim');
          }
        }
      } catch (e) {
        if (window.__diagLog) window.__diagLog('homepage.js: error rendering goals: ' + (e && e.message));
      }

      // footer
      try {
        if (data) {
          // translate footer if translations available
          if (dict) {
            // if footer was included inside homepage.json (not in your file) it would be translated above; otherwise fetch footer.json already handled below
          }
          fetch('json/footer.json').then(r => r.json()).then(fd => {
            const fdata = (typeof window.translateData === 'function' && dict) ? window.translateData(fd, lang, dict) : fd;
            if (typeof renderFooter === 'function') {
              renderFooter(fdata);
              if (window.__diagLog) window.__diagLog('homepage.js: footer rendered via renderFooter');
            } else {
              renderFooterShim(fdata);
              if (window.__diagLog) window.__diagLog('homepage.js: footer rendered via shim');
            }
          }).catch(err => {
            if (window.__diagLog) window.__diagLog('homepage.js: failed fetching footer.json: ' + (err && err.message));
          });
        }
      } catch (e) {
        if (window.__diagLog) window.__diagLog('homepage.js: error rendering footer: ' + (e && e.message));
      }

    }).catch(err => { if (window.__diagLog) window.__diagLog('homepage.js: manual fetch failed: ' + (err && err.message)); });
  }

  (function tryCall() {
    try {
      if (typeof initHomepage === 'function') {
        if (window.__diagLog) window.__diagLog('homepage.js: calling initHomepage()');
        try { initHomepage(); } catch (e) { console.error('homepage.js: initHomepage errored', e); if (window.__diagLog) window.__diagLog('homepage.js: initHomepage errored: ' + e.message); }
        return true;
      }
      return false;
    } catch (e) {
      // shouldn't happen
      return false;
    }
  })();

  (function pollLoop() {
    const MAX_ATTEMPTS = 40;
    const INTERVAL = 50;
    let attempts = 0;
    function poll() {
      attempts++;
      if (tryCall()) return;
      if (attempts >= MAX_ATTEMPTS) {
        manualFallback();
        return;
      }
      setTimeout(poll, INTERVAL);
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', poll);
    } else {
      poll();
    }
  })();

  // Failsafe: if after a short delay the goals container is still empty, try manual fallback
  (function failsafe() {
    function checkAndFallback() {
      try {
        const gc = document.getElementById('goals-container');
        const heroEl = document.getElementById('hero');
        const hasGoals = gc && gc.children && gc.children.length > 0;
        const hasHero = heroEl && heroEl.children && heroEl.children.length > 0;
        if (!hasGoals || !hasHero) {
          if (window.__diagLog) window.__diagLog('homepage.js: failsafe triggered (hasHero=' + !!hasHero + ', hasGoals=' + !!hasGoals + ')');
          // call manualFallback to populate hero/goals/footer
          try { manualFallback(); } catch (e) { if (window.__diagLog) window.__diagLog('homepage.js: failsafe manualFallback errored: ' + (e && e.message)); }
        } else {
          if (window.__diagLog) window.__diagLog('homepage.js: failsafe - content present, no action');
        }
      } catch (e) {
        if (window.__diagLog) window.__diagLog('homepage.js: failsafe check error: ' + (e && e.message));
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => setTimeout(checkAndFallback, 350));
    } else {
      setTimeout(checkAndFallback, 350);
    }
  })();
})();
