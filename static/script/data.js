//holds all the available addresses, must be initialized via refreshSelection first!
var editAddress;

function refreshSelection(showJustOwn){
	var xhr = new XMLHttpRequest();
	if (showJustOwn){
		xhr.open("GET", '/adviz/contacts?userId='+user, true);
	} else {
		xhr.open("GET", '/adviz/contacts?userId='+user+'&all=1', true);
	}
	xhr.setRequestHeader("Content-Type", "application/json");
	
	xhr.onreadystatechange = function() { // Call a function when the state changes.
		if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
			var contacts = JSON.parse(this.responseText);
			//remove all markers left
			removeMarkers();
			//getting the sidebarSelection from the html
			var selection = document.getElementById("addressNameSelection");
			//clearing all entries that might still be in the selection
			while(selection.length > 0){
				selection.remove(0);
			}
			for(i = 0; i < contacts.length; i++){
				var firstName = contacts[i].firstName;
				var lastName = contacts[i].lastName;
				var title = contacts[i].title;
				var lon = contacts[i].lon;
				var lat = contacts[i].lat;
					
				var option = document.createElement("option");
					
				option.text = title+' '+firstName+' '+lastName;
					
				option.onclick = (function(firstName,lastName){return function() {showEdit(firstName,lastName);}})(firstName,lastName);
					
				selection.appendChild(option);
				
				//setting the marker on the map
				addMarker(lon, lat, firstName, lastName);
			}
		}
	}
	xhr.send();
}

//Add new Contact functions

function showAddAddress(){
	document.getElementById("main").style.display="none";
	document.getElementById("addAddress").style.display="block";
	var xhr = new XMLHttpRequest();
	xhr.open("POST", '/adviz/login', true);

	xhr.setRequestHeader("Content-Type", "application/json");
	
	xhr.onreadystatechange = function() { // Call a function when the state changes.
		if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
			var user = JSON.parse(this.responseText);
			if(user.role=="admin"){
				document.getElementById("selectUser").style.display="block";
				var selection = document.getElementById("owner");
				while(selection.length > 0){
					selection.remove(0);
				}
				var xhrall = new XMLHttpRequest();
				xhrall.open("GET", '/adviz/login', true);
	
				xhrall.setRequestHeader("Content-Type", "application/json");
	
				xhrall.onreadystatechange = function() {
					if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
						var users = JSON.parse(this.responseText);
						
						for (i=0;i<users.length;i++){
		
							var option = document.createElement("option");
					
							option.text = users[i].userId;
							selection.appendChild(option);
						}
					}
				}
				xhrall.send();
			}
		} 
	}
	var json = '{"userId":"'+user+'"}';
	xhr.send(json);	
}	

function getNewAddress(){
	var p = "false";
	if(document.getElementById("private").checked==true){
		p="true";
	}
		var newaddress = '{ "firstName": "'+ document.getElementById("firstName").value +'",'+
		' "lastName": "'+ document.getElementById("lastName").value +'",'+
		' "street": "'+ document.getElementById("street").value +'",'+
		' "houseNumber": "'+ document.getElementById("houseNumber").value +'",'+
		' "postcode": "'+ document.getElementById("postcode").value +'",'+
		' "city": "'+ document.getElementById("town").value +'",'+
		' "country": "'+ document.getElementById("country").value +'",'+
		' "title": "'+ document.getElementById("title").value +'",'+
		' "gender": "'+ document.querySelector('input[name="gender"]:checked').value +'",'+
		' "email": "'+ document.getElementById("email").value +'",'+
		' "further": "'+ document.getElementById("further").value +'",'+
		' "lon": "",'+
		' "lat": "",'+
		' "isPrivate":"'+p+'",'+
		' "ownerId": ""}';
		return newaddress;
}

function getEditAddress(){
	var p = "false";
	if(document.getElementById("ePrivate").checked==true){
		p="true";
	}
		var editaddress = '{ "firstName": "'+ document.getElementById("eFirstName").value +'",'+
		' "lastName": "'+ document.getElementById("eLastName").value +'",'+
		' "street": "'+ document.getElementById("eStreet").value +'",'+
		' "houseNumber": "'+ document.getElementById("eHouseNumber").value +'",'+
		' "postcode": "'+ document.getElementById("ePostcode").value +'",'+
		' "city": "'+ document.getElementById("eTown").value +'",'+
		' "country": "'+ document.getElementById("eCountry").value +'",'+
		' "title": "'+ document.getElementById("editTitle").value +'",'+
		' "gender": "'+ document.querySelector('input[name="egender"]:checked').value +'",'+
		' "email": "'+ document.getElementById("eEmail").value +'",'+
		' "further": "'+ document.getElementById("eFurther").value +'",'+
		' "lon": "",'+
		' "lat": "",'+
		' "isPrivate":"'+p+'",'+
		' "ownerId": ""}';
		return editaddress;
}

function addAddress(newaddress){
	
	//availableAddresses=fetchAddresses(); <--- do we need this? commented out for now
	var obj = JSON.parse(newaddress);
	
	if (obj.firstName==null || obj.firstName=="" || obj.lastName==null || obj.lastName=="" || obj.street==null || obj.street==""|| obj.houseNumber==null || obj.houseNumber==""|| obj.postcode==null || obj.postcode==""|| obj.city==null || obj.city==""|| obj.country==null || obj.country==""){
		document.getElementById("add_failed").innerHTML = "Bitte alle benötigten Felder ausfüllen.";
		return;
	}
	
	
	//adding the Lon and Lat to newaddress
	{
		//when call is changed to ASYNCHRONOUS:
			//this returns undefined because the data fetched from the API isn't fast enough
		//right now this is a SYNCHRONOUS call
		let lonlat = fetchLonLatFromAPI(obj.street, obj.houseNumber, obj.postcode, obj.country);
		obj.lon = lonlat[0];
		obj.lat = lonlat[1];
	}
	
	var xhr = new XMLHttpRequest();
	xhr.open("POST", '/adviz/login', true);

	xhr.setRequestHeader("Content-Type", "application/json");
	
	xhr.onreadystatechange = function() { // Call a function when the state changes.
		if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
			var user = JSON.parse(this.responseText);
			if(user.role=="admin"){
				var sel=document.getElementById("owner");
				obj.ownerId=sel.options[sel.selectedIndex].text;
			} else{
				obj.ownerId=user.userId;
			}
			
			var xhrpost = new XMLHttpRequest();
			xhrpost.open("POST", '/adviz/contacts', true);

			xhrpost.setRequestHeader("Content-Type", "application/json");
	
			xhrpost.onreadystatechange = function() { // Call a function when the state changes.
				if (this.readyState === XMLHttpRequest.DONE && this.status === 201) {
					document.getElementById("main").style.display="block";
					document.getElementById("addAddress").style.display="none";
					document.getElementById("selectUser").style.display="none";
					refreshSelection(false);
				} 
			}
			xhrpost.send(JSON.stringify(obj));
		} 
	}
	var json = '{"userId":"'+user+'"}';
	xhr.send(json);	
}
//Edit Contact Code
function showEdit(firstName, lastName){
	document.getElementById("main").style.display="none";
	
	document.getElementById("updateAddress").style.display="block";
	var xhrc = new XMLHttpRequest();
	xhrc.open("GET", '/adviz/contacts/one?firstName='+firstName+'&lastName='+lastName, true);

	xhrc.setRequestHeader("Content-Type", "application/json");
	
	xhrc.onreadystatechange = function() { // Call a function when the state changes.
		if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
			var contact = JSON.parse(this.responseText);
			var xhr = new XMLHttpRequest();
			xhr.open("POST", '/adviz/login', true);

			xhr.setRequestHeader("Content-Type", "application/json");
	
			xhr.onreadystatechange = function() { // Call a function when the state changes.
				if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
					var user = JSON.parse(this.responseText);
					if(user.role=="admin"){
						document.getElementById("eSelectUser").style.display="block";
						var selection = document.getElementById("eOwner");
						while(selection.length > 0){
							selection.remove(0);
						}
						var xhrall = new XMLHttpRequest();
						xhrall.open("GET", '/adviz/login', true);
	
						xhrall.setRequestHeader("Content-Type", "application/json");
	
						xhrall.onreadystatechange = function() {
							if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
								var users = JSON.parse(this.responseText);
						
								for (i=0;i<users.length;i++){
		
									var option = document.createElement("option");
					
									option.text = users[i].userId;
									selection.appendChild(option);
								}
							}
						}
						xhrall.send();
					} 
					document.getElementById("eOriginalOwner").innerText = contact.ownerId;
					document.getElementById("editTitle").value=contact.title;
					if (contact.gender=="m"){
						document.getElementById("em").checked=true;
					} else {
						if (contact.gender=="w"){
							document.getElementById("ew").checked=true;
						} else{
							document.getElementById("ed").checked=true;
						}
					}
					document.getElementById("eFirstName").value=contact.firstName;
					document.getElementById("eLastName").value=contact.lastName;
					document.getElementById("eStreet").value=contact.street;
					document.getElementById("eHouseNumber").value=contact.houseNumber;
					document.getElementById("ePostcode").value=contact.postcode;
					document.getElementById("eTown").value=contact.city;
					document.getElementById("eCountry").value=contact.country;
					document.getElementById("eEmail").value=contact.email;
					document.getElementById("eFurther").value=contact.further;
	
					if(contact.isPrivate=="true"){
						document.getElementById("ePrivate").checked=true;
					} else {
						document.getElementById("ePrivate").checked=false;
					}
					editAddress=contact;
				} 
			}
			var json = '{"userId":"'+user+'"}';
			xhr.send(json);	
		}
	}
	xhrc.send();	
}

function deleteUser(){
	var xhru = new XMLHttpRequest();
	xhru.open("POST", '/adviz/login', true);

	xhru.setRequestHeader("Content-Type", "application/json");
	
	xhru.onreadystatechange = function() {
		if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
			var user = JSON.parse(this.responseText);
			if(user.role!="admin"){
				if(editAddress.ownerId!=user.userId){
					document.getElementById("update_failed").innerHTML = "You're not the contact Owner!";
					return;
				}
			}
				
			var xhr = new XMLHttpRequest();
			xhr.open("DELETE", '/adviz/contacts?firstName='+editAddress.firstName+'&lastName='+editAddress.lastName, true);
	
			xhr.onreadystatechange = function() { // Call a function when the state changes.
				if (this.readyState === XMLHttpRequest.DONE && this.status === 204) {
					document.getElementById("main").style.display="block";
					document.getElementById("updateAddress").style.display="none";
					document.getElementById("eSelectUser").style.display="none";
					document.getElementById("update_failed").innerHTML = "";
					refreshSelection(false);
					return;
				}
			}
			xhr.send();
		}
	}
	var json = '{"userId":"'+user+'"}';
	xhru.send(json);
}

function editUser(newaddress){
	var address = JSON.parse(newaddress);
	
	var xhru = new XMLHttpRequest();
			xhru.open("POST", '/adviz/login', true);

			xhru.setRequestHeader("Content-Type", "application/json");
	
			xhru.onreadystatechange = function() { // Call a function when the state changes.
				if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
					var user = JSON.parse(this.responseText);
					if(user.role=="admin"){
						var sel=document.getElementById("eOwner");
						address.ownerId=sel.options[sel.selectedIndex].text;
					} else {
						if(editAddress.ownerId!=user.userId){
							document.getElementById("update_failed").innerHTML = "You're not the contact Owner!";
							return;
						}
						address.ownerId=user.userId;
					}
					{
						let lonlat = fetchLonLatFromAPI(address.street, address.houseNumber, address.postcode, address.country);
						address.lon = lonlat[0];
						address.lat = lonlat[1];
					}
					var xhr = new XMLHttpRequest();
					xhr.open("PUT", '/adviz/contacts?firstName='+editAddress.firstName+'&lastName='+editAddress.lastName, true);
					
					xhr.setRequestHeader("Content-Type", "application/json");
					
					xhr.onreadystatechange = function() { // Call a function when the state changes.
						if (this.readyState === XMLHttpRequest.DONE && this.status === 204) {
							document.getElementById("main").style.display="block";
							document.getElementById("updateAddress").style.display="none";
							document.getElementById("eSelectUser").style.display="none";
							document.getElementById("update_failed").innerHTML = "";
							refreshSelection(false);
							return;
						}
					}
					xhr.send(JSON.stringify(address));
				} 
			}
			var json = '{"userId":"'+user+'"}';
			xhru.send(json);	
}