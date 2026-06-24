const THEME_KEY = "phonedssTheme";

function getThemeButtonMarkup(theme) {
  const isLight = theme === "light";
  return `
    <span class="theme-toggle-icon" aria-hidden="true">${isLight ? "🌙" : "☀"}</span>
    <span class="theme-toggle-copy">${isLight ? "Dark Mode" : "Light Mode"}</span>
  `;
}

function getStoredTheme() {
  return localStorage.getItem(THEME_KEY) || "dark";
}

function applyTheme(theme) {
  document.body.classList.toggle("theme-light", theme === "light");
  const themeButtons = document.querySelectorAll("[data-theme-toggle]");
  themeButtons.forEach((button) => {
    button.innerHTML = getThemeButtonMarkup(theme);
    button.setAttribute("aria-label", theme === "light" ? "Switch to dark mode" : "Switch to light mode");
  });
}

function toggleTheme() {
  const nextTheme = getStoredTheme() === "light" ? "dark" : "light";
  localStorage.setItem(THEME_KEY, nextTheme);
  applyTheme(nextTheme);
}

document.addEventListener("DOMContentLoaded", () => {
  applyTheme(getStoredTheme());
  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.addEventListener("click", toggleTheme);
  });
});
