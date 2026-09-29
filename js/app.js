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
const clearFiltersButton = document.getElementById("clearFiltersChip");
const shakeButton = document.getElementById("shakeButton");
const enableShakeButton = document.getElementById("enableShake");
const chooseRandomGameButton = document.getElementById("chooseRandomGame");
let lastFocusedElement = null;

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

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

  const activeFilterCount = Object.values(selected).filter((value) =>
    Array.isArray(value) ? value.length > 0 : value !== null && value !== ""
  ).length;
  clearFiltersButton?.classList.toggle("hidden", activeFilterCount === 0);

  if (!games.length) {
    document.getElementById("chip-info").innerText = `0 af ${allGames.length} spil fundet`;
    resultater.insertAdjacentHTML(
      "beforeend",
      '<div class="game-list-empty"><p>Ingen spil matchede dine filtre...</p></div>'
    );
    return;
  }

  document.getElementById(
    "chip-info"
  ).innerText = `${games.length} af ${allGames.length} spil fundet`;

  for (const game of games) {
    displayGame(game);
  }
}

// #4: Render a single movie card
function displayGame(game) {
  const title = escapeHTML(game.title);
  const gameHTML = `
	<button class="card" type="button" data-game-id="${game.id}" aria-label="Se detaljer om ${title}">
	<div class="card__imageHolder">
		<div class="card__rating" aria-label="Bedømmelse ${game.rating} ud af 5">
			<svg aria-hidden="true" width="16" height="14" viewBox="0 0 8 7" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2.06919 6.79995L2.66502 4.35969L0.666687 2.71837L3.30669 2.50127L4.33335 0.199951L5.36002 2.50127L8.00002 2.71837L6.00169 4.35969L6.59752 6.79995L4.33335 5.506L2.06919 6.79995Z" fill="#F2CE17"/>
</svg>
            ${game.rating}

		</div>

		<img src="${game.image}" alt="Spilæsken til ${title}" width="120" height="120" loading="lazy" decoding="async">
	</div>

	<h2>${title}</h2>

	<div class="card__info">
		<div class="card__infoTAG"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users-icon lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/></svg><span class="visually-hidden">Antal spillere: </span>${game.players.min}-${game.players.max}</div>
		<div class="card__infoTAG"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock-icon lucide-clock"><path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="10"/></svg><span class="visually-hidden">Spilletid: </span>${game.playtime} min.</div>
    </div>
	</button>
    `;

  resultater.insertAdjacentHTML("beforeend", gameHTML);
}

resultater.addEventListener("click", (event) => {
  const card = event.target.closest("[data-game-id]");
  if (card) displayDrawer(Number(card.dataset.gameId));
});

getGames();
//filterGames()

let drawHolder = document.getElementById("drawHolder");

function addToFavorites(id) {
  console.log(`Tilføj til favoritter: Game ID ${id}`);
  localStorage.setItem(`favorite_game_${id}`, "true");
  console.log("Tilføjet til favoritter");
}

function displayDrawer(id) {
  // Find the game by id
  const game = allGames.find((game) => game.id === id);

  if (!game) {
    console.error(`Game with id ${id} not found.`);
    return;
  }

  /* =========================
     FIX: use unique overlay id to avoid collision with other injected overlay
  ========================= */
  lastFocusedElement = document.activeElement;
  const title = escapeHTML(game.title);
  drawHolder.innerHTML = `
    <section class="overlay" id="drawerOverlay" role="dialog" aria-modal="true" aria-labelledby="drawer-title" tabindex="-1">
      <div class="overlay__header">
        <button class="close" type="button" data-close-dialog aria-label="Luk spildetaljer">
          <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 6L18 18" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <div class="card__rating">
          <svg width="15" height="13" viewBox="0 0 8 7" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.06919 6.79995L2.66502 4.35969L0.666687 2.71837L3.30669 2.50127L4.33335 0.199951L5.36002 2.50127L8.00002 2.71837L6.00169 4.35969L6.59752 6.79995L4.33335 5.506L2.06919 6.79995Z" fill="#F2CE17"/></svg>
          ${game.rating}
        </div>
      </div>
      <div class="overlay__main">
        <div class="topInfo">
          <div class="gameinfo">
            <div>
              <div class="title"><h2 id="drawer-title">${title}</h2></div>
              <div class="shortDesc">${escapeHTML(game.description)}</div>
            </div>
          </div>
          <img src="${game.image}" alt="Spilæsken til ${title}" width="170" height="170" decoding="async">
        </div>
        <div class="info">
          <div class="boks">Type: <span>${escapeHTML(game.genre)}</span></div>
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
          <div class="boks">Placering i caféen: <span>Hylde ${escapeHTML(game.shelf)}</span></div>
        </div>
      </div>
      <div class="drawer">
        <button type="button" class="drawer-toggle" aria-expanded="false">
          <span class="drawHandle" aria-hidden="true"></span>
          <span>Vis spilleregler</span>
        </button>
        <p class="drawer-rules" hidden>${escapeHTML(game.rules)}</p>
      </div>
    </section>
  `;
  // Add overlay--active class after rendering for animation
  setTimeout(() => {
    const overlay = document.getElementById("drawerOverlay");
    if (overlay) {
      overlay.classList.add("overlay--active");
      overlay.focus();
    }
  }, 10);
}

function toggleDrawer() {
  const drawer = document.querySelector(".drawer");
  const button = drawer?.querySelector(".drawer-toggle");
  const rules = drawer?.querySelector(".drawer-rules");
  if (!drawer || !button || !rules) return;
  const open = !drawer.classList.contains("open");
  drawer.classList.toggle("open", open);
  button.setAttribute("aria-expanded", String(open));
  rules.hidden = !open;
}

function renderRatingStars(rating) {
  const active = Math.max(0, Math.min(6, Number(rating) || 0));
  const dice = Array.from({ length: 6 }, (_, index) =>
    `<span class="rating-die${index < active ? " is-active" : ""}" aria-hidden="true"></span>`
  ).join("");
  return `<span class="rating-dices" aria-label="Sværhedsgrad ${active} ud af 6">${dice}</span>`;
}

function closeDrawer() {
  const overlay = document.getElementById("drawerOverlay"); // FIX: id changed
  if (overlay) {
    overlay.classList.remove("overlay--active");
    // Remove overlay from DOM after transition
    setTimeout(() => {
      if (overlay.parentNode) overlay.parentNode.innerHTML = "";
      lastFocusedElement?.focus();
    }, 400); // match CSS transition duration
  }
}

drawHolder.addEventListener("click", (event) => {
  if (event.target.closest("[data-close-dialog]")) closeDrawer();
  if (event.target.closest(".drawer-toggle")) toggleDrawer();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && document.getElementById("drawerOverlay")) {
    closeDrawer();
  }
  if (
    event.key === "Escape" &&
    document.getElementById("shakePopup")?.style.display !== "none"
  ) {
    closeShakePopup();
  }
});

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
  } else {
    locationsForm.style.display = "none";
  }

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

const greenIcon = window.L ? L.icon({
  iconUrl: "./assets/img/logo.webp",
  iconSize: [50, 37],
  iconAnchor: [25, 37],
  popupAnchor: [0, -37],
}) : null;


function makeMap(lat, lon, zoom = 6) {
  if (!window.L) {
    document.getElementById("map")?.setAttribute("aria-label", "Kortet kunne ikke indlæses");
    return;
  }
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
  if (!chip || !chip.dataset.filter) return;

  const filter = chip.dataset.filter;

  filtersContainer
    .querySelectorAll(".chip")
    .forEach((c) => {
      c.classList.remove("active");
      c.setAttribute("aria-expanded", "false");
    });

  if (activeFilter === filter) {
    activeFilter = null;
    hideAllSubForms();
    return;
  }

  activeFilter = filter;
  chip.classList.add("active");
  chip.setAttribute("aria-expanded", "true");
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


