var mongoose = require('mongoose');

var RequestedBaggageSchema = new mongoose.Schema({
  baggageId: {type: mongoose.Schema.Types.ObjectId, ref: 'Baggage'},
  requestorId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  time : { type : Date, default: Date.now }
});

module.exports = mongoose.model('RequestedBaggage', RequestedBaggageSchema);
