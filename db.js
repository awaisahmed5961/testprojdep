var MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017";
var db = null;
var client = new MongoClient(url);

const DBNAME = "advizDB";

//the default users
const USERS = [
		{_id: 0, userId: "admina", password: "admina", firstName: "admina", lastName: "admina", role: "admin"},
		{_id: 1, userId: "normalo", password: "normalo", firstName: "normalo", lastName: "normalo", role: "user"}
		]

function initUserEntries(){
	
	db.collection("users").insertMany(USERS, function(err, res) {
		if(err) throw err;
		
		console.log("initial [users] insertions: \n"+ JSON.stringify(res.ops))
	});
}

function initContactsEntries(){
	const CONTACTS = [
		{firstName: "Deville", "lastName": "Montagne", "street": "Teufelsseechaussee", "houseNumber": "10", "postcode": "14193", "city": "Berlin", "country": "Germany", "title": "", "gender": "m", "email":"deville.montagne@email.com", "further":"","lon" : "13.241158004906772", "lat" : "52.49736615", isPrivate: "false", ownerId:"admina"},
		{ "firstName": "Max", "lastName": "Mustermann", "street": "Ungewitterweg", "houseNumber": "1", "postcode": "13591", "town": "Berlin", "country": "Germany", "title": "Dr.", "gender": "m", "email":"max.mustermann@email.com", "further":"more stuff","lon" : "13.1550411", "lat" : "52.5422311", isPrivate: "true", ownerId:"admina"},
		{ "firstName": "Charlie", "lastName": "Charlson", "street": "Friedrichstraße","houseNumber": "45", "postcode": "10117", "town": "Berlin", "country": "Germany", "title": "", "gender": "m", "email":"charlie.charlson@email.com", "further":"","lon" : "13.3903737", "lat" : "52.5075075", isPrivate: "false", ownerId:"normalo"},
		{ "firstName": "Maxi", "lastName": "Musterfrau", "street": "Ungewitterweg","houseNumber": "1", "postcode": "13591", "town": "Berlin", "country": "Germany", "title": "", "gender": "w", "email":"maxi.musterfrau@email.com", "further":"","lon" : "13.1550411", "lat" : "52.5422311", isPrivate: "true", ownerId:"normalo"}
	]
	
	db.collection("contacts").insertMany(CONTACTS, function(err, res) {
		if(err) throw err;
		
		console.log("initial example [contacts] insertions: \n"+ JSON.stringify(res.insertedCount)+' contacts');
	});
}

function mongoDBSetup() {
	
	console.log("SETTING UP DB. COLLECTIONS WILL BE REFERRED TO AS [COLLECTION_NAME]")
	
	db.collection("users").findOne(USERS[0], function(err, result) {
		if (err) throw err;
		
		if(result === null) {
			
			console.log("Couldn't find index 0 in [users]. This indicates an empty DB.");
			console.log("creating DB entries for [users]...")
			initUserEntries();
			
			console.log("creating DB example entries for [contacts]...")
			initContactsEntries();
		} else {
			console.log("Found index 0 in [users]. This indicates a present DB. Nothing left to do!");
		}
	});
}

module.exports = {
	
connect: async function(){
	await client.connect();
	db = client.db(DBNAME);
	
	mongoDBSetup();
},

closeConnection: function(){
	client.close();
	console.log("Connection to DB closed");
},

getAllUsers: function(callback){
	db.collection("users").find({}).toArray(function(err, result) {
		if (err) throw err;
		console.log(result);
		return callback(result);
	});
},

getOneUser: function(filter, callback){
	db.collection("users").findOne(filter, function(err, result) {
		if (err) throw err;
		console.log(result);
		return callback(result);
	});
},

getAllContacts: function(callback){
	db.collection("contacts").find({}).toArray(function(err, result) {
		if (err) throw err;
		console.log(result);
		return callback(result);
	});
},

getOneContact: function(filter,callback){
	db.collection("contacts").findOne(filter, function(err, result) {
		if (err) throw err;
		console.log(result);
		return callback(result);
	});
},

getFilteredContacts: function(filter, callback){
	db.collection("contacts").find(filter).toArray(function(err, result) {
		if (err) throw err;
		console.log(result);
		return callback(result);
	});
},

getUserContacts: function(filter, callback){
	db.collection("contacts").find({isPrivate:"false"}).toArray(function(err, result) {
		if (err) throw err;
		db.collection("contacts").find(filter).toArray(function(err, re) {
			for (i=0; i<re.length;i++){
				result.push(re[i]);
			}
			console.log(result);
			return callback(result);
		});
	});
},

newContact: function(contact, callback){
	db.collection("contacts").insertOne(contact, function(err, result) {
		if (err) throw err;
		console.log("1 new contact created");
		callback(result.firstName,result.lastName);
	});
},

deleteContact: function(filter){
	db.collection("contacts").deleteOne(filter, function(err, result) {
		if (err) throw err;
		console.log(result);
	});
},

updateContact: function(filter,replacement){
	db.collection("contacts").replaceOne(filter, replacement, function(err, res) {
		if (err) throw err;
		console.log(res);
	});
}
}