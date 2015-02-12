// routes/index.js



module.exports = function(app, passport) {


/* GET home page. 
  router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
  });
*/

  var mongoose = require('mongoose');
  var Baggage = require('../models/baggage');
  var Message = require('../models/message');
  var RequestedBaggage = require('../models/requestedbaggage');
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
            console.log("!!name:"+user.name);
            baggageObject.providerName = user.name;
            baggageObject.providerImage = user.image;
            console.log("!!baggage after filled:"+JSON.stringify(baggageObject));
            res.json(baggageObject);
      });
    });
  });

  app.post('/baggage/id', passport.authenticate('token', { session: false }),
    function(req, res, next) {
      var baggage = new Baggage(req.body);
      baggage.save(function(err, baggage){
        if(err){ return next(err); }
        res.json(baggage);
      });
    }
  );

  app.post('/message', passport.authenticate('token', { session: false }),
    function(req, res, next) {
      if(req.body.fromId !== req.user._id.toHexString()){
        console.log("senderId not match: "+req.body.fromId+" / "+req.user._id);
        res.send("senderId not match: "+req.body.fromId+" / "+req.user._id);
      }else{
        var msg = new Message(req.body);
        msg.save(function(err, message){
          if(err){ return next(err); }
          if(req.body.isFromRequestor){
            RequestedBaggage.findOne({
                baggageId: mongoose.Types.ObjectId(req.body.baggageId), 
                requestorId: mongoose.Types.ObjectId(req.body.fromId)
              }, function(err, requestedBaggage){
                if(err){ return next(err); }
                if(!requestedBaggage){
                  console.log("fisrt request message for a baggage.");
                  var request = new RequestedBaggage({
                    baggageId: req.body.baggageId,
                    requestorId:  req.body.fromId,
                  });
                  request.save(function(err, data){
                    if(err){ return next(err); }
                  });
                }
            });
          }
          res.json(message);
        });
        
      }
    }
  );

  app.get("/provider/:id/baggage", passport.authenticate('token', { session: false }),
    function(req, res, next) {
      if(req.params.id !== req.user._id.toHexString()){
        console.log("providerId not match: "+req.body.requestorId+" / "+req.user._id);
        res.send("providerId not match: "+req.body.requestorId+" / "+req.user._id);
      }else{
        console.log("providerId matches: "+req.body.requestorId+" / "+req.user._id);
        Baggage.find({uid: mongoose.Types.ObjectId(req.params.id)}, '_id uid from accesptBefore to arriveAfter weight space info', function(err, baggages){
          if(err){ return next(err); }
           
//        User.findOne({_id: mongoose.Types.ObjectId(uid)}, 'name image', function(err, user){
            var bObjects = [];
            if(baggages.length>0){
              for(var i in baggages){  
                var bObject = baggages[i].toObject();
                bObject.providerName = req.user.name;
                bObject.providerImage = req.user.image;
                bObjects.push(bObject);  
              }
            }
            res.json(bObjects);
//        });
        });
      }
  });

  app.get("/baggage/:id/requestor", passport.authenticate('token', { session: false }),
    function(req, res, next) {
      Baggage.findOne({_id: mongoose.Types.ObjectId(req.params.id)}, function(err, baggage){
          if(err){ return next(err); }
          if(!baggage){res.json([]); return;}

          if(!baggage.uid.equals(req.user._id)){
            console.log("providerId not match: "+baggage.uid+" / "+req.user._id);
            res.send("providerId not match: "+baggage.uid+" / "+req.user._id);
          }else{
            RequestedBaggage.find({baggageId: baggage._id})
              .populate('requestorId')
              .exec(function (err, requestors) {
                if (err) {return next(err);}
                if(requestors.length===0) {res.json([]); return;}
                var userList = [];
                for(var i in requestors){
                  var user = {
                    _id: requestors[i].requestorId._id,
                    name: requestors[i].requestorId.name,
                    image: requestors[i].requestorId.image
                  };
                  userList.push(user);
                }
                res.json(userList);
            });
          }
      });

    }
  );

  app.get("/requestor/:id/baggage", passport.authenticate('token', { session: false }),
    function(req, res, next) {
      if(req.params.id !== req.user._id.toHexString()){
        console.log("requestorId not match: "+req.params.id+" / "+req.user._id);
        res.send("requestorId not match: "+req.params.id+" / "+req.user._id);
      }else{
        console.log("requestorId matches: "+req.params.id+" / "+req.user._id);
        RequestedBaggage.find({requestorId: mongoose.Types.ObjectId(req.params.id)}, 'baggageId', function(err, baggages){
          if(err){ return next(err); }
          var bObjects = [];
          var len = baggages.length;
          console.log(len+" baggages for this requestor.");
          var numOfFilled = 0;

          if(len>0){
            for(var i in baggages){  
              (function(index){
                Baggage.findOne({_id: baggages[index].baggageId}, '_id uid from to weight space info', function(err, baggage){
                  if(err){ return next(err); }

                  var bObject = baggage.toObject();
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
                });
              })(i);
            }
          }else{
            res.json([]);
          }
        });
      }
    }
  );

  app.get("/requestor/:id/baggage/:bid/message", passport.authenticate('token', { session: false }),
    function(req, res, next) {
      Baggage.findOne({_id: mongoose.Types.ObjectId(req.params.bid)}, function(err, baggage){
        if(req.params.id !== req.user._id.toHexString() && baggage.uid.toHexString() !== req.user._id.toHexString()){
          console.log("requestorId not match: "+req.params.id+" / "+req.user._id);
          res.send("requestorId not match: "+req.params.id+" / "+req.user._id);
        }else{
          console.log("requestorId matches: "+req.body.requestorId+" / "+req.user._id);
          Message.find(
            { $and: [
                {baggageId: mongoose.Types.ObjectId(req.params.bid)}, 
                {$or: [
                    {fromId: mongoose.Types.ObjectId(req.params.id)}, 
                    {toId: mongoose.Types.ObjectId(req.params.id)}
                  ]
                }
              ]
            })
            .populate([{path: 'fromId', select: '_id name image'},{path: 'toId', select: '_id name image'}])
            .exec(function (err, messages) {
              if(err){ return next(err); }
              res.json(messages);
            });
      }});
    }
  );

  app.get('/profile', 
    passport.authenticate('token', { session: false }),
    function(req, res) {
      res.json(req.user);
  });

  app.get('/public-profile/:id', function(req, res, next) { 
    User.findOne({_id: mongoose.Types.ObjectId(req.params.id)}, '_id name image email', function(err, user){
      if(err){
        return next(err);
      }
      console.log("!!public-profile: "+JSON.stringify(user));
      res.json(user);
    });
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
    passport.authenticate('linkedin', { scope : ['r_basicprofile', 'r_emailaddress'], session: false }
    )
  );

  app.get('/auth/linkedin/return', function(req, res, next) {
    passport.authenticate('linkedin', 
      { 
        session: false 
      }, function(err, user, info){
        console.log('!!user:'+JSON.stringify(user));
        if (err) { return next(err); }
        if (!user) { return res.redirect('http://localhost:8000/app/#/signin'); }
        return res.redirect("http://localhost:8000/app/#/signed-in/"+user.token);
      })(req, res, next);
  });
};








