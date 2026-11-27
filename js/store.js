(function (PP) {
  const STORAGE_KEY = 'thaco_thanhhoa_portal_v2';
  const THEME_KEY = 'thaco_thanhhoa_theme_v1';

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function loadData() {
    const def = PP.DEFAULT_DATA;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return clone(def);
      const parsed = JSON.parse(raw);
      return {
        meta: { ...clone(def.meta), ...(parsed.meta || {}) },
        advisories: Array.isArray(parsed.advisories) ? parsed.advisories : clone(def.advisories),
        plans: Array.isArray(parsed.plans) ? parsed.plans : clone(def.plans),
        sops: Array.isArray(parsed.sops) ? parsed.sops : clone(def.sops),
        org: parsed.org ? parsed.org : clone(def.org),
        digital: parsed.digital ? parsed.digital : clone(def.digital),
      };
    } catch {
      return clone(def);
    }
  }

  function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function resetData() {
    localStorage.removeItem(STORAGE_KEY);
    return clone(PP.DEFAULT_DATA);
  }

  function loadTheme() {
    return localStorage.getItem(THEME_KEY) || 'light';
  }

  function saveTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
  }

  PP.store = { loadData, saveData, resetData, loadTheme, saveTheme };
})((window.PP = window.PP || {}));
