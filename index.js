// Initialize the platform object:
var platform = new H.service.Platform({
    'apikey': 'WpGl94v7XCZKZj1G0WAmev-yvMvZ65Olj24cfbiJYyE'
});

// Obtain the default map types from the platform object
var maptypes = platform.createDefaultLayers();

// Instantiate (and display) a map object:
var map = new H.Map(
    document.getElementById('mapContainer'),
    maptypes.vector.normal.map,
    {
        zoom: 10,
        center: { lng: 77.1025, lat: 28.7041 } // Delhi's Coordinates
    }
);

// Create the default UI components
var ui = H.ui.UI.createDefault(map, maptypes);

// Enable the event system on the map instance:
var mapEvents = new H.mapevents.MapEvents(map);

// Add event listeners:
map.addEventListener('tap', function (evt) {
    // Log 'tap' and 'mouse' events:
    console.log(evt.type, evt.currentPointer.type);
});

// Instantiate the default behavior, providing the mapEvents object: 
var behavior = new H.mapevents.Behavior(mapEvents);

// Example: Add a marker for Delhi
var marker = new H.map.Marker({ lat: 28.7041, lng: 77.1025 });
map.addObject(marker);

// Function to fetch auto-suggestions
function getAutoSuggestions() {
    var query = document.getElementById('searchQuery').value;
    if (query.length < 3) { // Wait for at least 3 characters before suggesting
        document.getElementById('suggestions').innerHTML = '';
        return;
    }

    var autosuggestService = platform.getSearchService(),
        params = {
            q: query,
            at: '28.7041,77.1025', // Center the suggestions around Delhi
            in: 'countryCode:IND'
        };

    autosuggestService.autosuggest(params, (result) => {
        // Display the suggestions
        var suggestionsContainer = document.getElementById('suggestions');
        suggestionsContainer.innerHTML = ''; // Clear previous suggestions
        result.items.forEach((item) => {
            var div = document.createElement('div');
            div.innerHTML = item.title;
            div.onclick = function () {
                document.getElementById('searchQuery').value = item.title;
                suggestionsContainer.innerHTML = ''; // Clear suggestions
                searchPlaces(); // Optionally trigger the search immediately
            };
            suggestionsContainer.appendChild(div);
        });
    }, (error) => {
        console.error(error);
    });
}


// Function to search places and display on the map
function searchPlaces() {
    var searchQuery = document.getElementById('searchQuery').value;
    var searchService = platform.getSearchService();

    searchService.geocode({
        q: searchQuery,
        in: 'countryCode:IND'
    }, (result) => {
        // Assume the first result is the most relevant
        var position = result.items[0].position;
        var marker = new H.map.Marker(position);
        map.addObject(marker);
        map.setCenter(position);

        // Optionally, start routing from a fixed point to the searched place
        calculateRouteFromAtoB(platform, { lat: 28.7041, lng: 77.1025 }, position);
    }, alert);
}

// Function to calculate and display a route from point A to point B
function calculateRouteFromAtoB(platform, startPoint, endPoint) {
    var router = platform.getRoutingService(null, 8),
        routeRequestParams = {
            routingMode: 'fast',
            transportMode: 'truck',
            origin: `${startPoint.lat},${startPoint.lng}`, // Starting point
            destination: `${endPoint.lat},${endPoint.lng}`, // Ending point
            return: 'polyline'
        };

    router.calculateRoute(
        routeRequestParams,
        onSuccess,
        onError
    );
}

// Function to handle the initial car route calculation
function onCarRouteSuccess(result) {
    var route = result.routes[0];
    var lineString = H.geo.LineString.fromFlexiblePolyline(route.sections[0].polyline);

    // Create a polyline to display the car route:
    var carRouteLine = new H.map.Polyline(lineString, {
        style: { strokeColor: 'blue', lineWidth: 3 }
    });

    // Add the car route polyline to the map:
    map.addObjects([carRouteLine]);

    // Calculate an optimized ambulance route based on real-time traffic
    calculateAmbulanceRoute(platform, route, carRouteLine);
}

// Function to calculate an optimized ambulance route based on real-time traffic
function calculateAmbulanceRoute(platform, carRoute, carRouteLine) {
    var router = platform.getRoutingService(null, 8),
        routeRequestParams = {
            routingMode: 'fast',
            transportMode: 'car',
            origin: `${carRoute.sections[0].departure.place.location.lat},${carRoute.sections[0].departure.place.location.lng}`, // Starting point
            destination: `${carRoute.sections[0].arrival.place.location.lat},${carRoute.sections[0].arrival.place.location.lng}`, // Ending point
            return: 'polyline,turnByTurnActions,actions,instructions,travelSummary',
            departure: 'now',
            vehicleLoadType: 'emergencyVehicle'
        };

    router.calculateRoute(
        routeRequestParams,
        onAmbulanceRouteSuccess,
        onError
    );
}

function onAmbulanceRouteSuccess(result) {
    var route = result.routes[0];
    var lineString = H.geo.LineString.fromFlexiblePolyline(route.sections[0].polyline);

    // Create a polyline to display the ambulance route:
    var ambulanceRouteLine = new H.map.Polyline(lineString, {
        style: { strokeColor: 'red', lineWidth: 3 }
    });

    // Add the ambulance route polyline to the map:
    map.addObjects([ambulanceRouteLine]);

    // Set the map's viewport to make the whole ambulance route visible:
    map.getViewModel().setLookAtData({ bounds: ambulanceRouteLine.getBoundingBox() });
}

function onError(error) {
    alert('Can\'t reach the remote server');
}

function onSuccess(result) {
    var route = result.routes[0];
    var lineString = H.geo.LineString.fromFlexiblePolyline(route.sections[0].polyline);

    // Create a polyline to display the route:
    var routeLine = new H.map.Polyline(lineString, {
        style: { strokeColor: 'blue', lineWidth: 3 }
    });

    // Add the route polyline and the two markers to the map:
    map.addObjects([routeLine]);

    // Set the map's viewport to make the whole route visible:
    map.getViewModel().setLookAtData({ bounds: routeLine.getBoundingBox() });
}

function onError(error) {
    alert('Can\'t reach the remote server');
}
