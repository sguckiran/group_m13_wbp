// header.js - render header from json and handle language toggling

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
}

let headerRaw = null;
let translations = null;
window.currentLang = window.currentLang || 'English';

function buildHeader(data) {
  const header = document.getElementById('site-header');
  header.innerHTML = '';

  // logo
  const fig = document.createElement('figure');
  fig.className = 'logo';
  const img = document.createElement('img');
  img.src = data.logo || 'assets/logo.png';
  img.alt = 'logo';
  img.width = 100;
  img.height = 100;
  fig.appendChild(img);
  header.appendChild(fig);

  // languages
  const langUl = document.createElement('ul');
  langUl.className = 'language';
  (data.languages || []).forEach((l, idx) => {
    const li = document.createElement('li');
    li.textContent = l;
    li.dataset.lang = l;
    if (l === window.currentLang || (idx === 0 && !window.currentLang)) li.classList.add('active');
    langUl.appendChild(li);
  });
  header.appendChild(langUl);

  // navigation
  const navUl = document.createElement('ul');
  navUl.className = 'navigation';
  (data.nav || []).forEach((item, idx) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = item.href || '#';
    a.textContent = item.label;
    li.appendChild(a);
    if (idx === 0) li.classList.add('active');
    navUl.appendChild(li);
  });

  // button
  if (data.button) {
    const btn = document.createElement('button');
    btn.className = 'header-cta';
    btn.textContent = data.button.label || 'Sign Up';
    btn.addEventListener('click', () => {
      window.location.href = data.button.href || '#';
    });
    navUl.appendChild(btn);
  }

  header.appendChild(navUl);

  // language toggle behavior
  const listItems = header.querySelectorAll('.language li');
  let activeLang = header.querySelector('.language li.active');
  listItems.forEach((element) => {
    element.addEventListener('click', () => {
      if (activeLang) activeLang.classList.remove('active');
      element.classList.add('active');
      activeLang = element;
      const selected = element.dataset.lang;
      if (selected && selected !== window.currentLang) {
        window.currentLang = selected;
        // notify other scripts to re-render with the new language
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: selected } }));
      }
    });
  });
}

// initialize header on DOM ready
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // load translations first (optional file)
    try {
      translations = await loadJSON('json/translations.json');
      window.TRANSLATIONS = translations;
      // notify other scripts that translations are now available
      document.dispatchEvent(new CustomEvent('translationsLoaded', { detail: { translations } }));

    } catch (e) {
      translations = null;
      console.warn('translations.json not found or failed to load; continuing without translations');
    }

    headerRaw = await loadJSON('json/header.json');
    const toRender = (typeof window.translateData === 'function' && translations)
      ? window.translateData(headerRaw, window.currentLang, translations)
      : headerRaw;

    buildHeader(toRender);

    // also react to external languageChanged events to update header
    document.addEventListener('languageChanged', (ev) => {
      if (!headerRaw) return;
      const lang = ev && ev.detail && ev.detail.lang ? ev.detail.lang : window.currentLang;
      const r = (typeof window.translateData === 'function' && translations)
        ? window.translateData(headerRaw, lang, translations)
        : headerRaw;
      buildHeader(r);
    });
  } catch (err) {
    console.warn('Could not load header.json, header will not be dynamic.', err);
  }
});