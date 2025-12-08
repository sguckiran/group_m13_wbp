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

  const logoLink = document.createElement('a');
  logoLink.href = 'index.html';
  logoLink.className = 'logo';
  const img = document.createElement('img');
  img.src = data.logo || 'assets/logo.png';
  img.alt = 'logo';
  img.width = 100;
  img.height = 100;
  logoLink.appendChild(img);
  header.appendChild(logoLink);

  const langUl = document.createElement('ul');
  langUl.className = 'language';
  (data.languages || []).forEach((l) => {
    const li = document.createElement('li');
    li.textContent = l;
    li.dataset.lang = l;
    if (l === window.currentLang) li.classList.add('active');
    langUl.appendChild(li);
  });
  header.appendChild(langUl);

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
  header.appendChild(navUl);

  if (data.button) {
    const btn = document.createElement('button');
    btn.className = 'header-cta';
    btn.textContent = data.button.label || 'Sign Up';
    btn.onclick = () => window.location.href = data.button.href || '#';
    header.appendChild(btn);
  }

  const hamburger = document.createElement('button');
  hamburger.className = 'hamburger';
  hamburger.innerHTML = '<span></span><span></span><span></span>';
  header.appendChild(hamburger);

  const mobileMenu = document.createElement('div');
  mobileMenu.className = 'mobile-menu';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'mobile-close';
  closeBtn.innerHTML = '&times;';
  mobileMenu.appendChild(closeBtn);

  const mobileNav = document.createElement('ul');
  mobileNav.className = 'mobile-nav';
  (data.nav || []).forEach((item) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = item.href || '#';
    a.textContent = item.label;
    li.appendChild(a);
    mobileNav.appendChild(li);
  });
  mobileMenu.appendChild(mobileNav);

  const mobileLang = document.createElement('div');
  mobileLang.className = 'mobile-lang';
  const langTitle = document.createElement('div');
  langTitle.className = 'mobile-lang-title';
  langTitle.textContent = 'Language';
  mobileLang.appendChild(langTitle);

  const mobileLangUl = document.createElement('ul');
  (data.languages || []).forEach((l) => {
    const li = document.createElement('li');
    li.textContent = l;
    li.dataset.lang = l;
    if (l === window.currentLang) li.classList.add('active');
    mobileLangUl.appendChild(li);
  });
  mobileLang.appendChild(mobileLangUl);
  mobileMenu.appendChild(mobileLang);

  if (data.button) {
    const mobileBtn = document.createElement('button');
    mobileBtn.className = 'mobile-cta';
    mobileBtn.textContent = data.button.label || 'Sign Up';
    mobileBtn.onclick = () => window.location.href = data.button.href || '#';
    mobileMenu.appendChild(mobileBtn);
  }

  document.body.appendChild(mobileMenu);

  const closeMenu = () => {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
  };

  langUl.addEventListener('click', (ev) => {
    const li = ev.target.closest('li');
    if (!li) return;
    document.querySelectorAll('.language li.active').forEach(el => el.classList.remove('active'));
    li.classList.add('active');
    window.currentLang = li.dataset.lang;
    document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: window.currentLang } }));
  });

  mobileLangUl.addEventListener('click', (ev) => {
    const li = ev.target.closest('li');
    if (!li) return;
    document.querySelectorAll('.language li.active, .mobile-lang li.active').forEach(el => el.classList.remove('active'));
    langUl.querySelector(`li[data-lang="${li.dataset.lang}"]`).classList.add('active');
    li.classList.add('active');
    window.currentLang = li.dataset.lang;
    document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: window.currentLang } }));
    closeMenu();
  });

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
  });

  closeBtn.addEventListener('click', closeMenu);

  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  translations = await loadJSON('json/translations.json').catch(() => null);
  window.TRANSLATIONS = translations;

  headerRaw = await loadJSON('json/header.json');
  const data = window.translateData ? window.translateData(headerRaw, window.currentLang, translations) : headerRaw;
  buildHeader(data);

  document.addEventListener('languageChanged', (ev) => {
    const oldMenu = document.querySelector('.mobile-menu');
    if (oldMenu) oldMenu.remove();
    const data = window.translateData ? window.translateData(headerRaw, ev.detail.lang, translations) : headerRaw;
    buildHeader(data);
  });
});