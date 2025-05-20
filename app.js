let map = L.map('map').setView([22.0, 80.0], 5);

const baseTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '©️ OpenStreetMap contributors'
});

baseTiles.addTo(map);

let markers = [];
let routes = [];

const stationCoords = {
  "Delhi": [28.6139, 77.2090],
  "Mumbai": [19.0760, 72.8777],
  "Kolkata": [22.5726, 88.3639],
  "Pune": [18.5204, 73.8567],
  "Kerala": [8.5241, 76.9366],
  "Dehradun": [30.3165, 78.0322],
  "Haridwar": [29.9457, 78.1642],
  "Meerut": [28.9845, 77.7064],
  "Saharanpur": [29.9640, 77.5460],
  "Roorkee": [29.8543, 77.8880]
};

// Atomic legs between stations with train info
const legs = [
  {
    from: "Delhi",
    to: "Meerut",
    train: "12001",
    departure: "06:00 AM",
    arrival: "07:30 AM",
    distance: "70 km",
  },
  {
    from: "Meerut",
    to: "Dehradun",
    train: "12002",
    departure: "08:00 AM",
    arrival: "11:00 AM",
    distance: "140 km",
  },
  {
    from: "Meerut",
    to: "Saharanpur",
    train: "12003",
    departure: "08:15 AM",
    arrival: "09:45 AM",
    distance: "90 km",
  },
  {
    from: "Saharanpur",
    to: "Roorkee",
    train: "12004",
    departure: "10:00 AM",
    arrival: "10:45 AM",
    distance: "40 km",
  },
  {
    from: "Roorkee",
    to: "Haridwar",
    train: "12005",
    departure: "11:00 AM",
    arrival: "11:30 AM",
    distance: "30 km",
  },
  {
    from: "Haridwar",
    to: "Dehradun",
    train: "12006",
    departure: "12:00 PM",
    arrival: "01:00 PM",
    distance: "55 km",
  },
  {
    from: "Delhi",
    to: "Pune",
    train: "13001",
    departure: "06:00 PM",
    arrival: "07:00 AM",
    distance: "1500 km",
  },
  {
    from: "Pune",
    to: "Mumbai",
    train: "13002",
    departure: "08:00 AM",
    arrival: "11:00 AM",
    distance: "150 km",
  },
  {
    from: "Mumbai",
    to: "Delhi",
    train: "13003",
    departure: "01:00 PM",
    arrival: "05:00 AM",
    distance: "1400 km",
  },
  {
    from: "Kolkata",
    to: "Delhi",
    train: "14001",
    departure: "08:00 AM",
    arrival: "06:00 AM (next day)",
    distance: "1500 km",
  },
  {
    from: "Dehradun",
    to: "Saharanpur",
    train: "15001",
    departure: "11:00 AM",
    arrival: "02:00 PM",
    distance: "150 km",
  },
  {
    from: "Saharanpur",
    to: "Delhi",
    train: "15003",
    departure: "02:30 PM",
    arrival: "5:30 PM",
    distance: "120 km",
  },
  {
    from: "Meerut",
    to: "Kolkata",
    train: "15007",
    departure: "09:00 AM",
    arrival: "10:00 AM (next day)",
    distance: "1400 km",
  },
  {
    from: "Mumbai",
    to: "Kerala",
    train: "17005",
    departure: "12:00 PM",
    arrival: "10:00 AM (next day)",
    distance: "1600 km",
  }
];

function findMultiLegRoute(source, destination) {
  let results = [];
  let visited = new Set();

  function dfs(current, path) {
    if (current === destination) {
      results.push([...path]);
      return;
    }
    visited.add(current);

    for (let leg of legs) {
      if (leg.from === current && !visited.has(leg.to)) {
        path.push(leg);
        dfs(leg.to, path);
        path.pop();
      }
    }
    visited.delete(current);
  }

  dfs(source, []);
  return results.length > 0 ? results[0] : null; // first found route
}

function clearMapAndTable() {
  markers.forEach(m => map.removeLayer(m));
  routes.forEach(r => map.removeLayer(r));
  markers = [];
  routes = [];
  document.getElementById("trainData").innerHTML = "";
}

function showRoute(routeLegs) {
  clearMapAndTable();

  let latlngs = [];

  routeLegs.forEach((leg) => {
    let fromCoord = stationCoords[leg.from];
    let toCoord = stationCoords[leg.to];

    if (fromCoord) {
      let markerFrom = L.marker(fromCoord).addTo(map).bindPopup(`<b>${leg.from}</b>`);
      markers.push(markerFrom);
      latlngs.push(fromCoord);
    }
    if (toCoord) {
      let markerTo = L.marker(toCoord).addTo(map).bindPopup(`<b>${leg.to}</b>`);
      markers.push(markerTo);
      latlngs.push(toCoord);
    }

    // Table row per leg
    let row = `<tr>
      <td>${leg.from}</td>
      <td>${leg.to}</td>
      <td>${leg.train}</td>
      <td>${leg.departure}</td>
      <td>${leg.arrival}</td>
      <td>${leg.distance}</td>
    </tr>`;
    document.getElementById("trainData").innerHTML += row;

    // Draw polyline for this leg
    let polyline = L.polyline([fromCoord, toCoord], { color: 'blue', weight: 4 }).addTo(map);
    routes.push(polyline);
  });

  map.fitBounds(L.latLngBounds(latlngs));
}

function findRoute() {
  let src = document.getElementById("source").value;
  let dest = document.getElementById("destination").value;

  if (!src || !dest || src === dest) {
    alert("Please select valid and different source & destination!");
    return;
  }

  let route = findMultiLegRoute(src, dest);

  if (route) {
    alert("Route found!");
    showRoute(route);
  } else {
    alert("No route found connecting these stations.");
    clearMapAndTable();
  }
}