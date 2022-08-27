
// Store our API endpoint as queryUrl
var queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2014-01-01&endtime=" +
  "2014-01-02&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";

// Perform a GET request to the query URL
d3.json(queryUrl).then(function(data) {
    console.log(data.features);

    // 1. Send the data.features object to the createFeatures function 
    makeMap(data.features);
});


function makeMap(features) {

  // STEP 1: Initialize the Base Layers
  // Define streetmap and darkmap layers
    var streetmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        accessToken: API_KEY
        });

    var satellite = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
          attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
          maxZoom: 18,
          id: 'mapbox/satellite-streets-v11',
          accessToken: API_KEY
      });

    // make earthquake layer here
    var earthquakeLayer = L.geoJSON(features, {
      onEachFeature: onEachFeature
    });

    // Step 3 - CREATE LAYER DICTIONARIES
  
    // Define a baseMaps object to hold our base layers
    var baseMaps = {
      "Streets": streetmap,
      "Satellite": satellite,
      "Dark": dark
    };
      // Overlays that may be toggled on or off
    var overlayMaps = {
        "Earthquakes": earthquakeLayer
    };

    // STEP 4 = INIT THE MAP
    // Create a new map
    var myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 5,
        layers: [streetmap, earthquakeLayer]
    });

    // STEP 5: Layer Control
    // Create a layer control, containing our baseMaps and overlayMaps, and add them to the map
    L.control.layers(baseMaps, overlayMaps).addTo(myMap);

}


function onEachFeature(features, layer) {
  // does this feature have a property named popupContent?
  if (feature.properties && feature.properties.title && feature.properties.time) {
      let date = new Date(feature.properties.time);
      layer.bindPopup(`<h1>${feature.properties.title}</h1><hr><h3>Time: ${date.toLocaleString()}</h3>`);
  }
}