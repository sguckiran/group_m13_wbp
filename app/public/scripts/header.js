async function loadJSON(path) {
  const res = await fetch(path);
  return res.json();
}

let headerRaw = null;
let translations = null;
window.currentLang = 'English';

function buildHeader(data) {
  const header = document.getElementById('site-header');
  header.innerHTML = '';

  const fig = document.createElement('figure');
  fig.className = 'logo';
  const img = document.createElement('img');
  img.src = data.logo || 'assets/logo.png';
  img.alt = 'logo';
  img.width = 100;
  img.height = 100;
  fig.appendChild(img);
  header.appendChild(fig);

  const langUl = document.createElement('ul');
  langUl.className = 'language';
  (data.languages || []).forEach((l, idx) => {
    const li = document.createElement('li');
    li.textContent = l;
    li.dataset.lang = l;
    if (l === window.currentLang) li.classList.add('active');
    langUl.appendChild(li);
  });
  header.appendChild(langUl);

  langUl.addEventListener('click', (ev) => {
    const li = ev.target.closest('li');
    if (!li) return;

    header.querySelector('.language li.active').classList.remove('active');
    li.classList.add('active');

    window.currentLang = li.dataset.lang;
    document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: window.currentLang } }));
  });

  const navUl = document.createElement('ul');
  navUl.className = 'navigation';
  (data.nav || []).forEach((item) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = item.href || '#';
    a.textContent = item.label;
    li.appendChild(a);
    navUl.appendChild(li);
  });

  if (data.button) {
    const btn = document.createElement('button');
    btn.className = 'header-cta';
    btn.textContent = data.button.label || 'Sign Up';
    btn.onclick = () => window.location.href = data.button.href || '#';
    navUl.appendChild(btn);
  }

  header.appendChild(navUl);
}

document.addEventListener('DOMContentLoaded', async () => {
  translations = await loadJSON('json/translations.json').catch(() => null);
  window.TRANSLATIONS = translations;

  headerRaw = await loadJSON('json/header.json');
  const data = window.translateData ? window.translateData(headerRaw, window.currentLang, translations) : headerRaw;
  buildHeader(data);

  document.addEventListener('languageChanged', (ev) => {
    const data = window.translateData ? window.translateData(headerRaw, ev.detail.lang, translations) : headerRaw;
    buildHeader(data);
  });
});