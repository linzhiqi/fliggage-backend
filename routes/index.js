var express = require('express');
var router = express.Router();

/* GET home page. 
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
*/
module.exports = router;


var mongoose = require('mongoose');
var Baggage = mongoose.model('Baggage');

router.get('/baggage', function(req, res, next) {
  Baggage.find(function(err, baggages){
    if(err){ return next(err); }

    res.json(baggages);
  });
});

router.post('/baggage', function(req, res, next) {
  var baggage = new Baggage(req.body);

  baggage.save(function(err, baggage){
    if(err){ return next(err); }

    res.json(baggage);
  });
});

router.get('/baggage/:fromLoc/:toLoc', function(req, res, next) {
  var regFrom = new RegExp(req.params.fromLoc+',|'+req.params.fromLoc+'$','i');
  var regTo = new RegExp(req.params.toLoc+',|'+req.params.toLoc+'$','i');
  Baggage.find({from: regFrom, to: regTo}, '_id provider from to weight space', function(err, baggages){
    if(err){ return next(err); }

    res.json(baggages);
  });
});
