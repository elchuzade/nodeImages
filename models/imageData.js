var mongoose = require('mongoose');

var EventSchema = new mongoose.Schema({
  fieldName: String,
  originalName: String,
  encoding: String,
  mimeType: String,
  destination: String,
  fileName: String,
  path: String,
  size: Number
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);