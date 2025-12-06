(function() {
  console.log('>>> main.js loading <<<');

  var homepageData = null;
  var footerData = null;
  var translationsData = null;

  function loadJSON(path) {
    console.log('Fetching:', path);
    return fetch(path)
      .then(function(response) {
        console.log('Response for', path, ':', response.status);
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })
      .then(function(data) {
        console.log('Parsed data from', path, ':', data);
        return data;
      })
      .catch(function(error) {
        console.error('Error loading', path, ':', error);
        throw error;
      });
  }

  function createHero(hero) {
    var container = document.createElement('div');
    container.className = 'hero-inner';

    var textDiv = document.createElement('div');
    textDiv.className = 'hero-text';

    var h1 = document.createElement('h1');
    h1.textContent = hero.title || '';
    textDiv.appendChild(h1);

    var p = document.createElement('p');
    p.textContent = hero.subtitle || '';
    textDiv.appendChild(p);

    if (hero.button) {
      var a = document.createElement('a');
      a.className = 'hero-button';
      a.href = hero.button.href || '#';
      a.textContent = hero.button.text || 'Learn more';
      textDiv.appendChild(a);
    }

    container.appendChild(textDiv);

    if (hero.image) {
      var imgDiv = document.createElement('div');
      imgDiv.className = 'hero-image';
      var img = document.createElement('img');
      img.src = hero.image;
      img.alt = hero.title || 'Hero';
      imgDiv.appendChild(img);
      container.appendChild(imgDiv);
    }

    return container;
  }

  function createGoalCard(goal) {
    var card = document.createElement('article');
    card.className = 'goal-card';

    if (goal.image) {
      var img = document.createElement('img');
      img.src = goal.image;
      img.alt = goal.title || '';
      card.appendChild(img);
    }

    var body = document.createElement('div');
    body.className = 'goal-body';

    if (goal.category) {
      var cat = document.createElement('p');
      cat.className = 'goal-category';
      cat.textContent = goal.category;
      body.appendChild(cat);
    }

    var title = document.createElement('h3');
    title.textContent = goal.title || '';
    body.appendChild(title);

    if (goal.description) {
      var desc = document.createElement('p');
      desc.textContent = goal.description;
      body.appendChild(desc);
    }

    if (goal.link) {
      var a = document.createElement('a');
      a.href = goal.link;
      a.textContent = 'Read more';
      body.appendChild(a);
    }

    card.appendChild(body);
    return card;
  }

  function render() {
    console.log('>>> RENDER CALLED <<<');
    console.log('homepageData:', homepageData);

    if (!homepageData) {
      console.error('No homepage data to render!');
      return;
    }

    var data = homepageData;
    if (window.translateData && translationsData && window.currentLang) {
      console.log('Translating to:', window.currentLang);
      data = window.translateData(homepageData, window.currentLang, translationsData);
    }

    var heroEl = document.getElementById('hero');
    console.log('Hero element:', heroEl);
    if (heroEl && data.hero) {
      heroEl.innerHTML = '';
      heroEl.appendChild(createHero(data.hero));
      console.log('✓ Hero rendered');
    }

    var goalsEl = document.getElementById('goals-container');
    console.log('Goals container:', goalsEl);
    console.log('Goals data:', data.goals);
    if (goalsEl && data.goals) {
      goalsEl.innerHTML = '';
      for (var i = 0; i < data.goals.length; i++) {
        goalsEl.appendChild(createGoalCard(data.goals[i]));
      }
      console.log('✓ Rendered', data.goals.length, 'goals');
    }

    if (footerData) {
      var footerEl = document.getElementById('site-footer');
      if (footerEl) {
        footerEl.innerHTML = '';

        var wrapper = document.createElement('div');
        wrapper.className = 'footer-inner';

        var left = document.createElement('div');
        left.className = 'footer-left';

        var logo = document.createElement('img');
        logo.src = footerData.logo || 'assets/logo.png';
        logo.alt = 'logo';
        logo.className = 'footer-logo';
        left.appendChild(logo);

        var links = document.createElement('nav');
        links.className = 'footer-links';
        if (footerData.links) {
          for (var i = 0; i < footerData.links.length; i++) {
            var link = footerData.links[i];
            var a = document.createElement('a');
            a.href = link.href || '#';
            a.textContent = link.label || '';
            links.appendChild(a);
          }
        }
        left.appendChild(links);
        wrapper.appendChild(left);

        var right = document.createElement('div');
        right.className = 'footer-right';
        var copy = document.createElement('div');
        copy.textContent = footerData.copyright || '';
        right.appendChild(copy);
        wrapper.appendChild(right);

        footerEl.appendChild(wrapper);
        console.log('✓ Footer rendered');
      }
    }

    console.log('>>> RENDER COMPLETE <<<');
  }

  function init() {
    console.log('>>> INIT STARTED <<<');

    translationsData = window.TRANSLATIONS || null;
    console.log('Translations available:', !!translationsData);

    loadJSON('json/homepage.json')
      .then(function(data) {
        console.log('✓ Homepage JSON loaded');
        homepageData = data;
        return loadJSON('json/footer.json');
      })
      .then(function(data) {
        console.log('✓ Footer JSON loaded');
        footerData = data;
        console.log('About to render...');
        render();
      })
      .catch(function(error) {
        console.error('❌ INIT FAILED:', error);
        alert('Failed to load page data. Check console.');
      });

    document.addEventListener('languageChanged', function(ev) {
      console.log('Language changed:', ev.detail.lang);
      window.currentLang = ev.detail.lang;
      translationsData = window.TRANSLATIONS;
      render();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      console.log('DOM ready, calling init');
      setTimeout(init, 150);
    });
  } else {
    console.log('DOM already ready, calling init');
    setTimeout(init, 150);
  }

})();
