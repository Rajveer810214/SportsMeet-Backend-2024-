const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  // Other fields in the schema
  name: { type: String, required: true },
  email: { type: String, required: true, unique:true },
  password: { type: String, required: true },
  phone: { type: String, required: true, unique:true },
  gender: { type: String, required: true }, // Ensure "required: true" for the "gender" field
  progressValue: { type: Number, required: true },
  academicInfo: {},
  role: { type:String, default:'user' },
  isVerified:{ type: Boolean, required: true },
  jerseyNo : { type: Number }
});
const studentInfo = mongoose.model('studentInfo', studentSchema);

module.exports = studentInfo;