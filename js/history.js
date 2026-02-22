import { apiFetch } from "./api.js";
import { initAuthUI, toast } from "./ui.js";
import { getUser } from "./api.js";

initAuthUI();

const historyList = document.getElementById("historyWrap");
const user = getUser();

if (!user) {
  window.location.href = "index.html";
}

async function loadBookings() {
  try {
    const bookings = await apiFetch("/api/bookings/my");

    const container = document.getElementById("historyWrap");
    container.innerHTML = "";

    if (!bookings.length) {
      container.innerHTML = "<p>No bookings yet.</p>";
      return;
    }

    bookings.forEach(b => {
      container.innerHTML += `
        <div class="col-md-6">
          <div class="card-soft p-3">
            <h5>${b.title}</h5>
            <p><b>Category:</b> ${b.category}</p>
            <p><b>Artist/Host:</b> ${b.artist}</p>
            <p><b>Address:</b> ${b.address}, ${b.city}</p>
            <p><b>Date:</b> ${b.event_date}</p>
            <p><b>Time:</b> ${b.event_time}</p>
            <p><b>Quantity:</b> ${b.qty}</p>
          </div>
        </div>
      `;
    });

  } catch (err) {
    toast(err.message, "danger");
  }
}
loadBookings();

