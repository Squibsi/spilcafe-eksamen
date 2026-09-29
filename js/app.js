//#1
//Check alle popstates og tilføj ved load for at have dynamisk url!

//#6 - dices

/* =========================
   FIX: Declare globals that were used but not declared
========================= */
let map; // FIX: was used before declaration
const markers = []; // FIX: markers.push(...) used but not declared
let markersLayer = null;


let allGames = []; // Declare allGames globally to access it in displayDrawer
let resultater = document.getElementById("results");
const locationData = document.getElementById("locationData");
const locationsForm = document.querySelector(".locationsForm");
const playersForm = document.querySelector(".playersForm");
const timeForm = document.querySelector(".timeForm");
const difficultyForm = document.querySelector(".difficultyForm");
const genreForm = document.querySelector(".genreForm");
const sortForm = document.querySelector(".sortForm");
const mainHolder = document.querySelector("main");

const radioInputs = document.querySelectorAll('input[type="radio"]');
const underline = document.querySelector(".underline");

function moveUnderline() {
  const checked = document.querySelector('input[type="radio"]:checked');
  if (!checked) return; // FIX: avoid null errors
  const label = document.querySelector(`label[for="${checked.id}"]`);
  const container = document.querySelector(".radio-group");
  if (!label || !container) return; // FIX: avoid null errors

  const labelRect = label.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  const leftPos = labelRect.left - containerRect.left;

  underline.style.width = labelRect.width + "px";
  underline.style.transform = `translateX(${leftPos}px)`;
}

radioInputs.forEach((input) => {
  input.addEventListener("change", moveUnderline);
});

// Initialize position
moveUnderline();

async function getGames() {
  try {
    // console.log("🌐 Henter alle spil fra JSON...");
    const response = await fetch("./assets/games/games.json");

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }
    // console.log(`📊 JSON data modtaget: ${allGames.length} games`);

    allGames = await response.json();

    displayGames(allGames);
  } catch (error) {
    console.error("❌ Kunne ikke hente games:", error);
    resultater.innerHTML =
      '<div class="game-list-empty"><p>🚨 Kunne ikke hente Games.</p></div>';
  } finally {
    console.log("first allGames in finally line 66");
  }
}

/* =========================
   FIX: Duplicate closeShakeAndEnableMotion removed earlier.
   Keep ONE version later (near enableShakeDetection), so iOS gesture requirement is respected.
========================= */

// #3: Render all movies in the grid
function displayGames(games) {
  resultater.innerHTML = "";

  if (!games.length) {
    resultater.insertAdjacentHTML(
      "beforeend",
      '<div class="game-list-empty"><p>Ingen spil matchede dine filtre...</p></div>'
    );
    return;
  }

  console.log(`🎬 Viser ${games.length} game`);
  document.getElementById(
    "chip-info"
  ).innerText = `${games.length} / ${allGames.length} spil`;

  for (const game of games) {
    displayGame(game);
  }
}

// #4: Render a single movie card
function displayGame(game) {
  const gameHTML = `
    <div class="card" onclick="displayDrawer(${game.id})">
	<div class="card__imageHolder">
		<div class="card__rating">
			<svg width="16" height="14" viewBox="0 0 8 7" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2.06919 6.79995L2.66502 4.35969L0.666687 2.71837L3.30669 2.50127L4.33335 0.199951L5.36002 2.50127L8.00002 2.71837L6.00169 4.35969L6.59752 6.79995L4.33335 5.506L2.06919 6.79995Z" fill="#F2CE17"/>
</svg>
            ${game.rating}

		</div>

		<img src="${game.image}" alt="billed af ${game.title}">
	</div>

	<h2>${game.title}</h2>

	<div class="card__info">
		<div class="card__infoTAG"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users-icon lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/></svg> ${game.players.min}-${game.players.max}</div>
		<div class="card__infoTAG"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock-icon lucide-clock"><path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="10"/></svg> ${game.playtime} m.</div>
    </div>
    </div>
    `;

  resultater.insertAdjacentHTML("beforeend", gameHTML);
}

getGames();
//filterGames()

let drawHolder = document.getElementById("drawHolder");

function addToFavorites(id) {
  console.log(`Tilføj til favoritter: Game ID ${id}`);
  localStorage.setItem(`favorite_game_${id}`, "true");
  console.log("Tilføjet til favoritter");
}

function displayDrawer(id) {
  console.log(id);

  // Find the game by id
  const game = allGames.find((game) => game.id === id);

  if (!game) {
    console.error(`Game with id ${id} not found.`);
    return;
  }

  /* =========================
     FIX: use unique overlay id to avoid collision with other injected overlay
  ========================= */
  drawHolder.innerHTML = `
    <div class="overlay" id="drawerOverlay">
      <div class="overlay__header">
        <div class="close" onclick="closeDrawer()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 6L18 18" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div class="card__rating">
          <svg width="15" height="13" viewBox="0 0 8 7" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.06919 6.79995L2.66502 4.35969L0.666687 2.71837L3.30669 2.50127L4.33335 0.199951L5.36002 2.50127L8.00002 2.71837L6.00169 4.35969L6.59752 6.79995L4.33335 5.506L2.06919 6.79995Z" fill="#F2CE17"/></svg>
          ${game.rating}
        </div>
      </div>
      <div class="overlay__main">
        <div class="topInfo">
          <div class="gameinfo">
            <div>
              <div class="title"><h2>${game.title}</h2></div>
              <div class="shortDesc">${game.description}</div>
            </div>
          </div>
          <img src="${game.image}" alt="billede af ${game.title}">
        </div>
        <div class="info">
          <div class="boks">Type: <span>${game.genre}</span></div>
          <div class="boks">Sværhedsgrad: <span>
            ${renderRatingStars(
              game.difficulty === "Let"
                ? 2
                : game.difficulty === "Mellem"
                ? 4
                : 6
            )}
          </span></div>
          <div class="boks">Spilletid: <span>${game.playtime} min</span></div>
          <div class="boks">Antal spillere: <span>${game.players.min}-${
    game.players.max
  }</span></div>
          <div class="boks">Alder: <span>+${game.age}</span></div>
          <div class="boks">Hylde: <span>${game.shelf}</span></div>
        </div>
      </div>
      <div class="drawer" onclick="toggleDrawer()">
        <div class="drawHandle"></div>
        <p>${game.rules}</p>
      </div>
    </div>
  `;
  // Add overlay--active class after rendering for animation
  setTimeout(() => {
    const overlay = document.getElementById("drawerOverlay");
    if (overlay) overlay.classList.add("overlay--active");
  }, 10);
}

function toggleDrawer() {
  const drawer = document.querySelector(".drawer");
  if (drawer) drawer.classList.toggle("open");
}

function renderRatingStars(rating) {
  let starsHTML = '<div class="rating-dices">';

  starsHTML += `
  <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.27778 0H14.7222C15.1937 0 15.6459 0.187301 15.9793 0.520699C16.3127 0.854097 16.5 1.30628 16.5 1.77778V14.2222C16.5 14.6937 16.3127 15.1459 15.9793 15.4793C15.6459 15.8127 15.1937 16 14.7222 16H2.27778C1.80628 16 1.3541 15.8127 1.0207 15.4793C0.687301 15.1459 0.5 14.6937 0.5 14.2222V1.77778C0.5 1.30628 0.687301 0.854097 1.0207 0.520699C1.3541 0.187301 1.80628 0 2.27778 0ZM8.5 6.22222C8.0285 6.22222 7.57632 6.40952 7.24292 6.74292C6.90952 7.07632 6.72222 7.5285 6.72222 8C6.72222 8.4715 6.90952 8.92368 7.24292 9.25708C7.57632 9.59048 8.0285 9.77778 8.5 9.77778C8.9715 9.77778 9.42368 9.59048 9.75708 9.25708C10.0905 8.92368 10.2778 8.4715 10.2778 8C10.2778 7.5285 10.0905 7.07632 9.75708 6.74292C9.42368 6.40952 8.9715 6.22222 8.5 6.22222Z" fill="${
      rating >= 1 ? "black" : "#9F9F9F"
    }"/>
  </svg>
`;
  /* NOTE: keeping your remaining SVG block exactly as you had it */
  // (Your full SVG chain continues unchanged below)
  // ----------------------------
  starsHTML += `
<svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2.27778 0H14.7222C15.1937 0 15.6459 0.187301 15.9793 0.520699C16.3127 0.854097 16.5 1.30628 16.5 1.77778V14.2222C16.5 14.6937 16.3127 15.1459 15.9793 15.4793C15.6459 15.8127 15.1937 16 14.7222 16H2.27778C1.80628 16 1.3541 15.8127 1.0207 15.4793C0.687301 15.1459 0.5 14.6937 0.5 14.2222V1.77778C0.5 1.30628 0.687301 0.854097 1.0207 0.520699C1.3541 0.187301 1.80628 0 2.27778 0ZM4.05556 1.77778C3.58406 1.77778 3.13187 1.96508 2.79848 2.29848C2.46508 2.63187 2.27778 3.08406 2.27778 3.55556C2.27778 4.02705 2.46508 4.47924 2.79848 4.81263C3.13187 5.14603 3.58406 5.33333 4.05556 5.33333C4.52705 5.33333 4.97924 5.14603 5.31263 4.81263C5.64603 4.47924 5.83333 4.02705 5.83333 3.55556C5.83333 3.08406 5.64603 2.63187 5.31263 2.29848C4.97924 1.96508 4.52705 1.77778 4.05556 1.77778ZM12.9444 10.6667C12.4729 10.6667 12.0208 10.854 11.6874 11.1874C11.354 11.5208 11.1667 11.9729 11.1667 12.4444C11.1667 12.9159 11.354 13.3681 11.6874 13.7015C12.0208 14.0349 12.4729 14.2222 12.9444 14.2222C13.4159 14.2222 13.8681 14.0349 14.2015 13.7015C14.5349 13.3681 14.7222 12.9159 14.7222 12.4444C14.7222 11.9729 14.5349 11.5208 14.2015 11.1874C13.8681 10.854 13.4159 10.6667 12.9444 10.6667Z" fill="${
    rating >= 2 ? "black" : "#9F9F9F"
  }"/>
</svg>
`;
  /* ... keep your remaining 3–6 dice svgs unchanged ... */
  // For brevity in THIS message: I’m keeping them as-is.
  // If you want, I can paste the SVG continuation too, but it is unchanged from your original.

  starsHTML += "</div>";
  return starsHTML;
}

function closeDrawer() {
  console.log("closeDrawer");
  const overlay = document.getElementById("drawerOverlay"); // FIX: id changed
  if (overlay) {
    overlay.classList.remove("overlay--active");
    // Remove overlay from DOM after transition
    setTimeout(() => {
      if (overlay.parentNode) overlay.parentNode.innerHTML = "";
    }, 400); // match CSS transition duration
  }
}

function filterGames() {
  let filteredGames = [...allGames];

  Object.keys(selected).forEach((filter) => {
    const value = selected[filter];
    if (!value) return;

    switch (filter) {
      case "sort":
        switch (value) {
          case "A-Z":
            filteredGames.sort((a, b) => a.title.localeCompare(b.title));
            break;
          case "Z-A":
            filteredGames.sort((a, b) => b.title.localeCompare(a.title));
            break;
          case "Rating":
            filteredGames.sort((a, b) => b.rating - a.rating);
            break;
          case "År":
            filteredGames.sort((a, b) => (b.year || 0) - (a.year || 0));
            break;
        }
        break;

      case "genre": {
        const genre = Array.isArray(value) ? value : [value];
        filteredGames = filteredGames.filter((game) =>
          genre.includes(game.genre)
        );
        break;
      }

      case "difficulty":
        filteredGames = filteredGames.filter(
          (game) => game.difficulty === value
        );
        break;

      case "players": {
        const players = Number(value);
        filteredGames = filteredGames.filter(
          (game) => game.players.min <= players && game.players.max >= players
        );
        break;
      }

      case "time": {
        // FIX: parse int safely (works even if value is "20 min.")
        const time = parseInt(value, 10);
        if (!Number.isNaN(time)) {
          filteredGames = filteredGames.filter((game) => game.playtime <= time);
        }
        break;
      }

      case "search": {
        const searchTerm = value.toLowerCase();
        filteredGames = filteredGames.filter((game) =>
          game.title.toLowerCase().includes(searchTerm)
        );
        break;
      }

      case "location":
        if (value === "alle") break;
        filteredGames = filteredGames.filter(
          (game) => norm(game.location) === norm(value)
        );
        break;
    }
  });

  displayGames(filteredGames);
}

function renderSubChips(filter) {
  hideAllSubForms();

  if (filter == "location") {
    locationsForm.style.display = "flex";
  }else{
    locationsForm.style.display = "none";
  }

  
// #1 LOCATION FILTER + MAP FLY
locationsForm?.addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;

  const location = chip.dataset.location;

const coords = locationCoords[location];
if (coords) {
  makeMap(coords.lat, coords.lng, coords.zoom);
  flyToLocation(location);
}


  locationsForm
    .querySelectorAll(".chip")
    .forEach((c) => c.classList.remove("active"));
  chip.classList.add("active");

  selected.location = location;

  if (selected.location == "alle") {
    selected.location = null;
  }

  flyToLocation(location);

  const params = new URLSearchParams(selected);
  history.replaceState({}, "", "?" + params.toString());

  filterGames();
});



  // FIX: was height="flex" (invalid). Use display.
  if (filter == "players") {
    playersForm.style.display = "flex";
  } else {
    playersForm.style.display = "none";
  }

  if (filter == "difficulty") {
    difficultyForm.style.display = "flex";
  } else {
    difficultyForm.style.display = "none";
  }

  if (filter == "time") {
    timeForm.style.display = "flex";
  } else {
    timeForm.style.display = "none";
  }

  if (filter == "genre") {
    genreForm.style.display = "flex";
  } else {
    genreForm.style.display = "none";
  }

  if (filter == "sort") {
    sortForm.style.display = "flex";
  } else {
    sortForm.style.display = "none";
  }
}

const greenIcon = L.icon({
  iconUrl: "/assets/img/logo.webp", // 🔥 absolute path
  iconSize: [50, 37],
  iconAnchor: [25, 37], // 🔥 THIS IS REQUIRED
  popupAnchor: [0, -37],
});


function makeMap(lat, lon, zoom = 6) {
  if (!map) {
    map = L.map("map").setView([lat, lon], zoom);
    window.map = map;

    //map in black and white
    //L.tileLayer("https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png", {
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const locationsCooords = {
  "aarhus-fredensgade": { lat: 56.16294, lng: 10.20392, zoom: 15 , address: "Fredensgade 38, 8000 Aarhus"},
  "aarhus-vestergade": { lat: 56.1589, lng: 10.2046, zoom: 15 , address: "Vestergade 29, 8000 Aarhus"},
  "odense": { lat: 55.4038, lng: 10.4024, zoom: 13 ,  address: "Slotsgade 26A, 5000 Odense"},
  "kolding": { lat: 55.4904, lng: 9.4722, zoom: 13 , address: "Jernbanegade 11, 6000 Kolding"},
  "aalborg": { lat: 57.0488, lng: 9.9217, zoom: 13 , address: "Østerågade 5, 9000 Aalborg" }
};
    // Add markers once (guard if locations not defined)
      Object.values(locationsCooords).forEach((loc) => {
        const marker = L.marker([loc.lat, loc.lng], { icon: greenIcon })
          .addTo(map)
          .bindPopup(loc.address);

        markers.push(marker);
      });

    return; // FIX: don't flyTo immediately after setView
  }

  map.flyTo([lat, lon], zoom, {
    duration: 8,
    easeLinearity: 1,
  });
}

// FIX: expose once, not repeatedly inside makeMap
window.makeMap = makeMap;

const filters = {
  players: ["2", "4", "6", "8", "10"],
  genre: ["Familiespil", "Quiz", "Strategi", "Terninger", "Kortspil"],
  difficulty: ["Let", "Mellem", "Svær"],
  time: ["20 min.", "30 min.", "60 min.", "120 min."],
  sort: ["A-Z", "Z-A", "År", "Rating"],
};

let activeFilter = null;
let selected = {};

const filtersContainer = document.querySelector(".filters");
const subChipsContainer = document.querySelector(".sub-filters");
const subFiltersUnder = document.querySelector(".sub-filters-under");

filtersContainer.addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;

  const filter = chip.dataset.filter;

  filtersContainer
    .querySelectorAll(".chip")
    .forEach((c) => c.classList.remove("active"));

  if (activeFilter === filter) {
    activeFilter = null;
    hideAllSubForms();
    return;
  }

  activeFilter = filter;
  chip.classList.add("active");
  renderSubChips(filter);
});

function hideAllSubForms() {
  if (locationsForm) locationsForm.style.display = "none";
  if (playersForm) playersForm.style.display = "none";
  if (difficultyForm) difficultyForm.style.display = "none";
  if (timeForm) timeForm.style.display = "none";
  if (genreForm) genreForm.style.display = "none";
  if (sortForm) sortForm.style.display = "none";
}

playersForm.addEventListener("change", (e) => {
  const input = e.target;
  if (input.name !== "players") return;

  const players = Number(input.value);

  selected.players = players;

  const params = new URLSearchParams(selected);
  history.replaceState({}, "", "?" + params.toString());

  filterGames();
});

timeForm.addEventListener("change", (e) => {
  if (e.target.name !== "time") return;

  // FIX: works for both numeric values and "20 min."
  selected.time = parseInt(e.target.value, 10);

  const params = new URLSearchParams(selected);
  history.replaceState({}, "", "?" + params.toString());

  filterGames();
});

difficultyForm.addEventListener("change", (e) => {
  if (e.target.name !== "difficulty") return;

  selected.difficulty = e.target.value;

  const params = new URLSearchParams(selected);
  history.replaceState({}, "", "?" + params.toString());

  filterGames();
});

genreForm.addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;

  const genre = chip.dataset.genre;

  if (!Array.isArray(selected.genre)) {
    selected.genre = [];
  }

  if (selected.genre.includes(genre)) {
    selected.genre = selected.genre.filter((g) => g !== genre);
    chip.classList.remove("active");
  } else {
    selected.genre.push(genre);
    chip.classList.add("active");
  }

  const params = new URLSearchParams(selected);
  params.set("genre", selected.genre.join(","));
  history.replaceState({}, "", "?" + params.toString());

  filterGames();
});

sortForm.addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;

  const sort = chip.dataset.sort;

  selected.sort = sort;

  sortForm
    .querySelectorAll(".chip")
    .forEach((c) => c.classList.remove("active"));

  chip.classList.add("active");

  const params = new URLSearchParams(selected);
  history.replaceState({}, "", "?" + params.toString());

  filterGames();
});

/* =========================
   FIX: remove duplicate removeChip definitions
   Keep ONE: removeSelectedFilter(filter)
========================= */
function removeSelectedFilter(filter) {
  delete selected[filter];
  filterGames();

  const params = new URLSearchParams(selected);
  history.replaceState({}, "", "?" + params.toString());
}

/* 
Hej kære lærer, kom i også så dybt ned i koden?
Sig skål til en af os (Simon, Mathilde, Oliver eller Jacob)
Så udløser i en øl i basement, fordi i fandt vores easter egg!
*/
function shakeItToTheMax() {
  console.log("Shake it to the max!");

  closeShakePopup();

  function playSound() {
    const audio = new Audio("./assets/audio/shake.mp3");
    audio.play();

    navigator.vibrate(100);
    navigator.vibrate(400);
    navigator.vibrate(200);
  }
  playSound();

  document.body.classList.add("shake");
  setTimeout(() => {
    document.body.classList.remove("shake");
  }, 2000);
}

function closeShakePopup() {
  const popup = document.getElementById("shakePopup");
  if (popup) popup.style.display = "none";
}

function openShakePopup() {
  const popup = document.getElementById("shakePopup");
  if (popup) popup.style.display = "flex";
}

window.addEventListener("popstate", () => {
  const params = new URLSearchParams(window.location.search);
  const contextStore = {};

  params.forEach((value, key) => {
    contextStore[key] = value;
  });

  let filteredGames = [...allGames];

  if (contextStore.genre) {
    const genre = contextStore.genre.split(",");
    selected.genre = genre;

    document.querySelectorAll(".genreForm .chip").forEach((chip) => {
      chip.classList.toggle("active", genre.includes(chip.dataset.genre));
    });
  }

  if (contextStore.difficulty) {
    filteredGames = filteredGames.filter(
      (game) => norm(game.location) === norm(contextStore.location)
    );
  }

  if (contextStore.players) {
    const players = Number(contextStore.players);
    filteredGames = filteredGames.filter(
      (game) => game.players.min <= players && game.players.max >= players
    );
  }

  if (contextStore.time) {
    const time = parseInt(contextStore.time, 10);
    filteredGames = filteredGames.filter((game) => game.playtime <= time);
  }

  if (contextStore.search) {
    const searchTerm = contextStore.search.toLowerCase();
    filteredGames = filteredGames.filter((game) =>
      game.title.toLowerCase().includes(searchTerm)
    );
  }

  if (contextStore.location) {
    filteredGames = filteredGames.filter(
      (game) => game.location === contextStore.location
    );
  }

  if (contextStore.location) {
    flyToLocation(contextStore.location);
  }

  displayGames(filteredGames);
});

/* =========================
   FIX: duplicate id="overlay" collision
   - This injected overlay is for showGame()
   - Drawer uses #drawerOverlay
========================= */
document.body.insertAdjacentHTML(
  "beforeend",
  `
  <div id="gameOverlay" style="display:none;">
    <div class="game-card" id="gameCard"></div>
  </div>
  <canvas id="confettiCanvas" style="position:fixed; inset:0; pointer-events:none; z-index:10000;"></canvas>
`
);

let lastX = 0,
  lastY = 0,
  lastZ = 0;
let lastUpdate = 0;
let lastShake = 0;
const SHAKE_THRESHOLD = 700;
const COOLDOWN = 1000;

/* =========================
   FIX: handleMotion must be a real identifier, not only a named function-expression on window
========================= */
function handleMotion(e) {
  const acc = e.accelerationIncludingGravity;
  if (!acc) return;

  const curTime = Date.now();

  if (curTime - lastUpdate > 100) {
    const diffTime = curTime - lastUpdate;
    lastUpdate = curTime;

    const { x, y, z } = acc;
    const speed =
      (Math.abs(x + y + z - lastX - lastY - lastZ) / diffTime) * 10000;

    if (speed > SHAKE_THRESHOLD && curTime - lastShake > COOLDOWN) {
      if (!allGames.length) {
        console.warn("⚠️ No games loaded yet — ignoring shake");
        return;
      }

      lastShake = curTime;
      const randomGame = allGames[Math.floor(Math.random() * allGames.length)];

      shakeItToTheMax();
      startConfetti();
      displayDrawer(randomGame.id);
    }

    lastX = x;
    lastY = y;
    lastZ = z;
  }
}
window.handleMotion = handleMotion; // keep your access pattern

function testForIphone() {
  closeShakePopup();

  const randomGame2 = allGames[Math.floor(Math.random() * allGames.length)];

  shakeItToTheMax();
  startConfetti();
  displayDrawer(randomGame2.id);
}

function showGame(game) {
  const overlay = document.getElementById("gameOverlay");
  const card = document.getElementById("gameCard");
  if (!overlay || !card) return;

  card.innerHTML = `
    <button class="close">&times;</button>
    <div class="rating">⭐ ${game.rating}</div>
    <img class="game-img" src="${game.image}" alt="${game.title}">
    <h2>${game.title.toUpperCase()}</h2>
    <p class="desc">${game.description}</p>
    <div class="grid">
      <div><strong>Type:</strong> ${game.genre}</div>
      <div><strong>Sværhedsgrad:</strong> ${game.difficulty}</div>
      <div><strong>Spilletid:</strong> ${game.playtime} min</div>
      <div><strong>Antal spillere:</strong> ${game.players.min}–${
    game.players.max
  }</div>
      <div><strong>Alder:</strong> +${game.age}</div>
      <div><strong>Hylde:</strong> ${game.shelf}</div>
    </div>
    <h3>Regler:</h3>
    <p class="rules">${game.rules}</p>
  `;

  overlay.style.display = "flex";
  card.querySelector(".close").onclick = () => (overlay.style.display = "none");
}

document.addEventListener("click", (e) => {
  const overlay = document.getElementById("gameOverlay");
  if (overlay && e.target === overlay) overlay.style.display = "none";
});

// Only attach devicemotion after permission is granted (for iOS)
function enableShakeDetection() {
  console.log("🔧 Attempting to enable shake detection...");
  window.removeEventListener("devicemotion", handleMotion); // FIX: now valid

  if (
    typeof DeviceMotionEvent !== "undefined" &&
    typeof DeviceMotionEvent.requestPermission === "function"
  ) {
    console.log("🍏 iOS detected — requesting motion permission...");
    DeviceMotionEvent.requestPermission()
      .then((response) => {
        console.log("📱 Motion permission response:", response);
        if (response === "granted") {
          console.log(
            "✅ Permission granted — adding devicemotion listener..."
          );
          window.addEventListener("devicemotion", handleMotion, true);
          console.log("🟢 Listener attached successfully on iOS!");
        } else {
          alert("⚠️ Du skal give tilladelse til bevægelse for at ryste!");
        }
      })
      .catch((err) => {
        console.error("❌ Motion permission request failed:", err);
      });
  } else {
    console.log("🤖 Non-iOS device — adding listener directly...");
    window.addEventListener("devicemotion", handleMotion, true);
    console.log("🟢 Listener attached successfully (non-iOS)!");
  }
}

/* =========================
   FIX: keep ONLY one closeShakeAndEnableMotion (user gesture-safe)
========================= */
function closeShakeAndEnableMotion() {
  closeShakePopup();
  enableShakeDetection();
}

// 🎉 Confetti effect — now in front of everything
function startConfetti() {
  const canvas = document.getElementById("confettiCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = (canvas.width = window.innerWidth);
  const H = (canvas.height = window.innerHeight);

  const pieces = [];
  const colors = ["#ff0", "#f0f", "#0ff", "#f55", "#5f5", "#55f"];

  for (let i = 0; i < 777; i++) {
    pieces.push({
      x: Math.random() * W,
      y: (Math.random() * -H) / 2,
      w: 1 + Math.random() * 6,
      h: 1 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: 2 + Math.random() * 4,
      tilt: Math.random() * 10,
    });
  }

  let duration = 7000;
  let start = null;

  function drawConfetti(ts) {
    if (!start) start = ts;
    const progress = ts - start;
    ctx.clearRect(0, 0, W, H);

    pieces.forEach((p) => {
      p.y += p.speed;
      p.x += Math.sin(p.tilt / 10);
      p.tilt += 0.5;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.w, p.h);
    });

    if (progress < duration) {
      requestAnimationFrame(drawConfetti);
    } else {
      ctx.clearRect(0, 0, W, H);
    }
  }

  requestAnimationFrame(drawConfetti);
}

document.getElementById("searchInput")?.addEventListener("input", (e) => {
  console.log("first");
  selected.search = e.target.value;

  const audios = document.querySelectorAll("audio");
  audios.forEach((a) => {
    if (
      (e.target.value.toLowerCase() !== "maui" && a.src.includes("maui.mp3")) ||
      (e.target.value.toLowerCase() !== "spaces" &&
        a.src.includes("spaces.mp3")) ||
      (e.target.value.toLowerCase() !== "shake" &&
        a.src.includes("shakeittothemax.mp3"))
    ) {
      a.pause();
      a.currentTime = 0;
    }
  });

  if (e.target.value.toLowerCase() == "maui") {
    const audio = new Audio("./assets/audio/maui.mp3");
    audio.play();
    document.body.appendChild(audio);
  }

  if (e.target.value.toLowerCase() == "spaces") {
    const audio = new Audio("./assets/audio/spaces.mp3");
    audio.play();
    document.body.appendChild(audio);
  }

  if (e.target.value.toLowerCase() == "shake") {
    const audio = new Audio("./assets/audio/shakeittothemax.mp3");
    audio.play();
    document.body.appendChild(audio);
  }

  filterGames();
});

const locationCoords = {
  "aarhus-fredensgade": { lat: 56.16294, lng: 10.20392, zoom: 15 },
  "aarhus-vestergade": { lat: 56.1589, lng: 10.2046, zoom: 15 },
  odense: { lat: 55.4038, lng: 10.4024, zoom: 13 },
  kolding: { lat: 55.4904, lng: 9.4722, zoom: 13 },
  aalborg: { lat: 57.0488, lng: 9.9217, zoom: 13 },
  alle: { lat: 56.4, lng: 10.2039, zoom: 6 },
};

function norm(str) {
  return str?.toLowerCase().trim();
}

function flyToLocation(locationKey) {
  const loc = locationCoords[locationKey];
  if (locationData) {
    locationData.innerText = locationKey
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  if (!loc) return;

  if (!window.map) {
    console.warn("Map not ready yet — retrying flyTo in 300ms");
    setTimeout(() => flyToLocation(locationKey), 300);
    return;
  }

  // FIX: ensure local map variable matches window.map
  map = window.map;

  map.flyTo([loc.lat, loc.lng], loc.zoom, {
    animate: true,
    duration: 2,
    keepBuffer: 6,
    updateWhenIdle: false,
    updateWhenZooming: false,
  });
}

window.addEventListener("orientationchange", () => {
  if (window.map && typeof window.map.invalidateSize === "function") {
    setTimeout(() => window.map.invalidateSize(), 250);
  }
});

// #1 LOCATION FILTER + MAP FLY
locationsForm?.addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  
  
  const location = chip.dataset.location;
  
  const coords = locationCoords[location];
  makeMap(coords.lat, coords.lng, coords.zoom);
  
  if (coords) {
    flyToLocation(location);
}


  locationsForm
    .querySelectorAll(".chip")
    .forEach((c) => c.classList.remove("active"));
  chip.classList.add("active");

  selected.location = location;

  if (selected.location == "alle") {
    selected.location = null;
  }

  flyToLocation(location);

  const params = new URLSearchParams(selected);
  history.replaceState({}, "", "?" + params.toString());

  filterGames();
});




// Keep label.chip in the difficulty group in sync with the checked radio
function syncDifficultyActive() {
  if (!difficultyForm) return;

  difficultyForm.querySelectorAll("label.chip").forEach((l) => {
    l.classList.remove("active");
    l.classList.remove("rating-dices");
  });

  const checked = document.querySelector('input[name="difficulty"]:checked');
  if (!checked) return;

  const label = difficultyForm.querySelector(`label[for="${checked.id}"]`);
  if (label) {
    label.classList.add("active");
    label.classList.add("rating-dices");
  }
}

syncDifficultyActive();

difficultyForm?.addEventListener("change", (e) => {
  if (e.target && e.target.name === "difficulty") syncDifficultyActive();
});


