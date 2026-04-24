const dashboardUserName = document.getElementById("dashboard-user-name");
const dashboardUserEmail = document.getElementById("dashboard-user-email");
const USER_KEY = "phonedssUser";
const AUTH_KEY = "phonedssAuthenticated";
const LOGIN_URL = "login.html?v=flow13";
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

document.getElementById("dashboard-logout-btn")?.addEventListener("click", () => {
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(AUTH_KEY);
  window.location.href = "index.html";
});
