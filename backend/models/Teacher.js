const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacherId: {
    type: String,
    required: true,
    unique: true
  },
  subject: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  qualification: {
    type: String,
    default: ''
  },
  experience: {
    type: Number,
    default: 0
  },
  classes: [{
    type: String
  }]
});

module.exports = mongoose.model('Teacher', teacherSchema);