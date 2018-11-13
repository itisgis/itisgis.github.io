
// Create a new map with a fullscreen button:
var map = new L.map('mapid', {
  center: [46.2022200, 6.1456900],
  zoom: 13
},{
    fullscreenControl: true,
    // OR
    fullscreenControl: {
        pseudoFullscreen: false // if true, fullscreen to page width and height
    }
});

var osm = L.tileLayer('//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a>'
}).addTo(map);

// Add scale
L.control.scale().addTo(map);

var featureGroup = L.featureGroup().addTo(map);
// Initialise the FeatureGroup to store editable layers
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);


// define toolbar options
var options = {
    position: 'topleft', // toolbar position, options are 'topleft', 'topright', 'bottomleft', 'bottomright'
    drawMarker: false, // adds button to draw markers
    drawPolyline: false, // adds button to draw a polyline
    drawRectangle: false, // adds button to draw a rectangle
    drawPolygon: true, // adds button to draw a polygon
    drawCircle: false, // adds button to draw a cricle
    cutPolygon: true, // adds button to cut a hole in a polygon
    editMode: true, // adds button to toggle edit mode for all layers
    removalMode: true, // adds a button to remove layers
};
 
// add leaflet.pm controls to the map
map.pm.addControls(options);

var options ={
    // snapping
    snappable: true,
    snapDistance: 20,
 
    // allow snapping to the middle of segments
    snapMiddle: true,
 
    // self intersection
    allowSelfIntersection: false,
 
    // the lines between coordinates/markers
    templineStyle: {
        color: 'purple',
    },
 
    // the line from the last marker to the mouse cursor
    hintlineStyle: {
        color: 'green',
        dashArray: [5, 5],
    },
 
    // show a marker at the cursor
    cursorMarker: true,
 
    // finish drawing on double click
    finishOnDoubleClick: false,
 
    // specify type of layer event to finish the drawn shape
    // example events: 'mouseout', 'dblclick', 'contextmenu'
    // List: http://leafletjs.com/reference-1.2.0.html#interactive-layer-click
    finishOn: 'contextmenu',
};
 
// enable drawing mode for shape - e.g. Poly, Line, etc
map.pm.enableDraw('Poly', options);
    
map.on('draw:created', function (e) {
	var layer = e.layer;
  feature = layer.feature = layer.feature || {};
  
  feature.type = feature.type || "Feature";
    var props = feature.properties = feature.properties || {};
    //layer.feature = {properties: {}}; // No need to convert to GeoJSON.
    //var props = layer.feature.properties;
    props.desc = null;
    props.image = null;
  
	// Do whatever else you need to. (save to db, add to map etc)
	drawnItems.addLayer(layer);
});

document.getElementById("submit").onclick = function(e){
	var files = document.getElementById('file').files;
	if (files.length == 0) {
	  return; //do nothing if no file given yet
  }
  
  var file = files[0];
  
  if (file.name.slice(-3) != 'zip'){ //Demo only tested for .zip. All others, return.
		document.getElementById('warning').innerHTML = 'Select .zip file';  	
    return;
  } else {
  	document.getElementById('warning').innerHTML = ''; //clear warning message.
    handleZipFile(file);
  }
};

//More info: https://developer.mozilla.org/en-US/docs/Web/API/FileReader
function handleZipFile(file){
	var reader = new FileReader();
  reader.onload = function(){
	  if (reader.readyState != 2 || reader.error){
		  return;
	  } else {
		  convertToLayer(reader.result);
  	}
  }
  reader.readAsArrayBuffer(file);
}

function convertToLayer(buffer){
	shp(buffer).then(function(geojson){	//More info: https://github.com/calvinmetcalf/shapefile-js
    var layer = L.shapefile(geojson);
    //More info: https://github.com/calvinmetcalf/leaflet.shapefile
		featureGroup.addLayer(layer);
    //console.log(layer);
  });
}
//export
document.getElementById("convert").addEventListener("click", function () {
	console.log(JSON.stringify(drawnItems.toGeoJSON(), null, 2));
});

map.on('draw:edited', function (e) {
	var layers = e.layers;
	layers.eachLayer(function (layer) {
		//do whatever you want, most likely save back to db
	});
});

map.isFullscreen() // Is the map fullscreen?
map.toggleFullscreen() // Either go fullscreen, or cancel the existing fullscreen.

// `fullscreenchange` Event that's fired when entering or exiting fullscreen.
map.on('fullscreenchange', function () {
    if (map.isFullscreen()) {
        console.log('entered fullscreen');
    } else {
        console.log('exited fullscreen');
    }
});

map.addControl(new L.Control.Fullscreen({
    title: {
        'false': 'View Fullscreen',
        'true': 'Exit Fullscreen'
    }
}));