import { apiFetch } from "./api.js";

async function loadTopEvents() {
  try {
    const events = await apiFetch("/api/events");

    const topThree = events.slice(0, 3); // get first 3
    const container = document.getElementById("topEventsRow");

    container.innerHTML = "";

    topThree.forEach(event => {
      container.innerHTML += `
        <div class="col-md-4">
          <div class="card-soft h-100 p-3">
            <img src="${event.poster_url}" class="img-fluid rounded mb-3">

            <h5>${event.title}</h5>
            <p class="muted">${event.artist}</p>
            <p class="fw-bold">₹${event.ticket_price}</p>

            <a href="event.html?id=${event.id}" 
               class="btn btn-purple w-100">
              Book Now
            </a>
          </div>
        </div>
      `;
    });

  } catch (err) {
    console.log(err);
  }
}

loadTopEvents();
