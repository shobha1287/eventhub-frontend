/// frontend/js/api.js

// ✅ IMPORTANT: keep API always localhost
const BASE_URL = "https://eventhub-backend-1xn2.onrender.com";

// ---------------- TOKEN + USER STORAGE ----------------
const TOKEN_KEY = "eventhub_token";
const USER_KEY = "eventhub_user";

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser() {
  try {
    const u = localStorage.getItem(USER_KEY);
    return u ? JSON.parse(u) : null;
  } catch (e) {
    // If JSON is corrupted, clear it
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// ---------------- API FETCH ----------------
export async function apiFetch(path, options = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = { message: "Invalid server response" };
  }

  if (!res.ok) {
    // If token is invalid/expired, auto logout
    if (res.status === 401 || res.status === 403) {
      logout();
    }
    throw new Error(data.message || "Request failed");
  }

  return data;
}

// ---------------- AUTH ----------------
export async function signup(payload) {
  return apiFetch("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function login(payload) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// This is what main.js needs
export async function getMe() {
  return apiFetch("/auth/me");
}
