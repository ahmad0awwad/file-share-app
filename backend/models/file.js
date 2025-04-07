const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  sender: String,
  recipients: [String],
  filePath: String,
  fileName: String,
  size: Number,
description: String,
  uploadedAt: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false }

});

module.exports = mongoose.model('File', fileSchema);
