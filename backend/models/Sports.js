const mongoose = require('mongoose');
const { Schema } = mongoose;

const SportSchema = new Schema({
  sportName: {
    type: String,
    required: true,
  },
  sportType: {
    type: String,
    enum: ['field', 'track', 'tugofwar', 'relay'],
    required: true,
  },
  genderCategory: {
    type: String,
    enum: ['Male', 'Female'],
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model('Sport', SportSchema);
