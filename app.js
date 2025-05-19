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

const trainData = [
  {
    source: "Delhi",
    destination: "Dehradun",
    route: ["Delhi", "Meerut", "Saharanpur", "Roorkee", "Haridwar", "Dehradun"],
    trains: [
      { name: "Shatabdi Express", number: "12017", departure: "06:45 AM", arrival: "12:45 PM", duration: "6 hrs" },
      { name: "Nanda Devi Express", number: "12205", departure: "11:50 PM", arrival: "05:40 AM", duration: "5 hrs 50 mins" }
    ]
  },
  {
    source: "Mumbai",
    destination: "Delhi",
    route: ["Mumbai", "Pune", "Delhi"],
    trains: [
      { name: "Rajdhani Express", number: "12951", departure: "04:00 PM", arrival: "08:00 AM", duration: "16 hrs" }
    ]
  },
  {
    source: "Kolkata",
    destination: "Delhi",
    route: ["Kolkata", "Delhi"],
    trains: [
      { name: "Poorva Express", number: "12381", departure: "08:00 AM", arrival: "06:00 AM (next day)", duration: "22 hrs" }
    ]
  },
  {
    source: "Kerala",
    destination: "Mumbai",
    route: ["Kerala", "Pune", "Mumbai"],
    trains: [
      { name: "Netravati Express", number: "16346", departure: "11:00 AM", arrival: "07:00 AM (next day)", duration: "20 hrs" }
    ]
  },
  {
    source: "Dehradun",
    destination: "Delhi",
    route: ["Dehradun", "Haridwar", "Roorkee", "Saharanpur", "Meerut", "Delhi"],
    trains: [
      { name: "Vande Bharat", number: "290102", departure: "07:00 AM", arrival: "12:00 PM", duration: "5 hrs" },
      { name: "Shatabdi Express", number: "12017", departure: "05:00 AM", arrival: "11:00 PM", duration: "6 hrs"  }
    ]
  },
];

function findRoute() {
  // Remove old markers/routes
  markers.forEach(m => map.removeLayer(m));
  routes.forEach(r => map.removeLayer(r));
  markers = [];
  routes = [];

  let src = document.getElementById('source').value;
  let dest = document.getElementById('destination').value;

  if (!src || !dest || src === dest) {
    alert("Please select valid and different source & destination!");
    return;
  }

  let result = trainData.find(t => t.source === src && t.destination === dest);

  let tableBody = document.getElementById('trainData');
  tableBody.innerHTML = "";

  if (result) {
    // Show train details
    result.trains.forEach(train => {
      let row = `<tr>
        <td>${train.name}</td>
        <td>${train.number}</td>
        <td>${train.departure}</td>
        <td>${train.arrival}</td>
        <td>${train.duration}</td>
      </tr>`;
      tableBody.innerHTML += row;
    });

    // Plot route on map
    let latlngs = result.route.map(station => {
      let coord = stationCoords[station];
      let marker = L.marker(coord).addTo(map).bindPopup(`<b>${station}</b>`);
      markers.push(marker);
      return coord;
    });

    let polyline = L.polyline(latlngs, { color: 'blue', weight: 4 }).addTo(map);
    routes.push(polyline);

    map.fitBounds(polyline.getBounds());

  } else {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: red;">No train available for this route.</td></tr>`;
  }
}