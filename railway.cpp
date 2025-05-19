#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <queue>
#include <limits> // For numeric_limits
#include <algorithm> // For std::find

using namespace std;

// Structure to represent a railway station
struct Station {
    string name;
};

// Structure to represent a train route (edge in the graph) with details
struct Route {
    int destination;       // Index of the destination station
    string trainNumber;
    string departureTime;
    string arrivalTime;
    double distance;       // in kilometers
};

// Helper function to convert time strings to minutes since 00:00
int timeToMinutes(const string& time) {
    int hours = stoi(time.substr(0, 2));
    int minutes = stoi(time.substr(3, 2));
    return hours * 60 + minutes;
}

// Helper function to calculate travel time in minutes
int calculateTravelTime(const string& departure, const string& arrival) {
    int depTime = timeToMinutes(departure);
    int arrTime = timeToMinutes(arrival);
    return (arrTime >= depTime) ? arrTime - depTime : (1440 - depTime + arrTime);
}

int main() {
    // 1. Define the railway stations
    vector<Station> stations = {
        {"Delhi"},     // Index 0
        {"Meerut"},    // Index 1
        {"Dehradun"},  // Index 2
        {"Saharanpur"} // Index 3
    };

    // 2. Represent the railway network using an adjacency list
    unordered_map<int, vector<Route>> adjList;

    // Add routes with details:
    adjList[0].push_back({1, "12035", "14:00", "15:30", 70.0}); // Delhi to Meerut
    adjList[0].push_back({3, "14001", "10:00", "12:00", 180.0}); // Delhi to Saharanpur
    adjList[1].push_back({0, "12036", "16:00", "17:30", 70.0}); // Meerut to Delhi
    adjList[1].push_back({2, "14681", "16:00", "19:00", 160.0}); // Meerut to Dehradun
    adjList[2].push_back({1, "14682", "20:00", "23:00", 160.0}); // Dehradun to Meerut
    adjList[3].push_back({0, "14002", "18:00", "20:00", 180.0}); // Saharanpur to Delhi
    adjList[3].push_back({1, "14521", "08:00", "10:30", 110.0}); // Saharanpur to Meerut

    // 3. Get the start and end stations from the user
    string startStationName, endStationName;

    cout << "Enter the starting station: ";
    getline(cin >> ws, startStationName);

    cout << "Enter the destination station: ";
    getline(cin >> ws, endStationName);

    // 4. Find the indices of the start and end stations
    int startIndex = -1;
    int endIndex = -1;

    for (int i = 0; i < stations.size(); ++i) {
        if (stations[i].name == startStationName) {
            startIndex = i;
        }
        if (stations[i].name == endStationName) {
            endIndex = i;
        }
    }

    // 5. Check if the start and end stations exist
    if (startIndex == -1 || endIndex == -1) {
        cout << "Error: One or both of the specified stations not found." << endl;
        return 1;
    }

    // 6. BFS to find all routes from start to end station
    queue<vector<int>> paths; // Queue to store paths as sequences of station indices
    paths.push({startIndex});

    double totalDistance = 0.0;
    int totalTime = 0;
    bool routeFound = false;

    cout << "\nFinding routes from " << startStationName << " to " << endStationName << "...\n";

    while (!paths.empty()) {
        vector<int> currentPath = paths.front();
        paths.pop();

        int currentStation = currentPath.back();

        if (currentStation == endIndex) {
            // Display the complete path
            routeFound = true;
            cout << "\nRoute Found:\n";
            double routeDistance = 0.0;
            int routeTime = 0;

            for (size_t i = 0; i < currentPath.size() - 1; ++i) {
                int from = currentPath[i];
                int to = currentPath[i + 1];

                for (const auto& route : adjList[from]) {
                    if (route.destination == to) {
                        cout << "\nStation Details:\n";
                        cout << "  From Station: " << stations[from].name << endl;
                        cout << "  To Station: " << stations[to].name << endl;
                        cout << "  Train Number: " << route.trainNumber << endl;
                        cout << "  Departure Time: " << route.departureTime << endl;
                        cout << "  Arrival Time: " << route.arrivalTime << endl;
                        cout << "  Distance: " << route.distance << " km\n";

                        routeDistance += route.distance;
                        routeTime += calculateTravelTime(route.departureTime, route.arrivalTime);
                        break;
                    }
                }
            }
            cout << "\nTotal Journey Details:\n";
            cout << "  Total Distance: " << routeDistance << " km\n";
            cout << "  Total Travel Time: " << routeTime / 60 << " hours " << routeTime % 60 << " minutes\n";
            continue;
        }

        // Explore adjacent stations
        if (adjList.count(currentStation)) {
            for (const auto& route : adjList[currentStation]) {
                if (find(currentPath.begin(), currentPath.end(), route.destination) == currentPath.end()) {
                    vector<int> newPath = currentPath;
                    newPath.push_back(route.destination);
                    paths.push(newPath);
                }
            }
        }
    }

    if (!routeFound) {
        cout << "No routes found from " << startStationName << " to " << endStationName << ".\n";
    }

    return 0;
}