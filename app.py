from flask import Flask, jsonify, render_template, request
import pandas as pd
import os
from collections import deque, defaultdict
import numpy as np

app = Flask(__name__)

# Load CSV
basedir = os.path.abspath(os.path.dirname(__file__))
csv_path = os.path.join(basedir, 'data', 'trains.csv')
df = pd.read_csv(csv_path, encoding='utf-8')

# Load and merge coordinates
coord_path = os.path.join(basedir, 'data', 'station_coordinates.csv')
coords_df = pd.read_csv(coord_path)
df = df.merge(coords_df, on=['Station Code', 'Station Name'], how='left')


# Fix NumPy types for JSON
def make_jsonable(obj):
    if isinstance(obj, (np.int64, np.int32)):
        return int(obj)
    elif isinstance(obj, (np.float64, np.float32)):
        return float(obj)
    elif isinstance(obj, pd.Timestamp):
        return str(obj)
    return obj


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/stations')
def get_stations():
    stations = sorted(df['Station Name'].dropna().unique())
    return jsonify({'stations': stations})


@app.route('/api/route', methods=['POST'])
def get_route():
    data = request.get_json()
    source = data.get('source')
    destination = data.get('destination')

    if not source or not destination:
        return jsonify({'error': 'Missing source or destination'}), 400

    path = bfs_route(df, source, destination)

    if not path:
        return jsonify({'error': 'No route found'}), 404

    detailed_route = get_train_segments(df, path)

    # Use real coordinates
    coordinates = []
    for station in path:
        row = df[df['Station Name'] == station].dropna(subset=['Latitude', 'Longitude'])
        if not row.empty:
            lat = float(row.iloc[0]['Latitude'])
            lng = float(row.iloc[0]['Longitude'])
            coordinates.append({'lat': lat, 'lng': lng})
        else:
            coordinates.append({'lat': 0.0, 'lng': 0.0})  # fallback

    # Ensure all values are JSON serializable
    details_jsonable = []
    for seg in detailed_route:
        segment = {
            'from': seg['from'],
            'to': seg['to'],
            'trains': [{
                key: make_jsonable(value) for key, value in train.items()
            } for train in seg['trains']]
        }
        details_jsonable.append(segment)

    return jsonify({'route': path, 'coordinates': coordinates, 'details': details_jsonable})


def bfs_route(df, source, destination):
    graph = defaultdict(set)
    for train_no in df['Train No'].unique():
        stations = df[df['Train No'] == train_no]['Station Name'].tolist()
        for i in range(len(stations) - 1):
            graph[stations[i]].add(stations[i + 1])
            graph[stations[i + 1]].add(stations[i])
    visited = set()
    queue = deque([[source]])
    while queue:
        path = queue.popleft()
        current = path[-1]
        if current == destination:
            return path
        if current not in visited:
            visited.add(current)
            for neighbor in graph[current]:
                if neighbor not in visited:
                    queue.append(path + [neighbor])
    return None


def get_train_segments(df, path):
    segments = []
    for i in range(len(path) - 1):
        from_station, to_station = path[i], path[i + 1]
        direct_trains = df[(df['Station Name'] == from_station) | (df['Station Name'] == to_station)]
        trains = []
        for train_no in direct_trains['Train No'].unique():
            route = df[df['Train No'] == train_no]
            if from_station in route['Station Name'].values and to_station in route['Station Name'].values:
                s1 = route[route['Station Name'] == from_station].iloc[0]
                s2 = route[route['Station Name'] == to_station].iloc[0]
                if s1['SEQ'] < s2['SEQ']:
                    trains.append({
                        'train_no': train_no,
                        'train_name': s1['Train Name'],
                        'from': from_station,
                        'to': to_station,
                        'departure': s1['Departure Time'],
                        'arrival': s2['Arrival time'],
                        'distance': abs(s2['Distance'] - s1['Distance'])
                    })
        if trains:
            segments.append({'from': from_station, 'to': to_station, 'trains': trains})
    return segments


if __name__ == '__main__':
    app.run(debug=True, port=8000)
