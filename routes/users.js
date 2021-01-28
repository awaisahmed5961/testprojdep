var express = require('express');
var router = express.Router();
var db = require('../db.js');

router.post('/', function(req, res, next) {
  db.getOneUser(req.body, function(result){
	if (result){
		result.password="";
		res.status(200).set({"Content-Type":"application/json"}).json(result);
	}
	else
		res.status(401).send();
  });
});

router.get('/', function(req, res, next) {
  db.getAllUsers(function(result){
	if (result){
		res.status(200).set({"Content-Type":"application/json"}).json(result);
	}
	else
		res.status(401).send();
  });
});

module.exports = router;