function validateFormOnSubmit(form){
	
	//TODO checking if the form is ok
	let formOk = true;
	
	
	if(formOk === true){
		serializeAddress(form);
	}
}

function serializeAddress(form){
	
	let private = form.private.checked;
	
	let title = form.title.value;
	let firstName = form.firstName.value;
	let lastName = form.lastName.value;
	let street = form.street.value;
	let houseNumber = form.houseNumber.value;
	let postcode = form.postcode.value;
	let town = form.town.value;
	let country = form.country.value;
	let email = form.email.value;
	let further = form.email.value;
	
	let address = new Object();
	address.title = title;
	address.firstName = firstName;
	address.lastName = lastName;
	address.street = street;
	address.houseNumber = houseNumber;
	address.postcode = postcode;
	address.town = town;
	address.country = country;
	address.email = email;
	address.further = further;
	
	address = JSON.stringify(address);
	
	if(private === true){
		storingPrivate(address);
	}else{
		storingPublic(address);
	}
	
}

function storingPublic(data){
	sessionStorage.publicData = data;
}

function storingPrivate(data){
	sessionStorage.privateData = data;
}

/**
	From https://stackoverflow.com/a/34156339
	in case we want to export some files someday?
 */
function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}