const adminUserName = document.getElementById("admin-user-name");
const adminUserEmail = document.getElementById("admin-user-email");
const profileToolbarDate = document.getElementById("profile-toolbar-date");

const PROFILE_KEY = "phonedssProfile";
const USER_KEY = "phonedssUser";
const AUTH_KEY = "phonedssAuthenticated";
const LOGIN_URL = "login.html?v=flow13";

if (!localStorage.getItem(USER_KEY) || sessionStorage.getItem(AUTH_KEY) !== "true") {
  window.location.href = LOGIN_URL;
}

const fields = {
  firstName: {
    text: document.getElementById("profile-first-name"),
    input: document.getElementById("profile-first-name-input"),
    defaultValue: "Yoonphooeain",
  },
  lastName: {
    text: document.getElementById("profile-last-name"),
    input: document.getElementById("profile-last-name-input"),
    defaultValue: "",
  },
  dob: {
    text: document.getElementById("profile-dob"),
    input: document.getElementById("profile-dob-input"),
    defaultValue: "12-10-1990",
  },
  email: {
    text: document.getElementById("profile-email"),
    input: document.getElementById("profile-email-input"),
    defaultValue: "yoonphooeain@gmail.com",
  },
  phone: {
    text: document.getElementById("profile-phone"),
    input: document.getElementById("profile-phone-input"),
    defaultValue: "(+95) 09 123 456 789",
  },
  role: {
    text: document.getElementById("profile-role"),
    input: document.getElementById("profile-role-input"),
    defaultValue: "Admin",
  },
  country: {
    text: document.getElementById("profile-country"),
    input: document.getElementById("profile-country-input"),
    defaultValue: "Myanmar",
  },
  city: {
    text: document.getElementById("profile-city"),
    input: document.getElementById("profile-city-input"),
    defaultValue: "Yangon",
  },
  postal: {
    text: document.getElementById("profile-postal"),
    input: document.getElementById("profile-postal-input"),
    defaultValue: "11081",
  },
};

const personalKeys = ["firstName", "lastName", "dob", "email", "phone", "role"];
const addressKeys = ["country", "city", "postal"];

function formatToolbarDate() {
  const now = new Date();
  return now.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function getSavedUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY)) || {};
  } catch {
    return {};
  }
}

function getProfileData() {
  const savedUser = getSavedUser();
  const fallbackName = (savedUser.name || "Yoonphooeain").replace(/76\b/g, "").trim();
  const [firstPart, ...rest] = fallbackName.split(" ");

  let stored = {};
  try {
    stored = JSON.parse(localStorage.getItem(PROFILE_KEY)) || {};
  } catch {
    stored = {};
  }

  return {
    firstName: stored.firstName || firstPart || "Yoonphooeain",
    lastName: stored.lastName ?? rest.join(" "),
    dob: stored.dob || "12-10-1990",
    email: stored.email || (savedUser.email || "yoonphooeain@gmail.com").replace("yoonphooeain76@", "yoonphooeain@"),
    phone: stored.phone || "(+95) 09 123 456 789",
    role: stored.role || "Admin",
    country: stored.country || "Myanmar",
    city: stored.city || "Yangon",
    postal: stored.postal || "11081",
  };
}

function syncHeader(profile) {
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim() || "Yoonphooeain";
  if (adminUserName) adminUserName.textContent = fullName;
  if (adminUserEmail) adminUserEmail.textContent = profile.email;

  const savedUser = getSavedUser();
  localStorage.setItem(
    USER_KEY,
    JSON.stringify({
      ...savedUser,
      name: fullName,
      email: profile.email,
    })
  );
}

function renderProfile(profile) {
  Object.entries(fields).forEach(([key, refs]) => {
    const value = profile[key] ?? refs.defaultValue;
    if (refs.text) refs.text.textContent = value;
    if (refs.input) refs.input.value = value;
  });
  syncHeader(profile);
}

function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  renderProfile(profile);
}

function setEditMode(keys, editing) {
  keys.forEach((key) => {
    const refs = fields[key];
    if (!refs) return;
    refs.text.hidden = editing;
    refs.input.hidden = !editing;
  });
}

function attachEditor(config) {
  const editBtn = document.getElementById(config.editId);
  const saveBtn = document.getElementById(config.saveId);
  const cancelBtn = document.getElementById(config.cancelId);
  if (!editBtn || !saveBtn || !cancelBtn) return;

  editBtn.addEventListener("click", () => {
    setEditMode(config.keys, true);
    editBtn.hidden = true;
    saveBtn.hidden = false;
    cancelBtn.hidden = false;
  });

  cancelBtn.addEventListener("click", () => {
    const profile = getProfileData();
    renderProfile(profile);
    setEditMode(config.keys, false);
    editBtn.hidden = false;
    saveBtn.hidden = true;
    cancelBtn.hidden = true;
  });

  saveBtn.addEventListener("click", () => {
    const profile = getProfileData();
    config.keys.forEach((key) => {
      profile[key] = fields[key].input.value.trim() || fields[key].defaultValue;
    });
    saveProfile(profile);
    setEditMode(config.keys, false);
    editBtn.hidden = false;
    saveBtn.hidden = true;
    cancelBtn.hidden = true;
  });
}

if (profileToolbarDate) {
  profileToolbarDate.textContent = formatToolbarDate();
}

const profile = getProfileData();
renderProfile(profile);

attachEditor({
  editId: "profile-edit-personal-btn",
  saveId: "profile-save-personal-btn",
  cancelId: "profile-cancel-personal-btn",
  keys: personalKeys,
});

attachEditor({
  editId: "profile-edit-address-btn",
  saveId: "profile-save-address-btn",
  cancelId: "profile-cancel-address-btn",
  keys: addressKeys,
});
