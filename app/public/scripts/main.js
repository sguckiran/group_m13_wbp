// main.js - loads homepage and footer content from JSON and injects into the page

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
}

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
    a.textContent = hero.button.text || 'Learn more';
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
    a.textContent = 'Read more';
    body.appendChild(a);
  }

  card.appendChild(body);
  return card;
}

async function initHomepage() {
  try {
    const data = await loadJSON('json/homepage.json');

    const heroEl = document.getElementById('hero');
    heroEl.innerHTML = '';
    heroEl.appendChild(createHeroSection(data.hero || {}));

    const goalsContainer = document.getElementById('goals-container');
    goalsContainer.innerHTML = '';

    (data.goals || []).forEach(goal => {
      goalsContainer.appendChild(createGoalCard(goal));
    });

    // footer
    const footerData = await loadJSON('json/footer.json');
    renderFooter(footerData);
  } catch (err) {
    console.error(err);
  }
}

function renderFooter(data) {
  const footer = document.getElementById('site-footer');
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
