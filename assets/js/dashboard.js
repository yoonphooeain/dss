const dashboardUserName = document.getElementById("dashboard-user-name");
const dashboardUserEmail = document.getElementById("dashboard-user-email");
const dashboardSavedCount = document.getElementById("dashboard-saved-count");
const dashboardProgressRing = document.getElementById("dashboard-progress-ring");
const dashboardProgressMetaOne = document.getElementById("dashboard-progress-meta-one");
const dashboardProgressMetaTwo = document.getElementById("dashboard-progress-meta-two");
const dashboardLatestWinner = document.getElementById("dashboard-latest-winner");
const dashboardLatestScore = document.getElementById("dashboard-latest-score");
const dashboardLatestRunnerup = document.getElementById("dashboard-latest-runnerup");
const dashboardLatestReason = document.getElementById("dashboard-latest-reason");
const USER_KEY = "phonedssUser";
const AUTH_KEY = "phonedssAuthenticated";
const RESULTS_KEY = "dssResults";
const LOGIN_URL = "login.html?v=flow19";
const savedUserRaw = localStorage.getItem(USER_KEY);

if (!savedUserRaw || sessionStorage.getItem(AUTH_KEY) !== "true") {
  window.location.href = LOGIN_URL;
}

try {
  const savedUser = JSON.parse(savedUserRaw);
  const normalizedName = (savedUser?.name || "Yoonphooeain").replace(/76\b/g, "").trim();
  const normalizedEmail = (savedUser?.email || "yoonphooeain@gmail.com")
    .replace("yoonphooeain76@", "yoonphooeain@")
    .trim();

  if (dashboardUserName) {
    dashboardUserName.textContent = normalizedName || "Yoonphooeain";
  }

  if (dashboardUserEmail) {
    dashboardUserEmail.textContent = normalizedEmail || "yoonphooeain@gmail.com";
  }
} catch (error) {
  window.location.href = LOGIN_URL;
}

try {
  const savedResults = JSON.parse(localStorage.getItem(RESULTS_KEY) || "null");
  const hasResults = Boolean(savedResults?.winner);
  const contribution = savedResults?.winner?.contributions?.[0]?.label || "No explanation yet";

  if (dashboardSavedCount) {
    dashboardSavedCount.textContent = hasResults ? "1" : "0";
  }

  if (dashboardProgressRing) {
    dashboardProgressRing.textContent = hasResults ? "Ready" : "Pending";
  }

  if (dashboardProgressMetaOne) {
    dashboardProgressMetaOne.textContent = hasResults ? "Latest run saved" : "No run yet";
  }

  if (dashboardProgressMetaTwo) {
    dashboardProgressMetaTwo.textContent = hasResults ? "Charts synced" : "Run evaluation";
  }

  if (dashboardLatestWinner) {
    dashboardLatestWinner.textContent = hasResults ? savedResults.winner.model : "No result yet";
  }

  if (dashboardLatestScore) {
    dashboardLatestScore.textContent = hasResults ? savedResults.winner.score.toFixed(2) : "Run DSS first";
  }

  if (dashboardLatestRunnerup) {
    dashboardLatestRunnerup.textContent = hasResults ? (savedResults.ranking?.[1]?.model || "No runner-up") : "Waiting";
  }

  if (dashboardLatestReason) {
    dashboardLatestReason.textContent = hasResults ? contribution : "No explanation yet";
  }
} catch (error) {
  // Keep the dashboard fallback copy if results cannot be parsed.
}

document.getElementById("dashboard-logout-btn")?.addEventListener("click", () => {
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(AUTH_KEY);
  window.location.href = "index.html";
});
