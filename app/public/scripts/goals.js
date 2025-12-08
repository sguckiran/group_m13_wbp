(function() {
  var goalsData = null;
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
    var el = document.getElementById('goals-hero');
    if (!el) return;
    el.innerHTML = '';

    var wrap = document.createElement('div');
    wrap.className = 'goals-hero-inner';

    var img = document.createElement('img');
    img.className = 'goals-hero-img';
    img.src = hero.image || 'assets/logo.png';
    img.alt = hero.title || 'Our Goals';
    wrap.appendChild(img);

    var overlay = document.createElement('div');
    overlay.className = 'goals-hero-overlay';

    var title = document.createElement('h1');
    title.className = 'goals-hero-title';
    title.textContent = hero.title || 'Our Goals';
    overlay.appendChild(title);

    if (hero.subtitle) {
      var sub = document.createElement('p');
      sub.className = 'goals-hero-subtitle';
      sub.textContent = hero.subtitle;
      overlay.appendChild(sub);
    }

    wrap.appendChild(overlay);
    el.appendChild(wrap);
  }

  function renderIntro(text) {
    var el = document.getElementById('goals-intro');
    if (!el) return;
    el.innerHTML = '';

    var p = document.createElement('p');
    p.className = 'goals-intro-text';
    p.textContent = text;
    el.appendChild(p);
  }

  function renderGoalsList(goals) {
    var el = document.getElementById('goals-list');
    if (!el) return;
    el.innerHTML = '';

    for (var i = 0; i < goals.length; i++) {
      var goal = goals[i];
      var item = document.createElement('div');
      item.className = 'goal-item';

      var header = document.createElement('div');
      header.className = 'goal-header';

      if (goal.icon) {
        var icon = document.createElement('img');
        icon.className = 'goal-icon';
        icon.src = goal.icon;
        icon.alt = goal.title || '';
        header.appendChild(icon);
      }

      var titleEl = document.createElement('h3');
      titleEl.className = 'goal-title';
      titleEl.textContent = goal.title || '';
      header.appendChild(titleEl);

      item.appendChild(header);

      if (goal.description) {
        var desc = document.createElement('p');
        desc.className = 'goal-description';
        desc.textContent = goal.description;
        item.appendChild(desc);
      }

      if (goal.targets && goal.targets.length > 0) {
        var targetsDiv = document.createElement('div');
        targetsDiv.className = 'goal-targets';

        var targetsTitle = document.createElement('h4');
        targetsTitle.textContent = 'Key Targets:';
        targetsDiv.appendChild(targetsTitle);

        var ul = document.createElement('ul');
        for (var j = 0; j < goal.targets.length; j++) {
          var li = document.createElement('li');
          li.textContent = goal.targets[j];
          ul.appendChild(li);
        }
        targetsDiv.appendChild(ul);
        item.appendChild(targetsDiv);
      }

      el.appendChild(item);
    }
  }

  function render() {
    if (!goalsData) return;

    var data = goalsData;
    if (window.translateData && translationsData && window.currentLang) {
      data = window.translateData(goalsData, window.currentLang, translationsData);
    }

    renderHero(data.hero || {});
    renderIntro(data.intro || '');
    renderGoalsList(data.goals || []);

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

    loadJSON('json/goals.json')
      .then(function(data) {
        goalsData = data;
        return loadJSON('json/footer.json');
      })
      .then(function(data) {
        footerData = data;
        render();
      })
      .catch(function(error) {
        alert('Failed to load goals page data.');
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
