var mongoose = require('mongoose');

var ImageSchema = new mongoose.Schema({
  fieldName: String,
  originalName: String,
  encoding: String,
  mimeType: String,
  destination: String,
  fileName: String,
  path: String,
  size: Number
}, { timestamps: true });

module.exports = mongoose.model('imageData', ImageSchema);