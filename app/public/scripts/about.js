// about.js - render About page from json/about.json and footer

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
}

let aboutRaw = null;
let footerRaw = null;
let translations = null;
window.currentLang = window.currentLang || 'English';

function renderHero(hero) {
  const el = document.getElementById('about-hero');
  if (!el) return;
  el.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'about-hero-inner';
  wrap.style.background = '#222';
  wrap.style.padding = '40px 0';

  const img = document.createElement('img');
  img.src = hero.image || 'assets/about-hero.jpg';
  img.alt = hero.title || 'About';
  img.style.width = '100%';
  img.style.height = '240px';
  img.style.objectFit = 'cover';
  wrap.appendChild(img);

  const title = document.createElement('h1');
  title.textContent = hero.title || 'About Us';
  title.style.position = 'relative';
  title.style.top = '-160px';
  title.style.textAlign = 'center';
  title.style.color = 'white';
  title.style.fontSize = '40px';
  wrap.appendChild(title);

  el.appendChild(wrap);
}

function renderHistory(text) {
  const el = document.getElementById('history');
  if (!el) return;
  el.innerHTML = '';
  const h2 = document.createElement('h2');
  h2.textContent = 'Our History';
  el.appendChild(h2);

  const p = document.createElement('p');
  p.textContent = text;
  p.style.background = 'rgba(142,64,142,0.15)';
  p.style.padding = '18px';
  p.style.borderLeft = '8px solid rgba(142,64,142,0.35)';
  el.appendChild(p);
}

function renderTeam(list) {
  const el = document.getElementById('team');
  if (!el) return;
  el.innerHTML = '';
  const h2 = document.createElement('h2');
  h2.textContent = 'Our Team';
  el.appendChild(h2);

  list.forEach(member => {
    const item = document.createElement('div');
    item.style.display = 'flex';
    item.style.alignItems = 'center';
    item.style.marginBottom = '14px';

    const img = document.createElement('img');
    img.src = member.avatar || 'assets/avatar1.png';
    img.alt = member.name;
    img.style.width = '44px';
    img.style.height = '44px';
    img.style.marginRight = '12px';
    item.appendChild(img);

    const meta = document.createElement('div');
    const name = document.createElement('div');
    name.textContent = member.name;
    name.style.fontWeight = '700';
    meta.appendChild(name);

    const role = document.createElement('div');
    role.textContent = member.role;
    meta.appendChild(role);

    item.appendChild(meta);
    el.appendChild(item);
  });
}

async function renderAboutFromRaw() {
  if (!aboutRaw) return;
  const data = (typeof window.translateData === 'function' && translations)
    ? window.translateData(aboutRaw, window.currentLang, translations)
    : aboutRaw;

  renderHero(data.hero || {});
  renderHistory(data.history || '');
  renderTeam(data.team || []);
}

async function initAbout() {
  try {
    try {
      translations = await loadJSON('json/translations.json');
    } catch (e) {
      translations = window.TRANSLATIONS || null;
    }

    aboutRaw = await loadJSON('json/about.json');
    footerRaw = await loadJSON('json/footer.json');

    await renderAboutFromRaw();

    // reuse the footer renderer used by main.js if available
    if (typeof renderFooter === 'function') {
      renderFooter((typeof window.translateData === 'function' && translations)
        ? window.translateData(footerRaw, window.currentLang, translations)
        : footerRaw);
    } else {
      // basic footer fallback
      const footer = document.getElementById('site-footer');
      if (footer) footer.textContent = footerRaw.copyright || '';
    }

    document.addEventListener('languageChanged', async (ev) => {
      const lang = ev && ev.detail && ev.detail.lang ? ev.detail.lang : window.currentLang;
      window.currentLang = lang;
      await renderAboutFromRaw();
      if (typeof renderFooter === 'function') {
        renderFooter((typeof window.translateData === 'function' && translations)
          ? window.translateData(footerRaw, lang, translations)
          : footerRaw);
      }
    });
  } catch (err) {
    console.error(err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initAbout();
});
