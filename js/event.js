import { apiFetch } from "./api.js";
import { toast, requireLogin } from "./ui.js";

const wrap = document.getElementById("eventWrap");

function getEventId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toDateString();
}

function renderEvent(e) {
  wrap.innerHTML = `
    <div class="row g-4 align-items-start">

      <div class="col-lg-5">
        <img
          src="${e.poster_url}"
          alt="poster"
          class="w-100 rounded-4"
          style="
            height: 500px;
            object-fit: cover;
            box-shadow: 0 20px 50px rgba(0,0,0,.35);
          "
        />
      </div>

      <div class="col-lg-7">
        <div class="d-flex justify-content-between align-items-start gap-3">
          <div>
            <h2 class="mb-1">${e.title}</h2>
            <div class="badge-dark">${e.artist || ""}</div>
          </div>
          <span class="badge-dark">${e.category}</span>
        </div>

        <div class="mt-3 badge-dark">
          📍 ${e.address}, ${e.city}
        </div>

        <div class="mt-2 badge-dark">
          📅 ${formatDate(e.event_date)} • ⏰ ${e.event_time}
        </div>

        <div class="mt-4 d-flex flex-wrap gap-3 align-items-center">
          <div class="price fs-3">₹${e.ticket_price}</div>
          <div class="badge-dark">
            ${e.available_tickets} tickets left
          </div>
        </div>

        <hr class="my-4" style="border-color: rgba(255,255,255,.12);" />

        <div class="d-flex flex-wrap gap-2 align-items-center">
          <label class="fw-semibold">Qty:</label>

          <select id="qty" class="form-select input-soft" style="width:120px;">
            ${[...Array(10)]
              .map((_, i) => `<option value="${i + 1}">${i + 1}</option>`)
              .join("")}
          </select>

          <button id="btnBook" class="btn btn-purple">
            Book Ticket 🎟️
          </button>
        </div>

        <div class="badge-dark small mt-3">
          ⚠️ Max 10 tickets per booking.
        </div>
      </div>

    </div>
  `;
}

async function loadEvent() {
  const id = getEventId();

  if (!id) {
    wrap.innerHTML = `<div class="text-danger">Invalid event link.</div>`;
    return;
  }

  try {
    // ✅ backend returns object directly
    const event = await apiFetch(`/events/${id}`);

    renderEvent(event);

    const btnBook = document.getElementById("btnBook");

    // disable booking if sold out
    if (Number(event.available_tickets) <= 0) {
      btnBook.disabled = true;
      btnBook.innerText = "Sold Out ❌";
      return;
    }

    btnBook.onclick = () => bookTicket(id);
  } catch (err) {
    wrap.innerHTML = `<div class="text-danger">${err.message}</div>`;
  }
}


async function bookTicket(id) {
  if (!requireLogin()) return;

  const qtySelect = document.getElementById("qty");
  if (!qtySelect) return;

  const qty = Number(qtySelect.value);

  try {
    await apiFetch(`/events/${id}/book`, {
      method: "POST",
      body: JSON.stringify({ qty }),
    });

    // Show centered modal popup
    showBookingSuccess();

    // Reload event after small delay
    setTimeout(() => {
      loadEvent();
    }, 800);

  } catch (err) {
    toast(err.message || "Booking failed", "danger");
  }
}
function showBookingSuccess() {
  const backdrop = document.getElementById("bookingBackdrop");
  if (backdrop) {
    backdrop.style.display = "flex";
  }
}
function closeBookingPopup() {
  const backdrop = document.getElementById("bookingBackdrop");
  if (backdrop) {
    backdrop.style.display = "none";
  }
}

// Make it available globally
window.closeBookingPopup = closeBookingPopup;
loadEvent();



