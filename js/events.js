import { apiFetch } from "./api.js";
import { initAuthUI, toast } from "./ui.js";

initAuthUI();

let allEvents = [];
let selectedCategory = "All";
let selectedCity = "All";
let searchText = "";

// ✅ must match events.html
const eventsGrid = document.getElementById("eventsGrid");
const searchInput = document.getElementById("searchInput");
const categoryChips = document.getElementById("categoryChips");
const cityChips = document.getElementById("cityChips");
const btnLocation = document.getElementById("btnLocation");

function setActiveChip(container, value) {
  container.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
  container.querySelector(`[data-value="${value}"]`)?.classList.add("active");
}

function renderCityChips(events) {
  const cities = [...new Set(events.map((e) => e.city).filter(Boolean))].sort();

  cityChips.innerHTML = `
    <button class="chip active" data-value="All">All</button>
    ${cities.map((c) => `<button class="chip" data-value="${c}">${c}</button>`).join("")}
  `;

  cityChips.querySelectorAll(".chip").forEach((chip) => {
    chip.onclick = () => {
      selectedCity = chip.dataset.value;
      setActiveChip(cityChips, selectedCity);
      renderEvents();
    };
  });
}

function renderEvents() {
  const filtered = allEvents.filter((e) => {
    const matchCategory = selectedCategory === "All" || e.category === selectedCategory;
    const matchCity = selectedCity === "All" || e.city === selectedCity;

    const s = searchText.toLowerCase();
    const matchSearch =
      !s ||
      (e.title || "").toLowerCase().includes(s) ||
      (e.artist || "").toLowerCase().includes(s) ||
      (e.city || "").toLowerCase().includes(s);

    return matchCategory && matchCity && matchSearch;
  });

  if (filtered.length === 0) {
    eventsGrid.innerHTML = `<div class="text-center muted py-5">No events found.</div>`;
    return;
  }

  // ✅ render cards into eventsGrid
  eventsGrid.innerHTML = filtered
  .map(
    (e) => `
    <div class="col-md-4 mb-4">
      <div class="event-card h-100 d-flex flex-column" data-id="${e.id}">
        
        <img src="${e.poster_url}" 
             alt="poster" 
             class="event-poster" />

        <div class="p-3 d-flex flex-column flex-grow-1">
          
          <div>
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <div class="fw-bold">${e.title}</div>
                <div class="badge-dark small">${e.artist || ""}</div>
              </div>
              <span class="badge-dark">${e.category}</span>
            </div>

            <div class="mt-2 badge-dark small">
              📍 ${e.city} • ${e.address}
            </div>
          </div>

          <div class="mt-auto pt-3 d-flex justify-content-between align-items-center">
            <div class="price">₹${e.ticket_price}</div>
            <div class="badge-dark small">
              ${e.available_tickets} left
            </div>
          </div>

        </div>

      </div>
    </div>
  `
  )
  .join("");

  // ✅ click open event.html?id=...
  document.querySelectorAll(".event-card").forEach((card) => {
    card.onclick = () => {
      const id = card.dataset.id;
      window.location.href = `event.html?id=${id}`;
    };
  });
}

async function loadEvents() {
  try {
    const data = await apiFetch("/api/events");

    // 🔥 Your backend returns ARRAY directly
    // not { events: [...] }
    allEvents = Array.isArray(data) ? data : data.events || [];

    renderCityChips(allEvents);
    renderEvents();
  } catch (err) {
    toast(err.message, "danger");
  }
}

// search
searchInput.addEventListener("input", () => {
  searchText = searchInput.value.trim();
  renderEvents();
});

// category chips
categoryChips.querySelectorAll(".chip").forEach((chip) => {
  chip.onclick = () => {
    selectedCategory = chip.dataset.value;
    setActiveChip(categoryChips, selectedCategory);
    renderEvents();
  };
});

// nearby button
btnLocation.onclick = () => {
  if (!navigator.geolocation) {
    toast("Geolocation not supported", "danger");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;

      allEvents.sort((a, b) => {
        if (!a.latitude || !a.longitude) return 1;
        if (!b.latitude || !b.longitude) return -1;

        const da = Math.hypot(a.latitude - latitude, a.longitude - longitude);
        const db = Math.hypot(b.latitude - latitude, b.longitude - longitude);
        return da - db;
      });

      toast("Showing nearby events 📍");
      renderEvents();
    },
    () => toast("Location permission denied", "danger")
  );
};

loadEvents();
