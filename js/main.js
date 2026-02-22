// frontend/js/main.js
import { toast } from "./ui.js";
import { login, signup, setToken, setUser } from "./api.js";


// ---------- MODAL HELPERS ----------
function openBackdrop(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("show");
}

function closeBackdrop(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("show");
}

// Make these functions available for inline onclick buttons
window.closeBackdrop = closeBackdrop;

window.openSignup = function () {
  closeBackdrop("loginBackdrop");
  openBackdrop("signupBackdrop");
};

window.openLogin = function () {
  closeBackdrop("signupBackdrop");
  openBackdrop("loginBackdrop");
};

// ---------- LOGIN ----------
window.loginSubmit = async function () {
  const email = document.getElementById("li_email").value.trim();
  const password = document.getElementById("li_password").value.trim();

  if (!email || !password) {
    toast("Please enter email and password", "danger");
    return;
  }

  try {
    const data = await login({ email, password });

    setToken(data.token);
    setUser(data.user);

    toast("Login successful ✅");
    closeBackdrop("loginBackdrop");

    // reload so navbar updates correctly on ALL pages
    setTimeout(() => window.location.reload(), 500);
  } catch (err) {
    toast(err.message, "danger");
  }
};

// ---------- SIGNUP ----------
window.signupSubmit = async function () {
  const name = document.getElementById("su_name").value.trim();
  const email = document.getElementById("su_email").value.trim();
  const password = document.getElementById("su_password").value.trim();

  if (!name || !email || !password) {
    toast("Please fill all fields", "danger");
    return;
  }

  try {
    const data = await signup({ name, email, password });

    toast(data.message || "Verification email sent. Check your inbox 📩");
    closeBackdrop("signupBackdrop");
    openBackdrop("loginBackdrop");
  } catch (err) {
    toast(err.message, "danger");
  }
};

// ---------- INIT ----------
(function init() {
  closeBackdrop("loginBackdrop");
  closeBackdrop("signupBackdrop");
})();
