var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  provider	: String,
  id		: String,
  token		: String,
  email		: String,
  name		: String,
  image		: String
    
});

module.exports = mongoose.model('User', UserSchema);
