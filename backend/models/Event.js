// Event model
const mongoose = require('mongoose');
const { Schema } = mongoose;

const EventSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  sportId: {
    type: Schema.Types.ObjectId,
    ref: 'Sport',
    required: true,
  },
  attendance: {
    type: String,
    enum: ['not_marked', 'present', 'absent'],
    default: 'not_marked',
  },
  position: {
    type: Number,
    enum: [0, 1, 2, 3, 4],
    default: 0,
  },
  serialNumber: {
    type: Number,
    default:0
  },
});

module.exports = mongoose.model('Event', EventSchema);
