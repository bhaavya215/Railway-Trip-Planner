let map = L.map('map').setView([22.9734, 78.6569], 5);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

window.onload = () => {
    fetch('/api/stations')
        .then(res => res.json())
        .then(data => {
            const sourceSelect = document.getElementById('source');
            const destSelect = document.getElementById('destination');
            data.stations.forEach(station => {
                sourceSelect.innerHTML += `<option value="${station}">${station}</option>`;
                destSelect.innerHTML += `<option value="${station}">${station}</option>`;
            });
        });

    document.getElementById('findRoute').addEventListener('click', () => {
        const source = document.getElementById('source').value;
        const destination = document.getElementById('destination').value;

        fetch('/api/route', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ source, destination })
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                document.getElementById('output').innerHTML = `<div class="alert alert-danger">${data.error}</div>`;
                return;
            }

            let outputHTML = `<strong>Route:</strong> ${data.route.join(' → ')}<br>`;
            let totalDist = 0;

            data.details.forEach(segment => {
                outputHTML += `<br><strong>${segment.from} → ${segment.to}</strong><br>`;
                segment.trains.forEach(train => {
                    outputHTML += `Train: ${train.train_no} - ${train.train_name}<br>`;
                    outputHTML += `Departure: ${train.departure}, Arrival: ${train.arrival}<br>`;
                    outputHTML += `Distance: ${train.distance} km<br><br>`;
                    totalDist += train.distance;
                });
            });

            outputHTML += `<strong>Total Distance:</strong> ${totalDist} km`;
            document.getElementById('output').innerHTML = outputHTML;

            // Map update
            map.eachLayer(layer => {
                if (layer instanceof L.Marker || layer instanceof L.Polyline) {
                    map.removeLayer(layer);
                }
            });

            let latlngs = [];
            data.coordinates.forEach(coord => {
                latlngs.push([coord.lat, coord.lng]);
                L.marker([coord.lat, coord.lng]).addTo(map);
            });

            if (latlngs.length > 1) {
                L.polyline(latlngs, { color: 'blue' }).addTo(map);
                map.fitBounds(L.polyline(latlngs).getBounds());
            }
        });
    });
};