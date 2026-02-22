import { apiFetch, setToken, setUser, getUser, logout } from "./api.js";

export function toast(msg, type = "normal") {
  const t = document.getElementById("toast");
  const m = document.getElementById("toastMsg");
  const icon = document.getElementById("toastIcon");

  if (!t || !m || !icon) return;

  m.textContent = msg;

  t.classList.remove("show", "danger");

  if (type === "danger") {
    t.classList.add("danger");
    icon.textContent = "✕";
  } else {
    icon.textContent = "✓";
  }

  t.classList.add("show");

  setTimeout(() => {
    t.classList.remove("show");
  }, 3000);
}


/* ---------------- MODAL ---------------- */
export function openModal(id) {
  document.getElementById(id)?.classList.add("show");
}

export function closeModal(id) {
  document.getElementById(id)?.classList.remove("show");
}

/* ---------------- AUTH UI ---------------- */
export function initAuthUI() {
  const authArea = document.getElementById("authArea");
  if (!authArea) return;

  const user = getUser();

  // Navbar buttons
  if (!user) {
    authArea.innerHTML = `
      <button class="btn btn-purple btn-sm" id="btnLoginNav">Login</button>
    `;

    document.getElementById("btnLoginNav").onclick = () =>
      openModal("loginBackdrop");
  } else {
    authArea.innerHTML = `
      <a class="btn btn-soft btn-sm" href="history.html">History</a>
      ${
        user.is_admin
          ? `<a class="btn btn-soft btn-sm" href="admin.html">Admin</a>`
          : ""
      }
      <button class="btn btn-soft btn-sm" id="btnLogoutNav">Logout</button>
    `;

    document.getElementById("btnLogoutNav").onclick = () => {
      logout();
      window.location.reload();
    };
  }

  // Close buttons
  document.querySelectorAll("[data-close]").forEach((btn) => {
    btn.addEventListener("click", () => closeModal(btn.dataset.close));
  });

  // Switch login -> signup
  const openSignup = document.getElementById("openSignup");
  if (openSignup) {
    openSignup.onclick = () => {
      closeModal("loginBackdrop");
      openModal("signupBackdrop");
    };
  }

  // Switch signup -> login
  const openLogin = document.getElementById("openLogin");
  if (openLogin) {
    openLogin.onclick = () => {
      closeModal("signupBackdrop");
      openModal("loginBackdrop");
    };
  }

  /* ---------------- LOGIN SUBMIT ---------------- */
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.onsubmit = async (e) => {
      e.preventDefault();

      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value.trim();

      try {
        const data = await apiFetch("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });

        setToken(data.token);
        setUser(data.user);

        toast("Login successful ✅");
        closeModal("loginBackdrop");

        setTimeout(() => window.location.reload(), 500);
      } catch (err) {
        toast(err.message, "danger");
      }
    };
  }

  /* ---------------- SIGNUP SUBMIT ---------------- */
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.onsubmit = async (e) => {
      e.preventDefault();

      const name = document.getElementById("signupName").value.trim();
      const email = document.getElementById("signupEmail").value.trim();
      const password = document.getElementById("signupPassword").value.trim();

      try {
        const data = await apiFetch("/auth/signup", {
          method: "POST",
          body: JSON.stringify({ name, email, password }),
        });

        toast(data.message || "Signup successful. Check your email ✅");
        closeModal("signupBackdrop");
      } catch (err) {
        toast(err.message, "danger");
      }
    };
  }
}
export function closeToast() {
  const t = document.getElementById("toast");
  if (t) t.classList.remove("show");
}
window.closeToast = closeToast;
/* ---------------- REQUIRE LOGIN ---------------- */
export function requireLogin() {
  const user = getUser();
  if (!user) {
    toast("Login to book ticket ❗", "danger");
    openModal("loginBackdrop");
    return false;
  }
  return true;
}
