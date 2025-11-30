// Shared translator utilities
// Exposes window.translateData(data, lang, dict)
(function () {
  function isPlainObject(v) {
    return v && typeof v === 'object' && !Array.isArray(v);
  }

  function buildNormalizedMap(map) {
    const nm = Object.create(null);
    Object.keys(map).forEach(k => {
      try {
        const nk = String(k).toLowerCase().trim();
        if (nk) nm[nk] = map[k];
      } catch (e) {}
    });
    return nm;
  }

  function translateString(str, lang, dict) {
    if (!str || typeof str !== 'string') return str;
    if (!dict || !lang) return str;
    const map = dict[lang];
    if (!map) return str;
    // exact-match lookup; fallback to original
    if (Object.prototype.hasOwnProperty.call(map, str)) return map[str];

    // build or reuse normalized map for this language
    window.__translationNormalized = window.__translationNormalized || Object.create(null);
    if (!window.__translationNormalized[lang]) {
      window.__translationNormalized[lang] = buildNormalizedMap(map);
    }
    const norm = String(str).toLowerCase().trim();
    if (window.__translationNormalized[lang] && Object.prototype.hasOwnProperty.call(window.__translationNormalized[lang], norm)) {
      return window.__translationNormalized[lang][norm];
    }

    return str;
  }

  function translateData(data, lang, dict) {
    if (data == null) return data;
    if (typeof data === 'string') return translateString(data, lang, dict);
    if (Array.isArray(data)) return data.map(item => translateData(item, lang, dict));
    if (isPlainObject(data)) {
      const out = {};
      Object.keys(data).forEach(k => {
        out[k] = translateData(data[k], lang, dict);
      });
      return out;
    }
    // for numbers, booleans, functions, etc. return as-is
    return data;
  }

  // simple on-page diagnostic overlay
  try {
    (function createDiag() {
      if (window.__diagOverlayCreated) return;
      const o = document.createElement('div');
      o.id = '__diag_overlay';
      const style = o.style;
      style.position = 'fixed';
      style.right = '12px';
      style.bottom = '12px';
      style.maxWidth = '360px';
      style.maxHeight = '40vh';
      style.overflow = 'auto';
      style.background = 'rgba(0,0,0,0.6)';
      style.color = 'white';
      style.fontSize = '12px';
      style.lineHeight = '1.3';
      style.padding = '8px';
      style.borderRadius = '6px';
      style.zIndex = 99999;
      o.innerHTML = '<strong>Runtime log</strong><div id="__diag_lines" style="margin-top:6px"></div>';
      document.addEventListener('DOMContentLoaded', () => {
        document.body.appendChild(o);
      });
      window.__diagOverlayCreated = true;
    })();
  } catch (e) {
    // ignore if DOM not ready; other scripts can still call __diagLog
  }

  window.__diagLog = function (msg) {
    try {
      console.log('[diag]', msg);
      const el = document.getElementById('__diag_lines');
      const line = document.createElement('div');
      line.textContent = typeof msg === 'string' ? msg : JSON.stringify(msg);
      line.style.marginBottom = '6px';
      if (el) {
        el.insertBefore(line, el.firstChild);
      } else {
        // if overlay not yet attached, try to attach once DOM ready
        document.addEventListener('DOMContentLoaded', () => {
          const e2 = document.getElementById('__diag_lines');
          if (e2) e2.insertBefore(line, e2.firstChild);
        });
      }
    } catch (e) {
      // swallow
      console.log('[diag error]', e);
    }
  };

  // expose
  window.translateData = translateData;
})();
