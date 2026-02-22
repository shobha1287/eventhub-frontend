// frontend/js/navbar.js
import { getUser, logout } from "./api.js";
import { toast } from "./ui.js";

function getCurrentPage() {
  const p = window.location.pathname.split("/").pop();
  return p === "" ? "index.html" : p;
}

function setActiveLinks() {
  const page = getCurrentPage();
  const hash = window.location.hash;

  document.querySelectorAll(".nav-link").forEach((a) => {
    a.classList.remove("active");
  });

  // About section (index.html#about)
  if (page === "index.html" && hash === "#about") {
    document.querySelectorAll('a[href="#about"]').forEach((a) => {
      a.classList.add("active");
    });
  }

  if (page === "events.html") {
    document.querySelectorAll('a[href="events.html"]').forEach((a) => {
      a.classList.add("active");
    });
  }

  if (page === "history.html") {
    document.querySelectorAll('a[href="history.html"]').forEach((a) => {
      a.classList.add("active");
    });
  }

  if (page === "admin.html") {
    document.querySelectorAll('a[href="admin.html"]').forEach((a) => {
      a.classList.add("active");
    });
  }
}

export function initNavbar() {
  const user = getUser();

  const adminItem = document.getElementById("adminNavItem");
  const historyItem = document.getElementById("historyNavItem");
  const authBtn = document.getElementById("navAuthBtn");

  // default hide
  if (adminItem) adminItem.style.display = "none";
  if (historyItem) historyItem.style.display = "none";

  if (user) {
    // Logged in
    if (authBtn) authBtn.innerText = "Logout";

    // Show My Bookings
    if (historyItem) historyItem.style.display = "block";

    // Show Admin only if admin
    if (adminItem && (user.role === "admin" || user.is_admin === true)) {
      adminItem.style.display = "block";
    }

    // Logout click
    if (authBtn) {
      authBtn.onclick = () => {
        logout();
        toast("Logged out 👋");
        setTimeout(() => window.location.reload(), 500);
      };
    }
  } else {
    // Logged out
    if (authBtn) authBtn.innerText = "Login";

    // Login click
    if (authBtn) {
      authBtn.onclick = () => {
        const loginBackdrop = document.getElementById("loginBackdrop");
        if (loginBackdrop) loginBackdrop.classList.add("show");
      };
    }
  }

  setActiveLinks();
}

document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
});
// ✅ Fix About scroll (because offcanvas prevents anchor scroll)
const aboutLink = document.getElementById("aboutLink");

if (aboutLink) {
  aboutLink.addEventListener("click", (e) => {
    e.preventDefault();

    // close offcanvas first
    const offcanvasEl = document.getElementById("mobileNav");
    if (offcanvasEl) {
      const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
      if (offcanvas) offcanvas.hide();
    }

    // wait a bit, then scroll
    setTimeout(() => {
      const aboutSection = document.getElementById("about");
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 250);
  });
}
// ✅ Fix Events link (close offcanvas then navigate)
const eventsLink = document.getElementById("eventsLink");

if (eventsLink) {
  eventsLink.addEventListener("click", (e) => {
    e.preventDefault();

    const offcanvasEl = document.getElementById("mobileNav");
    if (offcanvasEl) {
      const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
      if (offcanvas) offcanvas.hide();
    }

    setTimeout(() => {
      window.location.href = "events.html";
    }, 200);
  });
}

