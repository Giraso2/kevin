const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentId: { type: String, required: true, unique: true },
  grade: { type: String, enum: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'], required: true },
  className: { type: String, required: true },
  combination: { type: String, enum: ['Software Development', 'Accounting', 'Computer Systems', 'Tourism', 'General'], default: 'General' },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dateOfBirth: Date,
  gender: { type: String, enum: ['Male', 'Female'] },
  enrollmentDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);