var mongoose = require('mongoose');

var MessageSchema = new mongoose.Schema({
  baggageId: {type: mongoose.Schema.Types.ObjectId, ref: 'Baggage'},
  fromId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  toId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  isFromRequestor: { type: Boolean, default: true},
  content: String,
  time : { type : Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);
