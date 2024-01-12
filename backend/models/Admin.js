const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isShowCertificate: { type: Boolean, default: false }, // Uncommented here
  role: { type: String, default: 'superAdmin' },
});

module.exports = mongoose.model('Admin', adminSchema);
