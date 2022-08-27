// Add console.log to check to see if our code is working.
console.log("working");

// We create the tile layer that will be the background of our map.
let streets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    accessToken: API_KEY
});

// Store our API endpoint as queryUrl
var queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2014-01-01&endtime=" +
    "2014-01-02&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";

// Perform a GET request to the query URL
d3.json(queryUrl).then(function(data) {
    console.log(data.features);

    // 1. Send the data.features object to the createFeatures function 
    makeMap(data.features);
});

// Create the map object with a center and zoom level.
let map = L.map('mapid', {
    center: [
      40.7, -94.5
    ],
    zoom: 4
  });
// We create the tile layer that will be the background of our map.
//  Add a marker to the map for Los Angeles, California.
let marker = L.marker([34.0522, -118.2437], {
radius: 300,
color: "black",
fillColor: '#ffffa1'
}).addTo(map);



// Then we add our 'graymap' tile layer to the map.
streets.addTo(map);