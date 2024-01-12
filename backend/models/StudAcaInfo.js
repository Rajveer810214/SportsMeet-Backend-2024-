const mongoose = require('mongoose');

const AcademicInfo = new mongoose.Schema({
  // Other fields in the schema
  course: { type: String, required: true },
  branch: { type: String, required: true},
  urn: { type: String, required: true,unique:true },
  year: { type: String, required: true, unique:true },
  progressValue: { type: Number, required: true },
});
const academicinfo = mongoose.model('academicInfo', AcademicInfo);

module.exports = academicinfo;