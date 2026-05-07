const USER_KEY = "phonedssUser";
const AUTH_KEY = "phonedssAuthenticated";
const LOGIN_URL = "login.html?v=flow19";
const DASHBOARD_URL = "dashboard.html?v=flow19";
const ADMIN_PROFILE_URL = "admin-profile.html?v=flow19";
const EVALUATION_URL = "dss.html";
const RECOMMENDATION_URL = "results.html";

const homeSidebarUser = document.getElementById("home-sidebar-user");
const homeTopActions = document.getElementById("home-top-actions");
const homePrimaryGate = document.getElementById("home-primary-gate");
const homeDashboardLink = document.getElementById("home-dashboard-link");
const homeEvaluationLink = document.getElementById("home-evaluation-link");
const homeRecommendationLink = document.getElementById("home-recommendation-link");
const homeDssLink = document.getElementById("home-dss-link");

function isAuthenticated() {
  return sessionStorage.getItem(AUTH_KEY) === "true";
}

function clearUserSession() {
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(AUTH_KEY);
  window.location.reload();
}

function setHref(link, loggedInUrl) {
  if (!link) return;
  link.href = isAuthenticated() ? loggedInUrl : LOGIN_URL;
}

function normalizeName(name) {
  return (name || "Yoonphooeain").replace(/76\b/g, "").trim() || "Yoonphooeain";
}

try {
  const savedUser = JSON.parse(localStorage.getItem(USER_KEY));
  const loggedIn = Boolean(savedUser?.name) && isAuthenticated();

  if (homeSidebarUser && !loggedIn) {
    homeSidebarUser.innerHTML = "";
  }

  setHref(homePrimaryGate, DASHBOARD_URL);
  setHref(homeDashboardLink, DASHBOARD_URL);
  setHref(homeEvaluationLink, EVALUATION_URL);
  setHref(homeRecommendationLink, RECOMMENDATION_URL);
  setHref(homeDssLink, EVALUATION_URL);

  if (homePrimaryGate) {
    homePrimaryGate.textContent = loggedIn ? "Open Dashboard" : "Login to Dashboard";
  }

  if (loggedIn) {
    const displayName = normalizeName(savedUser.name);
    const displayEmail = (savedUser.email || "Signed in user").replace("yoonphooeain76@", "yoonphooeain@");

    if (homeSidebarUser) {
      homeSidebarUser.innerHTML = `
        <div class="home-user-card">
          <div>
            <strong>${displayName}</strong>
            <span>${displayEmail}</span>
          </div>
        </div>
        <a href="${DASHBOARD_URL}" class="home-bottom-link">Dashboard</a>
        <a href="${ADMIN_PROFILE_URL}" class="home-bottom-link">Admin Profile</a>
        <button id="home-logout-btn" class="home-bottom-link home-logout-btn" type="button">Logout</button>
      `;
    }

    if (homeTopActions) {
      homeTopActions.innerHTML = `
        <span class="home-icon-dot"></span>
        <a href="${DASHBOARD_URL}" class="home-bottom-link" style="min-height:52px;">Dashboard</a>
        <span class="home-user-card" style="min-height:52px;padding:0 14px;border-radius:999px;">
          <strong style="font-size:0.95rem;">${displayName}</strong>
        </span>
      `;
    }

    document.getElementById("home-logout-btn")?.addEventListener("click", clearUserSession);
  }
} catch (error) {
  setHref(homePrimaryGate, DASHBOARD_URL);
  setHref(homeDashboardLink, DASHBOARD_URL);
  setHref(homeEvaluationLink, EVALUATION_URL);
  setHref(homeRecommendationLink, RECOMMENDATION_URL);
  setHref(homeDssLink, EVALUATION_URL);
}
