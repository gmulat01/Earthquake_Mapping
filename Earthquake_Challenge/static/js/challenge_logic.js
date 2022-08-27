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

  // We create the tile layer that will be the background of our map.
    let streetmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox/streets-v11',
      accessToken: API_KEY
      });

  // We create the second tile layer that will be the background of our map.
    let satellite = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox/satellite-streets-v11',
      accessToken: API_KEY
      });

    // Create a new map
    let map = L.map("map", {
      center: [37.09, -95.71],
      zoom: 5,
      layers: [streetmap]
    });

    // Define a baseMaps object to hold our base layers
    let baseMaps = {
      "Streets": streetmap,
      "Satellite": satellite,
    };

    //Add a 2nd layer group for the tectonic plate data.
    let allEarthquakes = new L.LayerGroup();
    let tectonicPlates = new L.LayerGroup();
    let majorEarthquakes = new L.LayerGroup();

    let overlayMaps = {
      "Tectonic Plates": tectonicPlates,
      "Earthquakes": allEarthquakes,
      "Major Earthquakes": majorEarthquakes
    };

  // Then we add a control to the map that will allow the user to change which
  // layers are visible.
  L.control.layers(baseMaps, overlayMaps).addTo(map);

  // Retrieve the earthquake GeoJSON data.
  d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function(data) {

    // This function returns the style data for each of the earthquakes we plot on
    // the map. We pass the magnitude of the earthquake into two separate functions
    // to calculate the color and radius.
    function styleInfo(features) {
      return {
        opacity: 1,
        fillOpacity: 1,
        fillColor: getColor(features.properties.mag),
        color: "#000000",
        radius: getRadius(features.properties.mag),
        stroke: true,
        weight: 0.5
      };
    }

    // This function determines the color of the marker based on the magnitude of the earthquake.
    function getColor(magnitude) {
      if (magnitude > 5) {
        return "#ea2c2c";
      }
      if (magnitude > 4) {
        return "#ea822c";
      }
      if (magnitude > 3) {
        return "#ee9c00";
      }
      if (magnitude > 2) {
        return "#eecc00";
      }
      if (magnitude > 1) {
        return "#d4ee00";
      }
      return "#98ee00";
    }

    // This function determines the radius of the earthquake marker based on its magnitude.
    // Earthquakes with a magnitude of 0 were being plotted with the wrong radius.
    function getRadius(magnitude) {
      if (magnitude === 0) {
        return 1;
      }
      return magnitude * 4;
    }

    // Creating a GeoJSON layer with the retrieved data.
    L.geoJson(data, {
        // We turn each feature into a circleMarker on the map.
        pointToLayer: function(features, latlng) {
            console.log(data);
            return L.circleMarker(latlng);
          },
        // We set the style for each circleMarker using our styleInfo function.
      style: styleInfo,
      // We create a popup for each circleMarker to display the magnitude and location of the earthquake
      //  after the marker has been created and styled.
      onEachFeature: function(features, layer) {
        layer.bindPopup("Magnitude: " + features.properties.mag + "<br>Location: " + features.properties.place);
      }
    }).addTo(allEarthquakes);

    // Then we add the earthquake layer to our map.
    allEarthquakes.addTo(map);
  
    // Retrieve the major earthquake GeoJSON data >4.5 mag for the week.
    d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson").then(function(data) {
    // Use the same style as the earthquake data.
    function styleInfo(feature) {
      return {
        opacity: 1,
        fillOpacity: 1,
        fillColor: getColor(feature.properties.mag),
        color: "#000000",
        radius: getRadius(feature.properties.mag),
        stroke: true,
        weight: 0.5
      };
    }
  // Change the color function to use three colors for the major earthquakes based on the magnitude of the earthquake.
  function getColor(magnitude) {
    if (magnitude > 6) {
      return "#ea2c2c";
    }
    if (magnitude > 5) {
      return "#ea822c";
    }
    return "#eecc00";
  }

  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }
    return magnitude * 4;
  }

  L.geoJson(data, {
    // We turn each feature into a circleMarker on the map.
    pointToLayer: function(features, latlng) {
        console.log(data);
        return L.circleMarker(latlng);
      },
    // We set the style for each circleMarker using our styleInfo function.
  style: styleInfo,
  // We create a popup for each circleMarker to display the magnitude and location of the earthquake
  //  after the marker has been created and styled.
  onEachFeature: function(features, layer) {
    layer.bindPopup("Magnitude: " + features.properties.mag + "<br>Location: " + features.properties.place);
  }
  }).addTo(majorEarthquakes);

  //Add the major earthquakes layer to the map.
  majorEarthquakes.addTo(map);
  });

  // Here we create a legend control object.
  let legend = L.control({
    position: "bottomright"
  });

  // Then add all the details for the legend
  legend.onAdd = function() {
    let div = L.DomUtil.create("div", "info legend");

    const magnitudes = [0, 1, 2, 3, 4, 5];
    const colors = [
      "#98ee00",
      "#d4ee00",
      "#eecc00",
      "#ee9c00",
      "#ea822c",
      "#ea2c2c"
    ];

  // Looping through our intervals to generate a label with a colored square for each interval.
    for (var i = 0; i < magnitudes.length; i++) {
      console.log(colors[i]);
      div.innerHTML +=
        "<i style='background: " + colors[i] + "'></i> " +
        magnitudes[i] + (magnitudes[i + 1] ? "&ndash;" + magnitudes[i + 1] + "<br>" : "+");
      }
      return div;
    };

    // Finally, we our legend to the map.
    legend.addTo(map);


    // Use d3.json to make a call to get our Tectonic Plate geoJSON data.
    d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function(platedata) {
        // Adding our geoJSON data, along with style information, to the tectonicplates
        // layer.
        L.geoJson(platedata,
          //  {
          // color: "#ff6500",
          // weight: 2
        // }
        )
        .addTo(tectonicPlates);

        // Then add the tectonicplates layer to the map.
        tectonicPlates.addTo(map);
      });
  });
}