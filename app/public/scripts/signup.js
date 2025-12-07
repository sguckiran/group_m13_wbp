(function() {
  console.log('>>> signup.js loading <<<');

  var signupData = null;
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

  function renderHero(hero) {
    var el = document.getElementById('signup-hero');
    if (!el) {
      console.error('signup-hero element not found!');
      return;
    }
    el.innerHTML = '';

    var wrap = document.createElement('div');
    wrap.className = 'signup-hero-inner';

    var img = document.createElement('img');
    img.className = 'signup-hero-img';
    img.src = hero.image || 'assets/logo.png';
    img.alt = hero.title || 'Sign Up';
    wrap.appendChild(img);

    var overlay = document.createElement('div');
    overlay.className = 'signup-hero-overlay';

    var title = document.createElement('h1');
    title.className = 'signup-hero-title';
    title.textContent = hero.title || 'Sign Up for Our Newsletter';
    overlay.appendChild(title);

    if (hero.subtitle) {
      var sub = document.createElement('p');
      sub.className = 'signup-hero-subtitle';
      sub.textContent = hero.subtitle;
      overlay.appendChild(sub);
    }

    wrap.appendChild(overlay);
    el.appendChild(wrap);
    console.log('✓ Hero rendered');
  }

  function validateEmail(email) {
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function validateField(fieldId, fieldName, isRequired) {
    var field = document.getElementById(fieldId);
    var errorSpan = document.getElementById(fieldId + '-error');
    var value = field.value.trim();

    if (isRequired && value === '') {
      field.classList.add('invalid');
      errorSpan.textContent = fieldName + ' is required';
      return false;
    }

    if (fieldId === 'email' && value !== '') {
      if (!validateEmail(value)) {
        field.classList.add('invalid');
        errorSpan.textContent = 'Please enter a valid email address';
        return false;
      }
    }

    if (fieldId === 'firstName' || fieldId === 'lastName') {
      if (value.length > 0 && value.length < 2) {
        field.classList.add('invalid');
        errorSpan.textContent = fieldName + ' must be at least 2 characters';
        return false;
      }
    }

    field.classList.remove('invalid');
    errorSpan.textContent = '';
    return true;
  }

  function clearErrors() {
    var fields = ['firstName', 'lastName', 'email', 'comments'];
    fields.forEach(function(fieldId) {
      var field = document.getElementById(fieldId);
      var errorSpan = document.getElementById(fieldId + '-error');
      if (field) field.classList.remove('invalid');
      if (errorSpan) errorSpan.textContent = '';
    });
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    console.log('Form submit triggered');

    clearErrors();

    var isValid = true;
    isValid = validateField('firstName', 'First name', true) && isValid;
    isValid = validateField('lastName', 'Last name', true) && isValid;
    isValid = validateField('email', 'Email', true) && isValid;
    isValid = validateField('comments', 'Comments', false) && isValid;

    if (!isValid) {
      console.log('Form validation failed');
      return;
    }

    var formData = {
      firstName: document.getElementById('firstName').value.trim(),
      lastName: document.getElementById('lastName').value.trim(),
      email: document.getElementById('email').value.trim(),
      comments: document.getElementById('comments').value.trim(),
      timestamp: new Date().toISOString()
    };

    console.log('Submitting form data:', formData);

    var submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    fetch('/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(function(response) {
      console.log('Server response status:', response.status);
      return response.json().then(function(data) {
        return { status: response.status, data: data };
      });
    })
    .then(function(result) {
      console.log('Server response:', result);

      var messageDiv = document.getElementById('form-message');
      var messageText = document.getElementById('message-text');

      if (result.status === 200 || result.status === 201) {
        messageDiv.className = 'form-message success';
        messageText.textContent = result.data.message || 'Thank you for signing up! You will receive our newsletter soon.';
        document.getElementById('signup-form').reset();
      } else {
        messageDiv.className = 'form-message error';
        messageText.textContent = result.data.message || 'An error occurred. Please try again.';
      }

      messageDiv.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign Up';

      setTimeout(function() {
        messageDiv.style.display = 'none';
      }, 10000);
    })
    .catch(function(error) {
      console.error('Form submission error:', error);

      var messageDiv = document.getElementById('form-message');
      var messageText = document.getElementById('message-text');

      messageDiv.className = 'form-message error';
      messageText.textContent = 'Failed to submit form. Please check your connection and try again.';
      messageDiv.style.display = 'block';

      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign Up';
    });
  }

  function renderFooter() {
    if (!footerData) return;

    var footerEl = document.getElementById('site-footer');
    if (!footerEl) return;

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

  function init() {
    console.log('>>> INIT STARTED <<<');

    translationsData = window.TRANSLATIONS || null;
    console.log('Translations available:', !!translationsData);

    loadJSON('json/signup.json')
      .then(function(data) {
        console.log('✓ Signup JSON loaded');
        signupData = data;

        var heroData = signupData.hero || {};
        if (window.translateData && translationsData && window.currentLang) {
          heroData = window.translateData(signupData.hero, window.currentLang, translationsData);
        }
        renderHero(heroData);

        return loadJSON('json/footer.json');
      })
      .then(function(data) {
        console.log('✓ Footer JSON loaded');
        footerData = data;
        renderFooter();
      })
      .catch(function(error) {
        console.error('❌ Init failed:', error);
      });

    var form = document.getElementById('signup-form');
    if (form) {
      form.addEventListener('submit', handleSubmit);
      console.log('✓ Form submit handler attached');

      var fields = ['firstName', 'lastName', 'email'];
      fields.forEach(function(fieldId) {
        var field = document.getElementById(fieldId);
        if (field) {
          field.addEventListener('blur', function() {
            var fieldName = fieldId === 'firstName' ? 'First name' :
                           fieldId === 'lastName' ? 'Last name' : 'Email';
            validateField(fieldId, fieldName, true);
          });
        }
      });
    }

    document.addEventListener('languageChanged', function(ev) {
      console.log('Language changed:', ev.detail.lang);
      window.currentLang = ev.detail.lang;
      translationsData = window.TRANSLATIONS;

      if (signupData && signupData.hero) {
        var heroData = window.translateData ?
          window.translateData(signupData.hero, window.currentLang, translationsData) :
          signupData.hero;
        renderHero(heroData);
      }
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
