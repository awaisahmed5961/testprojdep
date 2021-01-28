var express = require('express');
var router = express.Router();
var db = require('../db.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
var all = req.query.all;
	if (all==1){
		db.getOneUser({userId:req.query.userId},function(r){
			if(r.role=="admin"){
				db.getAllContacts(function(alle){
					res.status(200).set({"Content-Type":"application/json"}).json(alle);
				});
			} else{
				var filter = {ownerId:req.query.userId, isPrivate:"true"};
				db.getUserContacts(filter, function(result) {
					res.status(200).set({"Content-Type":"application/json"}).json(result);
				});
			}
		});
	} else {
		var filter = {ownerId:req.query.userId};
		db.getFilteredContacts(filter, function(result) {
			res.status(200).set({"Content-Type":"application/json"}).json(result);
		});
	}
});

router.get('/one', function(req, res, next) {
	var filter = {firstName:req.query.firstName, lastName:req.query.lastName};
	db.getOneContact(filter, function(result){
		res.status(200).set({"Content-Type":"application/json"}).json(result);
	});
});

router.post('/', function(req, res, next) {
	db.newContact(req.body, function(firstName,lastName){
	  var conloc = "/adviz/contacts/one?firstName:"+firstName+'&lastName:'+lastName;
	  res.status(201).set({"Location":conloc}).send();
	});
});

router.put('/', function(req, res, next) {
	var filter = {firstName:req.query.firstName, lastName:req.query.lastName};
	db.updateContact(filter, req.body);
	res.status(204).send();
});

router.delete('/', function(req, res, next) {
	var filter = {firstName:req.query.firstName, lastName:req.query.lastName};
	db.deleteContact(filter);
	res.status(204).send();
});

module.exports = router;