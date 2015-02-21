// config/passport.js

var GoogleStrategy = require('passport-google-oauth2');
var TokenStrategy = require('passport-token-auth').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var SinaStratege = require('passport-sina');
var User = require('../models/user');

var configAuth = require('./auth');

module.exports = function(passport) {

  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

  passport.use(new GoogleStrategy({
      clientID:     configAuth.googleAuth.clientID,
      clientSecret: configAuth.googleAuth.clientSecret,
      callbackURL: configAuth.googleAuth.callbackURL,
      passReqToCallback   : true
    },

    function(request, accessToken, refreshToken, profile, done) {
      process.nextTick( function(){
        //console.log('!!profile:'+JSON.stringify(profile));
        User.findOne({ 'provider': 'google', 'id': profile.id }, function (err, user) {
          //console.log('!!request:'+JSON.stringify(request));

          if(err){
            return done(err);
          }
          if(user){
            user.token = accessToken;
            user.save();
            return done(null, user);
          } else {
            var userModel = new User({
                provider: 'google',
                id: profile.id,
                name: profile['displayName'],
                email: profile['emails'][0]['value'],
                image: profile['photos'][0]['value'],
                token: accessToken
              });
            userModel.save(function(err, user) {
              //console.log('!!user:'+JSON.stringify(user));
              //console.log('!!token:'+accessToken);
              //console.log('!!refreshtoken:'+refreshToken);
              return done(err, user);
            });  
          }
        });
      });
    }
  ));

  passport.use(new TwitterStrategy({
      consumerKey:     configAuth.twitterAuth.consumerKey,
      consumerSecret: configAuth.twitterAuth.consumerSecret,
      callbackURL: configAuth.twitterAuth.callbackURL,
      passReqToCallback   : true
    },

    function(request, accessToken, refreshToken, profile, done) {
      process.nextTick( function(){
        //console.log('!!profile:'+JSON.stringify(profile));
        User.findOne({ 'provider': 'twitter', 'id': profile.id }, function (err, user) {
          //console.log('!!request:'+JSON.stringify(request));

          if(err){
            return done(err);
          }
          if(user){
            user.token = accessToken;
            user.save();
            return done(null, user);
          } else {
            var userModel = new User({
                provider: 'twitter',
                id: profile.id,
                name: profile['displayName'],
                email: '',
                image: profile['photos'][0]['value'],
                token: accessToken
              });
            userModel.save(function(err, user) {
              //console.log('!!user:'+JSON.stringify(user));
              //console.log('!!token:'+accessToken);
              //console.log('!!refreshtoken:'+refreshToken);
              return done(err, user);
            });  
          }
        });
      });
    }
  ));

  passport.use(new FacebookStrategy({
      clientID:     configAuth.facebookAuth.clientID,
      clientSecret: configAuth.facebookAuth.clientSecret,
      callbackURL: configAuth.facebookAuth.callbackURL,
      passReqToCallback   : true
    },

    function(request, accessToken, refreshToken, profile, done) {
      process.nextTick( function(){
        //console.log('!!profile:'+JSON.stringify(profile));
        User.findOne({ 'provider': 'facebook', 'id': profile.id }, function (err, user) {
          //console.log('!!request:'+JSON.stringify(request));

          if(err){
            return done(err);
          }
          if(user){
            user.token = accessToken;
            user.save();
            return done(null, user);
          } else {
            var userModel = new User({
                provider: 'facebook',
                id: profile.id,
                name: profile['displayName'],
                email: profile['emails'][0]['value'],
                image: "https://graph.facebook.com/"+profile.id+"/picture?type=square",
                token: accessToken
              });
            userModel.save(function(err, user) {
              //console.log('!!user:'+JSON.stringify(user));
              //console.log('!!token:'+accessToken);
              //console.log('!!refreshtoken:'+refreshToken);
              return done(err, user);
            });  
          }
        });
      });
    }
  ));

  passport.use(new LinkedInStrategy({
      clientID: configAuth.linkedinAuth.clientID,
      clientSecret: configAuth.linkedinAuth.clientSecret,
      callbackURL: configAuth.linkedinAuth.callbackURL,
      scope: ['r_emailaddress', 'r_basicprofile'],
      passReqToCallback   : true,
      state: true
    },

    function(request, accessToken, refreshToken, profile, done) {
      process.nextTick( function(){
        console.log('!!profile:'+JSON.stringify(profile));
        User.findOne({ 'provider': 'linkedin', 'id': profile.id }, function (err, user) {
          //console.log('!!request:'+JSON.stringify(request));

          if(err){
            return done(err);
          }
          if(user){
            user.token = accessToken;
            user.save();
            return done(null, user);
          } else {
            var userModel = new User({
                provider: 'linkedin',
                id: profile.id,
                name: profile['displayName'],
                token: accessToken
              });
            if(profile['emails'][0]){
              userModel.email = profile['emails'][0]['value'];
            }
            if(profile['photos'][0]){
              userModel.image = profile['photos'][0]['value'];
            }
            userModel.save(function(err, user) { 
              console.log('!!user:'+JSON.stringify(user));
              console.log('!!token:'+accessToken);
              console.log('!!refreshtoken:'+refreshToken);
              return done(err, user);
            });  
          }
        });
      });
    }
  ));

  passport.use(new SinaStratege({
      clientID: configAuth.sinaAuth.clientID,
      clientSecret: configAuth.sinaAuth.clientSecret,
      callbackURL: configAuth.sinaAuth.callbackURL,
      passReqToCallback   : true,
      state: true
    },

    function(request, accessToken, refreshToken, profile, done) {
      process.nextTick( function(){
        console.log('!!profile:'+JSON.stringify(profile));
        User.findOne({ 'provider': 'sina', 'id': profile.id }, function (err, user) {


          if(err){
            return done(err);
          }
          if(user){
            user.token = accessToken;
            user.save();
            return done(null, user);
          } else {
            var userModel = new User({
                provider: 'sina',
                id: profile.id,
                name: profile['screen_name'],
                image: profile['profile_image_url'],
                email: '',
                token: accessToken
              });

            userModel.save(function(err, user) { 
              console.log('!!user:'+JSON.stringify(user));
              console.log('!!token:'+accessToken);
              console.log('!!refreshtoken:'+refreshToken);
              return done(err, user);
            });  
          }
        });
      });
    }
  ));

  passport.use(new TokenStrategy(
    function(token, done) {
      process.nextTick( function(){
        var realToken = token.split(" ")[1];
        User.findOne({ 'token': realToken }, function (err, user) {
          //console.log('!!tokenstragegy: token='+realToken);
          //console.log('!!tokenstragegy: user='+user);
          if (err) { return done(err); }
          if (!user) { return done(null, false); }
          return done(null, user, { scope: 'all' });
        });
      });
    }
  ));

};
