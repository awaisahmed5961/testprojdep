var user = "none"

function login() {
	user = document.getElementById("user").value;
	var password = document.getElementById("password").value;
	
	var xhr = new XMLHttpRequest();
	xhr.open("POST", '/adviz/login', true);

	xhr.setRequestHeader("Content-Type", "application/json");
	
	xhr.onreadystatechange = function() { // Call a function when the state changes.
		if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
			var user = JSON.parse(this.responseText);
			user.password='';
			document.getElementById("login").style.display="none";
			document.getElementById("main").style.display="block";
			document.getElementById("login_failed").innerHTML = "";
			loadMap();
		} else {
			document.getElementById("login_failed").innerHTML = "Wrong username or password!";
		}
	}
	var json = '{"userId":"'+user+'",'+'"password":"'+password+'"}';
	xhr.send(json);
}
	
function logout() {
	user = "none";
	document.getElementById("main").style.display="none";
	document.getElementById("login").style.display="block";
	document.getElementById("login_failed").innerHTML = "";
	var selection = document.getElementById("addressNameSelection");
	while(selection.length > 0){
		selection.remove(0);
	}
	
	//removing all markers from the map
	removeMarkers();
}