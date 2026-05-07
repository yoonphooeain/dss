const loginForm = document.getElementById("login-form");
const AUTH_KEY = "phonedssAuthenticated";
const USER_KEY = "phonedssUser";

if (sessionStorage.getItem(AUTH_KEY) === "true" && localStorage.getItem(USER_KEY)) {
  window.location.href = "dashboard.html?v=flow19";
}

if (loginForm) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = document.getElementById("email")?.value.trim() || "guest@phonedss.com";
    const remember = document.getElementById("remember_me")?.checked || false;
    const nameFromEmail = email.split("@")[0].replace(/[._-]/g, " ");
    const displayName = nameFromEmail.replace(/\b\w/g, (char) => char.toUpperCase()) || "Guest User";

    localStorage.setItem(
      USER_KEY,
      JSON.stringify({
        email,
        remember,
        name: displayName,
      })
    );

    sessionStorage.setItem(AUTH_KEY, "true");
    window.location.href = "dashboard.html?v=flow19";
  });
}
