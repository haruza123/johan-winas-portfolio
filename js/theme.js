/**
 * Theme system (Dark default + Light mode)
 * - Toggle button in navbar (☀️/🌙)
 * - Persists to localStorage
 * - Sets OC mode: dark -> ryou, light -> himori
 */

(function () {
  const STORAGE_KEY = "jwtl_theme";
  const THEMES = ["dark", "light"];

  function isValidTheme(value) {
    return THEMES.includes(value);
  }

  function getSavedTheme() {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return isValidTheme(value) ? value : "";
    } catch {
      return "";
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }

  function getOcForTheme(theme) {
    return theme === "light" ? "himori" : "ryou";
  }

  function applyTheme(theme) {
    const body = document.body;
    if (!body) return;
    body.dataset.theme = theme;
    body.dataset.oc = getOcForTheme(theme);
  }

  function getCurrentTheme() {
    const body = document.body;
    if (!body) return "dark";
    return isValidTheme(body.dataset.theme) ? body.dataset.theme : "dark";
  }

  function setToggleUi(button, theme) {
    if (!button) return;
    const isLight = theme === "light";
    // Use unicode escapes to avoid encoding issues on some editors/terminals.
    button.textContent = isLight ? "\u2600\uFE0F" : "\uD83C\uDF19";
    button.setAttribute(
      "aria-label",
      isLight ? "Ubah ke dark mode" : "Ubah ke light mode",
    );
    button.setAttribute("aria-pressed", isLight ? "true" : "false");
  }

  function initThemeToggle() {
    const button = document.getElementById("theme-toggle");
    if (!button) return;

    setToggleUi(button, getCurrentTheme());

    button.addEventListener("click", () => {
      const next = getCurrentTheme() === "light" ? "dark" : "light";
      applyTheme(next);
      saveTheme(next);
      setToggleUi(button, next);
      if (typeof applyHeroPersonality === "function") {
        applyHeroPersonality();
      }
    });
  }

  function init() {
    const saved = getSavedTheme();
    applyTheme(saved || "dark");
    initThemeToggle();
  }

  window.JWTLTheme = {
    init,
    applyTheme,
    getCurrentTheme,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

window.addEventListener("DOMContentLoaded", () => {
  const img = document.getElementById("loader-img");
  const theme = document.body.dataset.theme;
  if (typeof applyHeroPersonality === "function") {
    applyHeroPersonality();
  }

  if (!img) return;

  if (theme === "light") {
    img.src = "image/wm2.png";
  } else {
    img.src = "image/wm2_putih.png";
  }
});
