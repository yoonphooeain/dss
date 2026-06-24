const SIDEBAR_USER_KEY = "phonedssUser";
const SIDEBAR_AUTH_KEY = "phonedssAuthenticated";
const SIDEBAR_LOGIN_URL = "login.html?v=flow24";
const SIDEBAR_PROFILE_URL = "admin-profile.html?v=flow24";
const SIDEBAR_STATE_KEY = "phonedssSidebarCollapsed";
const SIDEBAR_ICON_MAP = {
  dashboard: "◉",
  products: "⌘",
  dss: "⚙",
  results: "★",
  analytics: "◔",
  profile: "☻",
  home: "⌂",
  logout: "↗",
};

function normalizeSidebarName(name) {
  return (name || "Yoonphooeain").replace(/76\b/g, "").trim() || "Yoonphooeain";
}

function normalizeSidebarEmail(email) {
  return (email || "yoonphooeain@gmail.com").replace("yoonphooeain76@", "yoonphooeain@").trim();
}

function getSidebarUser() {
  try {
    return JSON.parse(localStorage.getItem(SIDEBAR_USER_KEY) || "null");
  } catch {
    return null;
  }
}

function getCurrentPageKey() {
  const page = window.location.pathname.split("/").pop() || "index.html";
  const pageMap = {
    "dashboard.html": "dashboard",
    "products.html": "products",
    "dss.html": "dss",
    "results.html": "results",
    "analytics.html": "analytics",
    "admin-profile.html": "profile",
  };

  return pageMap[page] || "";
}

function hydrateSidebarProfile() {
  const savedUser = getSidebarUser();
  const userName = normalizeSidebarName(savedUser?.name);
  const userEmail = normalizeSidebarEmail(savedUser?.email);
  const isAuthenticated = sessionStorage.getItem(SIDEBAR_AUTH_KEY) === "true";

  document.querySelectorAll("[data-dashboard-user-name]").forEach((node) => {
    node.textContent = userName;
  });

  document.querySelectorAll("[data-dashboard-user-email]").forEach((node) => {
    node.textContent = userEmail;
  });

  document.querySelectorAll("[data-dashboard-profile-link]").forEach((node) => {
    node.setAttribute("href", isAuthenticated ? SIDEBAR_PROFILE_URL : SIDEBAR_LOGIN_URL);
  });
}

function markActiveSidebarLink() {
  const activePage = getCurrentPageKey();
  document.querySelectorAll("[data-dashboard-nav]").forEach((node) => {
    node.classList.toggle("active", node.getAttribute("data-dashboard-nav") === activePage);
  });
}

function decorateSidebarLinks() {
  document.querySelectorAll(".dashboard-menu a").forEach((node) => {
    if (node.querySelector(".dashboard-link-icon")) return;

    const navKey = node.getAttribute("data-dashboard-nav");
    const linkText = (node.textContent || "").trim().toLowerCase();
    let iconKey = navKey || "";

    if (!iconKey) {
      if (linkText.includes("back home")) iconKey = "home";
      if (linkText.includes("logout")) iconKey = "logout";
    }

    const icon = SIDEBAR_ICON_MAP[iconKey] || "•";
    const label = node.textContent || "";
    node.textContent = "";

    const iconSpan = document.createElement("span");
    iconSpan.className = "dashboard-link-icon";
    iconSpan.setAttribute("aria-hidden", "true");
    iconSpan.textContent = icon;

    const labelSpan = document.createElement("span");
    labelSpan.className = "dashboard-link-label";
    labelSpan.textContent = label.trim();

    node.appendChild(iconSpan);
    node.appendChild(labelSpan);
  });
}

function bindSidebarLogout() {
  document.querySelectorAll("[data-dashboard-logout]").forEach((node) => {
    node.addEventListener("click", (event) => {
      event.preventDefault();
      localStorage.removeItem(SIDEBAR_USER_KEY);
      sessionStorage.removeItem(SIDEBAR_AUTH_KEY);
      window.location.href = "index.html";
    });
  });
}

function createSidebarToggle() {
  if (!document.querySelector(".dashboard-shell") || document.querySelector("[data-dashboard-sidebar-toggle]")) {
    return null;
  }

  const button = document.createElement("button");
  button.type = "button";
  button.className = "dashboard-sidebar-toggle";
  button.setAttribute("data-dashboard-sidebar-toggle", "true");
  document.body.appendChild(button);
  return button;
}

function getStoredSidebarState() {
  const stored = localStorage.getItem(SIDEBAR_STATE_KEY);
  if (stored === null) {
    return window.innerWidth <= 1100;
  }
  return stored === "true";
}

function updateSidebarToggleLabel(button, collapsed) {
  if (!button) return;
  button.innerHTML = `
    <span class="dashboard-sidebar-toggle-icon" aria-hidden="true">${collapsed ? "☰" : "✕"}</span>
    <span class="dashboard-sidebar-toggle-copy">${collapsed ? "Menu" : "Close"}</span>
  `;
  button.setAttribute("aria-label", collapsed ? "Open sidebar menu" : "Close sidebar menu");
}

function applySidebarState(collapsed, button) {
  document.body.classList.toggle("sidebar-collapsed", collapsed);
  localStorage.setItem(SIDEBAR_STATE_KEY, String(collapsed));
  updateSidebarToggleLabel(button, collapsed);
}

function bindSidebarToggle() {
  const button = createSidebarToggle();
  if (!button) return;

  applySidebarState(getStoredSidebarState(), button);

  button.addEventListener("click", () => {
    applySidebarState(!document.body.classList.contains("sidebar-collapsed"), button);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1100 && !localStorage.getItem(SIDEBAR_STATE_KEY)) {
      applySidebarState(false, button);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  hydrateSidebarProfile();
  decorateSidebarLinks();
  markActiveSidebarLink();
  bindSidebarLogout();
  bindSidebarToggle();
});
