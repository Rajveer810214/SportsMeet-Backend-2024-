const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const announementSchema = new Schema ({
    title: {
        type: String,
        default: "none"
    },
      message: {
        type: String,
        required: true,
      },
      link: {
        type: String,
        default: 'none'
      }
    });
    
    module.exports = mongoose.model('Announcement', announementSchema);