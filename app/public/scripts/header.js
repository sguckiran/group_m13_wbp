// header.js - render header from json and handle language toggling

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
}

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
    if (idx === 0) li.classList.add('active');
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
    });
  });
}

// initialize header on DOM ready
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const data = await loadJSON('json/header.json');
    buildHeader(data);
  } catch (err) {
    console.warn('Could not load header.json, header will not be dynamic.', err);
  }
});