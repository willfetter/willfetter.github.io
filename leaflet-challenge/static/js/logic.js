// Create the 'basemap' tile layer that will be the background of our map.
var defaultMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Greyscale layer
var grayscale = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.{ext}', {
  minZoom: 0,
  maxZoom: 20,
  attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  ext: 'png'
});

// World imagery layer
var aerial = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  minZoom: 0,
  maxZoom: 20,
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

// Topo layer
var topoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Watercolor Layer
var waterColor = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.{ext}', {
  minZoom: 1,
  maxZoom: 16,
  attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  ext: 'jpg'
});

// Make a basemap object
let basemaps = {
  Default: defaultMap,
  Grayscale: grayscale,
  Aerial: aerial,
  TopMap: topoMap,
  "Water Color": waterColor
};

// Create the map object with center and zoom options. 
// Center on California as this is where many earthquakes happen in US
var myMap = L.map("map", {
  center: [36.7783, -119.4179],
  zoom: 5,
  layers: [grayscale, aerial, topoMap, waterColor, defaultMap]
});

// Add default tile layer to the map.
defaultMap.addTo(myMap);

// Get data for the tectonic plates and draw on the map
// Variable to hold the tectonic plates layers
let tectonicplates = new L.layerGroup();

// Call the API to get the info for the tectonic plates
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json")
.then(function(plateData){
  // Load the data using geoJson and add to the tectonic plates using layer group
  L.geoJson(plateData, {
    // Add styling to make the lines visible
    color: "yellow",
    weight: 1
  }).addTo(tectonicplates);
});

// Add the tectonic plates to the map
tectonicplates.addTo(myMap);

// Variable to hold the earthquake data layer
let earthquakes = new L.layerGroup();

// Get the data for the earthquakes and populate the layer group
// Make a call to USGS GeoJson API
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson")
.then(function(earthquakeData){
  // Function that chooses the color of the data point
  function dataColor(depth){
    if (depth > 90)
      return "red";
    else if(depth > 70)
      return "#fc4903";
    else if(depth > 50)
      return "#fc8403";
    else if(depth > 30)
      return "#fcad03";
    else if(depth > 10)
      return "#cafc03";
    else 
      return "green";
  } 

  // Function that determines the size of the radius
  function radiusSize(mag){
    if (mag == 0)
      return 1; // Makes sure that a 0 mag earthquake shows up
    else
      return mag * 5; // Makes sure that the circle is pronounced on the map
  }

  // Add the style for each data point
  function dataStyle(feature){
    return {
      opacity: 0.5,
      fillOpacity: 0.5,
      fillColor: dataColor(feature.geometry.coordinates[2]), // Use index 2 for the depth
      color: "00000", // Black outline
      radius: radiusSize(feature.properties.mag), // Grabs magnitude 
      weight: 0.5,
      stroke: true
    };
  }

  // Add the geoJson Data
  L.geoJson(earthquakeData, {
    // Make each feature a marker that is on the map, each marker is a circle
    pointToLayer: function(feature, latLng) {
      return L.circleMarker(latLng);
    },
    // Set the style for each marker
    style: dataStyle, // Calls the data style function and passes in the earthquake data 
    // Add popups
    onEachFeature: function(feature, layer) {
      layer.bindPopup(`Magnitude: <b>${feature.properties.mag}</b><br>
                      Depth: <b>${feature.geometry.coordinates[2]}</b><br>
                      Location: <b>${feature.properties.place}</b>`);
    }
  }).addTo(earthquakes);
});

// Add the earthquake layer to the map
earthquakes.addTo(myMap);

// Add the overlay for the tectonic plates
let overlays = {
  "Tectonic Plates": tectonicplates,
  "Earthquake Data": earthquakes
};

// Add layer control
L.control.layers(basemaps, overlays).addTo(myMap);

// Add the depth legend to the map
var legend = L.control({
  position: "bottomright"
});

// Add the properties for the legend
legend.onAdd = function(map) {
  // Div for the legend to appear on the page
  var div = L.DomUtil.create("div", "info legend");
  div.style.backgroundColor = "white"; // Set background color to white
  div.style.display = "flex"; // Use flexbox for layout
  div.style.flexDirection = "column"; // Arrange items in a column

  // Add the label to the legend
  var legendLabel = L.DomUtil.create("div", "legend-label");
  legendLabel.innerHTML = "<b>Depth of Earthquakes (km)</b>";
  legendLabel.style.marginBottom = "10px"; // Add some space below the label

  // Create a container for the color scale and intervals
  var legendContent = L.DomUtil.create("div", "legend-content");
  legendContent.style.display = "flex"; // Use flexbox for layout

  // Create a color scale bar
  var colorScale = L.DomUtil.create("div", "color-scale");
  colorScale.style.width = "20px";
  colorScale.style.height = "105px";
  colorScale.style.background = "linear-gradient(to top, red, #fc4903, #fc8403, #fcad03, #cafc03, green)";
  colorScale.style.marginRight = "10px"; // Add some space between color scale and intervals

  // Create a container for the intervals and colors
  var intervalsContainer = L.DomUtil.create("div", "intervals-container");

  // Set up the intervals
  var intervals = [-10, 10, 30, 50, 70, 90];
  // Set the colors for the intervals
  var colors = [
    "green", 
    "#cafc03",
    "#fcad03",
    "#fc8403",
    "#fc4903",
    "red"
  ];

  // Loop through the depth intervals to associate a color with each interval.
  for (var i = 0; i < intervals.length; i++) {
    intervalsContainer.innerHTML += '<i style="background:' + colors[i] + '"></i> ' 
    + intervals[i] + (intervals[i + 1] ? "&ndash;" + intervals[i + 1] + " km" + "<br>" : "+ km");
  }

  // Add the color scale and intervals container to the legend content
  legendContent.appendChild(colorScale);
  legendContent.appendChild(intervalsContainer);

  // Add the label and legend content to the main div
  div.appendChild(legendLabel);
  div.appendChild(legendContent);

  return div;
};

// Add the legend to the map 
legend.addTo(myMap);

