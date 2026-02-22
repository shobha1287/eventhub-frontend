// frontend/js/admin.js
import { apiFetch, getUser } from "./api.js";
import { toast } from "./ui.js";

// ---- protect admin page ----
const user = getUser();

// Your backend returns: user.role
// So admin check should be role === "admin"
if (!user || user.role !== "admin") {
  window.location.href = "index.html";
}

// ---- elements ----
const grid = document.getElementById("adminEventsGrid");
const empty = document.getElementById("adminEmpty");

const btnAdd = document.getElementById("btnAddEvent");

// ---- load events ----
async function loadEvents() {
  try {
    const data = await apiFetch("/api/events");
    const events = Array.isArray(data) ? data : (data.events || []);


    if (!events.length) {
      empty.style.display = "block";
      grid.innerHTML = "";
      return;
    }

    empty.style.display = "none";

    grid.innerHTML = events
      .map(
        (e) => `
      <div class="col-md-6">
        <div class="event-card">
          <img class="event-poster" src="${e.poster_url}" alt="poster">
          <div class="p-3">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <div class="fw-bold">${e.title}</div>
                <div class="muted small">${e.artist}</div>
              </div>
              <span class="badge-pill">${e.category}</span>
            </div>

            <div class="muted small mt-2">
              📍 ${e.city} • ${e.address}
            </div>

            <div class="d-flex justify-content-between align-items-center mt-3">
              <div class="fw-bold">₹${e.ticket_price}</div>
              <button class="btn btn-outline-danger btn-sm" data-del="${e.id}">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    `
      )
      .join("");

    // delete buttons
    document.querySelectorAll("[data-del]").forEach((btn) => {
      btn.onclick = async () => {
        const id = btn.dataset.del;
        if (!confirm("Delete this event?")) return;

        try {
          await apiFetch(`/api/admin/events/${id}`, { method: "DELETE" });
          toast("Event deleted ✅");
          loadEvents();
        } catch (err) {
          toast(err.message, "danger");
        }
      };
    });
  } catch (err) {
    toast(err.message, "danger");
  }
}

// ---- add event ----
btnAdd.onclick = async function () {
  const payload = {
    title: document.getElementById("ad_title").value.trim(),
    category: document.getElementById("ad_category").value,
    artist: document.getElementById("ad_artist").value.trim(),
    address: document.getElementById("ad_address").value.trim(),
    city: document.getElementById("ad_city").value.trim(),

    latitude: document.getElementById("ad_lat").value
      ? Number(document.getElementById("ad_lat").value)
      : null,

    longitude: document.getElementById("ad_lng").value
      ? Number(document.getElementById("ad_lng").value)
      : null,

    event_date: document.getElementById("ad_date").value,
    event_time: document.getElementById("ad_time").value.trim(),

    ticket_price: Number(document.getElementById("ad_price").value),
    available_tickets: Number(document.getElementById("ad_tickets").value),

    poster_url: document.getElementById("ad_poster").value.trim(),
  };

  // basic validation
  if (
    !payload.title ||
    !payload.category ||
    !payload.artist ||
    !payload.address ||
    !payload.city ||
    !payload.event_date ||
    !payload.event_time ||
    !payload.poster_url ||
    !payload.ticket_price ||
    !payload.available_tickets
  ) {
    toast("Please fill all fields ❗", "danger");
    return;
  }

  try {
    await apiFetch("/api/admin/events", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    toast("Event added ✅");

    // reset form (DO NOT CHANGE IDS)
    [
      "ad_title",
      "ad_artist",
      "ad_address",
      "ad_city",
      "ad_lat",
      "ad_lng",
      "ad_date",
      "ad_time",
      "ad_price",
      "ad_tickets",
      "ad_poster",
    ].forEach((id) => (document.getElementById(id).value = ""));

    loadEvents();
  } catch (err) {
    toast(err.message, "danger");
  }
};


// init
loadEvents();
