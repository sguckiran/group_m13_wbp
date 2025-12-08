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

  const hamburger = document.createElement('button');
  hamburger.className = 'hamburger';
  hamburger.setAttribute('aria-label', 'Menu');
  hamburger.innerHTML = '<span></span><span></span><span></span>';
  header.appendChild(hamburger);

  const overlay = document.createElement('div');
  overlay.className = 'menu-overlay';
  document.body.appendChild(overlay);

  const mobileMenu = document.createElement('div');
  mobileMenu.className = 'mobile-menu';

  const mobileNavUl = document.createElement('ul');
  mobileNavUl.className = 'navigation';
  (data.nav || []).forEach((item) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = item.href || '#';
    a.textContent = item.label;
    li.appendChild(a);
    mobileNavUl.appendChild(li);
  });
  mobileMenu.appendChild(mobileNavUl);

  const desktopLangSection = document.createElement('div');
  desktopLangSection.className = 'language-section';
  const desktopLangTitle = document.createElement('h3');
  desktopLangTitle.textContent = 'Language';
  desktopLangSection.appendChild(desktopLangTitle);

  const desktopLangUl = document.createElement('ul');
  desktopLangUl.className = 'language';
  (data.languages || []).forEach((l) => {
    const li = document.createElement('li');
    li.textContent = l;
    li.dataset.lang = l;
    if (l === window.currentLang) li.classList.add('active');
    desktopLangUl.appendChild(li);
  });
  desktopLangSection.appendChild(desktopLangUl);
  header.appendChild(desktopLangSection);

  const desktopNavUl = document.createElement('ul');
  desktopNavUl.className = 'navigation';
  (data.nav || []).forEach((item) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = item.href || '#';
    a.textContent = item.label;
    li.appendChild(a);
    desktopNavUl.appendChild(li);
  });
  header.appendChild(desktopNavUl);

  if (data.button) {
    const desktopBtn = document.createElement('button');
    desktopBtn.className = 'header-cta';
    desktopBtn.textContent = data.button.label || 'Sign Up';
    desktopBtn.onclick = () => window.location.href = data.button.href || '#';
    header.appendChild(desktopBtn);
  }

  const mobileLangSection = document.createElement('div');
  mobileLangSection.className = 'language-section';
  const mobileLangTitle = document.createElement('h3');
  mobileLangTitle.textContent = 'Language';
  mobileLangSection.appendChild(mobileLangTitle);

  const mobileLangUl = document.createElement('ul');
  mobileLangUl.className = 'language';
  (data.languages || []).forEach((l) => {
    const li = document.createElement('li');
    li.textContent = l;
    li.dataset.lang = l;
    if (l === window.currentLang) li.classList.add('active');
    mobileLangUl.appendChild(li);
  });
  mobileLangSection.appendChild(mobileLangUl);
  mobileMenu.appendChild(mobileLangSection);

  if (data.button) {
    const mobileBtn = document.createElement('button');
    mobileBtn.className = 'header-cta';
    mobileBtn.textContent = data.button.label || 'Sign Up';
    mobileBtn.onclick = () => window.location.href = data.button.href || '#';
    mobileMenu.appendChild(mobileBtn);
  }

  header.appendChild(mobileMenu);

  const handleLanguageChange = (ev) => {
    const li = ev.target.closest('li');
    if (!li) return;

    document.querySelectorAll('.language li.active').forEach(el => el.classList.remove('active'));
    mobileLangUl.querySelector(`li[data-lang="${li.dataset.lang}"]`).classList.add('active');
    desktopLangUl.querySelector(`li[data-lang="${li.dataset.lang}"]`).classList.add('active');

    window.currentLang = li.dataset.lang;
    document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: window.currentLang } }));

    if (window.innerWidth < 1024) {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  mobileLangUl.addEventListener('click', handleLanguageChange);
  desktopLangUl.addEventListener('click', handleLanguageChange);

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
  });

  overlay.addEventListener('click', () => {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  });

  mobileNavUl.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 1024) {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });
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