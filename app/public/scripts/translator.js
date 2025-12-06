(function () {
  function translateString(str, lang, dict) {
    if (!str || typeof str !== 'string' || !dict || !lang) return str;
    const map = dict[lang];
    return (map && map[str]) ? map[str] : str;
  }

  function translateData(data, lang, dict) {
    if (!data || !dict || !lang) return data;
    if (typeof data === 'string') return translateString(data, lang, dict);
    if (Array.isArray(data)) return data.map(item => translateData(item, lang, dict));
    if (typeof data === 'object') {
      const out = {};
      Object.keys(data).forEach(k => {
        out[k] = translateData(data[k], lang, dict);
      });
      return out;
    }
    return data;
  }

  window.translateData = translateData;
  window.translateString = translateString;
})();
