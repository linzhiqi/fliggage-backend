// routes/index.js



module.exports = function(app, passport) {


/* GET home page. 
  router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
  });
*/

  var mongoose = require('mongoose');
  var Baggage = require('../models/baggage');
  var User = require('../models/user');

  app.get('/baggage/location', function(req, res, next) {
    Baggage.find(function(err, baggages){
      if(err){ return next(err); }
      var bObjects = [];
      var len = baggages.length;
      var numOfFilled = 0;
      if(len>0){
        for(var i in baggages){  
          (function(index){
            var bObject = baggages[index].toObject();
            var uid = bObject.uid;
            User.findOne({_id: mongoose.Types.ObjectId(uid)}, 'name image', function(err, user){
              //console.log("!!user:"+user);
              bObject.providerName = user.name;
              bObject.providerImage = user.image;
              bObjects.push(bObject);
              numOfFilled ++;
              //console.log("!!bObjects in loop:"+JSON.stringify(bObjects));
              if(numOfFilled===len) {res.json(bObjects);};
            });
          })(i);
        }
      }else{
        res.json([]);
      }
    });
  });

  app.post('/baggage', function(req, res, next) {
    var baggage = new Baggage(req.body);

    baggage.save(function(err, baggage){
      if(err){ return next(err); }

      res.json(baggage);
    });
  });

  app.get('/baggage/location/:fromLoc/:toLoc', function(req, res, next) {
    var regFrom = new RegExp(req.params.fromLoc+',|'+req.params.fromLoc+'$','i');
    var regTo = new RegExp(req.params.toLoc+',|'+req.params.toLoc+'$','i');
    Baggage.find({from: regFrom, to: regTo}, '_id uid from to weight space info', {limit: 15}, function(err, baggages){
      if(err){ return next(err); }
      var bObjects = [];
      var len = baggages.length;
      var numOfFilled = 0;
      if(len>0){
        for(var i in baggages){  
          (function(index){
            var bObject = baggages[index].toObject();
            var uid = bObject.uid;
            User.findOne({_id: mongoose.Types.ObjectId(uid)}, 'name image', function(err, user){
              console.log("!!user:"+user);
              bObject.providerName = user.name;
              bObject.providerImage = user.image;
              bObjects.push(bObject);
              numOfFilled ++;
              //console.log("!!bObjects in loop:"+JSON.stringify(bObjects));
              if(numOfFilled===len) {res.json(bObjects);};
            });
          })(i);
        }
      }else{
        res.json([]);
      }
    });
  });

  app.get('/baggage/id/:id', function(req, res, next) {    
    Baggage.findOne({_id: mongoose.Types.ObjectId(req.params.id)}, '_id uid from accesptBefore to arriveAfter weight space info', function(err, baggage){
      if(err){ return next(err); }
      var baggageObject = baggage.toObject();
      var uid = baggage.uid;
      
      User.findOne({_id: mongoose.Types.ObjectId(uid)}, 'name image', function(err, user){
            console.log("!!google.name:"+user.name);
            baggageObject.providerName = user.name;
            baggageObject.providerImage = user.image;
            console.log("!!baggage after filled:"+JSON.stringify(baggageObject));
            res.json(baggageObject);
      });
    });
  });

  app.post('/baggage/id', passport.authenticate('token', { session: false }),
    function(req, res, next) {
      console.log();
      var baggage = new Baggage(req.body);
      baggage.save(function(err, baggage){
        if(err){ return next(err); }
        res.json(baggage);
      });
    }
  );

  app.get('/profile', 
    passport.authenticate('token', { session: false }),
    function(req, res) {
      res.json(req.user);
  });

// Redirect the user to Google for authentication.  When complete, Google
// will redirect the user back to the application at
//     /auth/google/return
  app.get('/auth/google',
    passport.authenticate('google', { scope: 
      [ 'https://www.googleapis.com/auth/plus.login',
      , 'https://www.googleapis.com/auth/plus.profile.emails.read' ],
      session: false }
    )
  );

// Google will redirect the user to this URL after authentication.  Finish
// the process by verifying the assertion.  If valid, the user will be
// logged in.  Otherwise, authentication has failed.
  app.get('/auth/google/return', function(req, res, next) {
    passport.authenticate('google', 
      { 
        session: false 
      }, function(err, user, info){
        console.log('!!user:'+JSON.stringify(user));
        if (err) { return next(err); }
        if (!user) { return res.redirect('http://localhost:8000/app/#/signin'); }
        return res.redirect("http://localhost:8000/app/#/signed-in/"+user.token);
      })(req, res, next);
  });


  app.get('/auth/facebook',
    passport.authenticate('facebook', { scope : ['email', 'user_photos'],
      session: false }
    )
  );

  app.get('/auth/facebook/return', function(req, res, next) {
    passport.authenticate('facebook', 
      { 
        session: false 
      }, function(err, user, info){
        console.log('!!user:'+JSON.stringify(user));
        if (err) { return next(err); }
        if (!user) { return res.redirect('http://localhost:8000/app/#/signin'); }
        return res.redirect("http://localhost:8000/app/#/signed-in/"+user.token);
      })(req, res, next);
  });
/*
  app.use(session({
    secret: 'session-secret-xyz',
    resave: true,
    saveUninitialized: true,
    store: new mongoStore({ mongoose_connection: mongoose.connection })
  }));
*/

  app.get('/auth/linkedin',
    passport.authenticate('linkedin', { scope : ['r_basicprofile', 'r_emailaddress']}
    )
  );

  app.get('/auth/linkedin/return', function(req, res, next) {
    passport.authenticate('linkedin', 
      { 
        
      }, function(err, user, info){
        console.log('!!user:'+JSON.stringify(user));
        if (err) { return next(err); }
        if (!user) { return res.redirect('http://localhost:8000/app/#/signin'); }
        return res.redirect("http://localhost:8000/app/#/signed-in/"+user.token);
      })(req, res, next);
  });
};








