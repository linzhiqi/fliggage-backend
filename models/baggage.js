var mongoose = require('mongoose');

var BaggageSchema = new mongoose.Schema({
  uid: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
//  provider: String,
  from: String,
  accesptBefore: Number,
  to: String,
  arriveAfter: Number,
  weight: Number,
  space: [Number],
  info: String,
  time : { type : Date, default: Date.now }
});

module.exports = mongoose.model('Baggage', BaggageSchema);
