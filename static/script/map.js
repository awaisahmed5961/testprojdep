let markers;
let map;

let mapLoaded = false;

function loadMap() {
	document.getElementById("WelcomeText").innerHTML = "Welcome " + user;
	
	//checks if the map has been already loaded
	if(mapLoaded === false) {
		map = new OpenLayers.Map("map");
		map.addLayer(new OpenLayers.Layer.OSM());
      
		addMarkerLayer();
		  
		mapLoaded = true;
	}
	
	//setting the center of the map that is used at the start
	const MAPCENTER = new OpenLayers.LonLat(13.241111, 52.4975)
				.transform(
				new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
				map.getProjectionObject() // to Spherical Mercator Projection
				);
	
	
	map.setCenter(MAPCENTER, 9);
}

//TODO change to asynchrous call
/*
	Fetches the lon and lat of a given address.
	The given address parameters will be used to get the location from the "Nominatim API"
	Returns an array with lon at index 0 and lat at index 1
 */
function fetchLonLatFromAPI(street, houseNumber, postcode, country){
	
	//the array that will be returned by this function, containing lon and lat
	let ret;
	
	var xhttp = new XMLHttpRequest();
	//the API url
	var url = 'https://nominatim.openstreetmap.org/search?format=json'+
	'&street='+street+' '+houseNumber+
	'&postalcode='+postcode+
	'&country='+country;
	
	xhttp.onreadystatechange = function() {
	if (this.readyState == 4 && this.status == 200) {
		
		if(xhttp.responseText !== '[]'){
		
			let responseJSON = JSON.parse(xhttp.responseText);
			
			ret = [responseJSON[0].lon, responseJSON[0].lat];
			
		} else {
			//currently a bit bugy, but could be brought back later on in the add/edit address dialogue?
			//document.getElementById("markers_failed").innerHTML = "Some addresses are invalid and could not be marked!";
		}
	} else {
		//somehow displaying every time?
		//alert("Couldn't connect to "+url);
	}
	};
	//SYNCHRONOUS xhttp request (false), should be changed to ASYNCHRONOUS (true) later on!
	xhttp.open("GET", url, false);
	xhttp.send();
	
	return ret;
}

function addMarker(lon, lat, firstName, lastName){

	var feature = new OpenLayers.Feature.Vector(
        new OpenLayers.Geometry.Point( lon, lat).transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject()),
        {description:firstName+' '+lastName} ,
    );    
    markers.addFeatures(feature);
	
	//var lonLat = new OpenLayers.LonLat(lon, lat)
		//.transform(
			//new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
			//map.getProjectionObject() // to Spherical Mercator Projection
	//	);


	//markers.addMarker(new OpenLayers.Marker(lonLat));
	//var zoom = 16;

	//TODO re-centering of map
	//map.setCenter(lonLat, zoom);
}

function removeMarkers(){
	map.removeLayer(markers);
	addMarkerLayer();
}

function addMarkerLayer(){
		markers = new OpenLayers.Layer.Vector("Overlay");
	
		map.addLayer(markers);
		
		var controls = {
			selector: new OpenLayers.Control.SelectFeature(markers, {onSelect: createPopup, onUnselect: destroyPopup })
		};
		function createPopup(feature) {
			feature.popup = new OpenLayers.Popup.FramedCloud("pop",
				feature.geometry.getBounds().getCenterLonLat(),
				null,
				'<div class="markerContent">'+feature.attributes.description+'</div>',
				null,
				true,
				function() { controls['selector'].unselectAll(); }
			);
      //feature.popup.closeOnMove = true;
			map.addPopup(feature.popup);
		}

		function destroyPopup(feature) {
			feature.popup.destroy();
			feature.popup = null;
		}
    
		map.addControl(controls['selector']);
		controls['selector'].activate();
}