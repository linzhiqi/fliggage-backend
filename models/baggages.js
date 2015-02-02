var mongoose = require('mongoose');

var BaggageSchema = new mongoose.Schema({
  provider: Number,
  from: String,
  to: String,
  weight: Number,
  space: [Number],
  contact: String,
  info: String
});

mongoose.model('Baggage', BaggageSchema);
