const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  studentName: String,
  submittedAt: { type: Date, default: Date.now },
  fileUrl: String,
  score: { type: Number, default: null },
  feedback: String,
  status: { type: String, enum: ['pending', 'submitted', 'graded'], default: 'pending' }
});

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  subject: { type: String, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teacherName: { type: String, required: true },
  className: { type: String, required: true },
  dueDate: { type: Date, required: true },
  totalPoints: { type: Number, default: 100 },
  submissions: [submissionSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Assignment', assignmentSchema);