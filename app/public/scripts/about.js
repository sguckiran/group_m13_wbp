function() {
  var aboutData = null;
  var footerData = null;
  var translationsData = null;

  function loadJSON(path) {
    return fetch(path)
      .then(function(response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      });
  }

  function renderHero(hero) {
    var el = document.getElementById('about-hero');
    if (!el) return;
    el.innerHTML = '';

    var wrap = document.createElement('div');
    wrap.className = 'about-hero-inner';

    var img = document.createElement('img');
    img.className = 'about-hero-img';
    img.src = hero.image || 'assets/logo.png';
    img.alt = hero.title || 'About';
    wrap.appendChild(img);

    var overlay = document.createElement('div');
    overlay.className = 'about-hero-overlay';

    var title = document.createElement('h1');
    title.className = 'about-hero-title';
    title.textContent = hero.title || 'About Us';
    overlay.appendChild(title);

    if (hero.subtitle) {
      var sub = document.createElement('p');
      sub.className = 'about-hero-subtitle';
      sub.textContent = hero.subtitle;
      overlay.appendChild(sub);
    }

    wrap.appendChild(overlay);
    el.appendChild(wrap);
  }

  function renderHistory(text) {
    var el = document.getElementById('history');
    if (!el) return;
    el.innerHTML = '';

    var h2 = document.createElement('h2');
    h2.textContent = 'Our History';
    el.appendChild(h2);

    var p = document.createElement('p');
    p.className = 'about-history-text';
    p.textContent = text;
    el.appendChild(p);
  }

  function renderTeam(list) {
    var el = document.getElementById('team');
    if (!el) return;
    el.innerHTML = '';

    var h2 = document.createElement('h2');
    h2.textContent = 'Our Team';
    el.appendChild(h2);

    var container = document.createElement('div');
    container.className = 'team-container';

    for (var i = 0; i < list.length; i++) {
      var member = list[i];
      var card = document.createElement('div');
      card.className = 'team-card';

      var img = document.createElement('img');
      img.className = 'team-avatar';
      img.src = member.avatar || 'assets/logo.png';
      img.alt = member.name || '';
      card.appendChild(img);

      var name = document.createElement('div');
      name.className = 'team-name';
      name.textContent = member.name || '';
      card.appendChild(name);

      var role = document.createElement('div');
      role.className = 'team-role';
      role.textContent = member.role || '';
      card.appendChild(role);

      container.appendChild(card);
    }

    el.appendChild(container);
  }

  function render() {
    if (!aboutData) return;

    var data = aboutData;
    if (window.translateData && translationsData && window.currentLang) {
      data = window.translateData(aboutData, window.currentLang, translationsData);
    }

    renderHero(data.hero || {});
    renderHistory(data.history || '');
    renderTeam(data.team || []);

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
      }
    }
  }

  function init() {
    translationsData = window.TRANSLATIONS || null;

    loadJSON('json/about.json')
      .then(function(data) {
        aboutData = data;
        return loadJSON('json/footer.json');
      })
      .then(function(data) {
        footerData = data;
        render();
      })
      .catch(function(error) {
        alert('Failed to load about page data.');
      });

    document.addEventListener('languageChanged', function(ev) {
      window.currentLang = ev.detail.lang;
      translationsData = window.TRANSLATIONS;
      render();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(init, 150);
    });
  } else {
    setTimeout(init, 150);
  }

})();
