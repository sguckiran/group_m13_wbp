// main.js - loads homepage and footer content from JSON and injects into the page

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
}

let homepageRaw = null;
let footerRaw = null;
let translations = null;
window.currentLang = window.currentLang || 'English';

function createHeroSection(hero) {
  const container = document.createElement('div');
  container.className = 'hero-inner';

  const text = document.createElement('div');
  text.className = 'hero-text';

  const h1 = document.createElement('h1');
  h1.textContent = hero.title;
  text.appendChild(h1);

  const p = document.createElement('p');
  p.textContent = hero.subtitle;
  text.appendChild(p);

  if (hero.button) {
    const a = document.createElement('a');
    a.className = 'hero-button';
    a.href = hero.button.href || '#';
    // translate the default button text if translator is available
    const dict = translations || window.TRANSLATIONS || null;
    const defaultBtn = (typeof window.translateData === 'function' && dict)
      ? window.translateData(hero.button.text || 'Learn more', window.currentLang, dict)
      : (hero.button.text || 'Learn more');
    a.textContent = defaultBtn;
    text.appendChild(a);
  }

  container.appendChild(text);

  if (hero.image) {
    const imgWrap = document.createElement('div');
    imgWrap.className = 'hero-image';
    const img = document.createElement('img');
    img.src = hero.image;
    img.alt = hero.title || 'Hero image';
    imgWrap.appendChild(img);
    container.appendChild(imgWrap);
  }

  return container;
}

function createGoalCard(goal) {
  const card = document.createElement('article');
  card.className = 'goal-card';

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
    // translate the 'Read more' label if translator is available
    const dict = translations || window.TRANSLATIONS || null;
    const readMore = (typeof window.translateData === 'function' && dict)
      ? window.translateData('Read more', window.currentLang, dict)
      : 'Read more';
    a.textContent = goal.linkLabel || readMore;
    body.appendChild(a);
  }

  card.appendChild(body);
  return card;
}

async function renderHomepageFromRaw() {
  if (!homepageRaw) return;
  try {
    window.__diagLog && window.__diagLog('renderHomepageFromRaw: start');
  } catch(e) {}
  const dict = translations || window.TRANSLATIONS || null;
  const data = (typeof window.translateData === 'function' && dict)
    ? window.translateData(homepageRaw, window.currentLang, dict)
    : homepageRaw;

  const heroEl = document.getElementById('hero');
  if (heroEl) {
    heroEl.innerHTML = '';
    heroEl.appendChild(createHeroSection(data.hero || {}));
  }

  const goalsContainer = document.getElementById('goals-container');
  if (goalsContainer) {
    goalsContainer.innerHTML = '';
    (data.goals || []).forEach(goal => {
      goalsContainer.appendChild(createGoalCard(goal));
    });
  }
  try { window.__diagLog && window.__diagLog('renderHomepageFromRaw: done'); } catch(e) {}
}

async function initHomepage() {
  try {
    window.__diagLog && window.__diagLog('initHomepage: start');
    try {
      translations = await loadJSON('json/translations.json');
      window.__diagLog && window.__diagLog('initHomepage: translations loaded');
    } catch (e) {
      translations = window.TRANSLATIONS || null;
      window.__diagLog && window.__diagLog('initHomepage: translations missing or failed; using existing');
    }

    // if header.js or another script loaded TRANSLATIONS after ours started, pick it up
    if (!translations && window.TRANSLATIONS) translations = window.TRANSLATIONS;

    homepageRaw = await loadJSON('json/homepage.json');
    window.__diagLog && window.__diagLog('initHomepage: homepage.json loaded');
    footerRaw = await loadJSON('json/footer.json');
    window.__diagLog && window.__diagLog('initHomepage: footer.json loaded');

    await renderHomepageFromRaw();
    renderFooter((typeof window.translateData === 'function' && (translations || window.TRANSLATIONS))
      ? window.translateData(footerRaw, window.currentLang, (translations || window.TRANSLATIONS))
      : footerRaw);

    // listen for language changes
    document.addEventListener('languageChanged', async (ev) => {
      const lang = ev && ev.detail && ev.detail.lang ? ev.detail.lang : window.currentLang;
      window.currentLang = lang;
      // refresh local translations reference from global if available
      if (window.TRANSLATIONS) translations = window.TRANSLATIONS;
      window.__diagLog && window.__diagLog('initHomepage: languageChanged -> ' + lang);
      await renderHomepageFromRaw();
      renderFooter((typeof window.translateData === 'function' && (translations || window.TRANSLATIONS))
        ? window.translateData(footerRaw, lang, (translations || window.TRANSLATIONS))
        : footerRaw);
    });

    // react when translations are loaded by header (or another script)
    document.addEventListener('translationsLoaded', (ev) => {
      try {
        translations = ev && ev.detail && ev.detail.translations ? ev.detail.translations : window.TRANSLATIONS || translations;
        window.__diagLog && window.__diagLog('initHomepage: translationsLoaded event received');
        // re-render with the new translations
        renderHomepageFromRaw();
        renderFooter((typeof window.translateData === 'function' && translations)
          ? window.translateData(footerRaw, window.currentLang, translations)
          : footerRaw);
      } catch (e) {
        console.error('translationsLoaded handler error', e);
      }
    });
  } catch (err) {
    console.error(err);
    window.__diagLog && window.__diagLog('initHomepage: error - ' + (err && err.message));
  }
}

function renderFooter(data) {
  const footer = document.getElementById('site-footer');
  if (!footer) return;
  footer.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'footer-inner';

  const left = document.createElement('div');
  left.className = 'footer-left';
  const logo = document.createElement('img');
  logo.src = data.logo || 'assets/logo.png';
  logo.alt = 'logo';
  logo.className = 'footer-logo';
  left.appendChild(logo);

  const links = document.createElement('nav');
  links.className = 'footer-links';
  (data.links || []).forEach(l => {
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
  copy.textContent = data.copyright || '';
  right.appendChild(copy);
  wrapper.appendChild(right);

  footer.appendChild(wrapper);
}

// initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // only initialize homepage if hero exists
  if (document.getElementById('hero')) {
    initHomepage();
  }
});

// Failsafe: if the DOM is already ready (script loaded late), start immediately once
if (document.readyState !== 'loading') {
  try {
    if (!window.__homepageInitiated && document.getElementById('hero')) {
      window.__homepageInitiated = true;
      initHomepage();
    }
  } catch (e) {
    console.error('homepage immediate init failed', e);
    window.__diagLog && window.__diagLog('homepage immediate init failed: ' + (e && e.message));
  }
}
