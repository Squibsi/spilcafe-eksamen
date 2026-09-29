let map = null;
let markers = [];

// document.getElementById("by").addEventListener("change", selectTown);

const greenIcon = L.icon({
  iconUrl: "../assets/img/logo.webp",
  iconSize: [50, 37],
});
// iconAnchor: [16, 32],
//shadowUrl: "../assets/img/logo.webp",

// Central data source
const locations = [
  {
    id: "aalborg",
    name: "Aalborg",
    address: "Bredgade 3, 9000 Aalborg",
    lat: 57.0488,
    lon: 9.9217,
    zoom: 13
  },
  {
    id: "aarhus-vestergade",
    name: "Vestergade",
    address: "Vestergade 58A, 8000 Aarhus",
    lat: 56.1589,
    lon: 10.2046,
    zoom: 15
  },
  {
    id: "aarhus-fredensgade",
    name: "Fredensgade",
    address: "Fredensgade 38, 8000 Aarhus",
    lat: 56.162939,
    lon: 10.203921,
    zoom: 15
  },
  {
    id: "kolding",
    name: "Kolding",
    address: "Jernbanegade 11, 6000 Kolding",
    lat: 55.4904,
    lon: 9.4722,
    zoom: 13
  },
  {
    id: "odense",
    name: "Odense",
    address: "Slotsgade 26A, 5000 Odense",
    lat: 55.4038,
    lon: 10.4024,
    zoom: 13
  }
];

// const locationCoords = {
//   "aarhus-fredensgade": { lat: 56.16294, lng: 10.20392, zoom: 15 },
//   "aarhus-vestergade": { lat: 56.1589, lng: 10.2046, zoom: 15 },
//   "odense": { lat: 55.4038, lng: 10.4024, zoom: 13 },
//   "kolding": { lat: 55.4904, lng: 9.4722, zoom: 13 },
//   "aalborg": { lat: 57.0488, lng: 9.9217, zoom: 13 }
// };

function makeMap(lat, lon, zoom = 6) {
  if (!map) {
    map = L.map("map").setView([lat, lon], zoom);
    // Expose map on window so other scripts can call methods like invalidateSize()
    window.map = map;
    // Also expose the factory so other scripts can initialize the map lazily
    window.makeMap = makeMap;


    //map in black and white
    //L.tileLayer("https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png", {
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add markers once
    locations.forEach(loc => {
      const marker = L.marker([loc.lat, loc.lon], { icon: greenIcon })
        .addTo(map)
        .bindPopup(loc.address);

      markers.push(marker);
    });
  }

  map.flyTo([lat, lon], zoom, {
    duration: 8,
    easeLinearity: 1,
  });
}


function selectTown() {
  const value = document.getElementById("by").value;

  if (value === "currentPos") {
    navigator.geolocation?.getCurrentPosition(pos => {
      makeMap(pos.coords.latitude, pos.coords.longitude, 13);
    });
    return;
  }

  const location = locations.find(l => l.id === value);
  if (!location) return;

  makeMap(location.lat, location.lon, location.zoom);
}


// NOTE: Do NOT auto-init the map here. Initialize lazily when the locations
// panel is shown to avoid Leaflet rendering issues when the container is hidden.
// If you want to auto-init, call `makeMap(56.4, 10.203921)` from another script.
