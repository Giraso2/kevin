const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  studentName: { type: String, required: true },
  subject: { type: String, required: true },
  score: { type: Number, required: true, min: 0, max: 100 },
  grade: { type: String },
  term: { type: String, required: true },
  year: { type: Number, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teacherName: { type: String, required: true },
  remarks: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

// Calculate letter grade before saving
gradeSchema.pre('save', function(next) {
  if (this.score >= 80) this.grade = 'A';
  else if (this.score >= 75) this.grade = 'B+';
  else if (this.score >= 70) this.grade = 'B';
  else if (this.score >= 65) this.grade = 'C+';
  else if (this.score >= 60) this.grade = 'C';
  else if (this.score >= 50) this.grade = 'D';
  else if (this.score >= 40) this.grade = 'E';
  else this.grade = 'F';
  next();
});

module.exports = mongoose.model('Grade', gradeSchema);