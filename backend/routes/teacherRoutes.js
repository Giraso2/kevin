const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Student = require('../models/Student');
const Class = require('../models/Class');
const Parent = require('../models/Parent');
const Assignment = require('../models/Assignment');
const Attendance = require('../models/Attendance');
const Grade = require('../models/Grade');
const Discipline = require('../models/Discipline');
const Permission = require('../models/Permission');
const { authMiddleware, roleCheck } = require('../middleware/auth');

// Create student with parent linking
router.post('/create-student', authMiddleware, roleCheck(['teacher']), async (req, res) => {
  try {
    const { fullName, email, password, studentId, classId, dateOfBirth, gender, parentEmail, parentName, parentPhone } = req.body;
    
    // Create student user
    const studentUser = new User({
      fullName, email, password, role: 'student', phone: '',
      createdBy: req.userId
    });
    await studentUser.save();
    
    // Create or find parent
    let parentId = null;
    if (parentEmail) {
      let parentUser = await User.findOne({ email: parentEmail });
      if (!parentUser) {
        parentUser = new User({
          fullName: parentName || `${fullName}'s Parent`,
          email: parentEmail,
          password: 'parent123',
          role: 'parent',
          phone: parentPhone,
          createdBy: req.userId
        });
        await parentUser.save();
      }
      parentId = parentUser._id;
    }
    
    // Create student profile
    const student = new Student({
      user: studentUser._id,
      studentId: studentId || `STU${Date.now()}`,
      classId,
      parent: parentId,
      dateOfBirth,
      gender
    });
    await student.save();
    
    // Add student to class
    await Class.findByIdAndUpdate(classId, { $push: { students: student._id } });
    
    res.json({ success: true, message: 'Student created successfully', student: { ...student.toObject(), fullName, email } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get teacher's students
router.get('/students', authMiddleware, roleCheck(['teacher']), async (req, res) => {
  try {
    const teacher = await User.findById(req.userId);
    const classes = await Class.find({ teacher: req.userId });
    const classIds = classes.map(c => c._id);
    const students = await Student.find({ classId: { $in: classIds } }).populate('user', 'fullName email');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create assignment
router.post('/assignments', authMiddleware, roleCheck(['teacher']), async (req, res) => {
  try {
    const { title, description, subject, classId, dueDate, totalPoints } = req.body;
    const assignment = new Assignment({
      title, description, subject, classId, teacherId: req.userId,
      dueDate, totalPoints
    });
    await assignment.save();
    res.json({ success: true, message: 'Assignment created', assignment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get assignments
router.get('/assignments', authMiddleware, roleCheck(['teacher']), async (req, res) => {
  try {
    const assignments = await Assignment.find({ teacherId: req.userId }).sort({ createdAt: -1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark attendance
router.post('/attendance', authMiddleware, roleCheck(['teacher']), async (req, res) => {
  try {
    const { classId, date, records } = req.body;
    for (const record of records) {
      await Attendance.findOneAndUpdate(
        { studentId: record.studentId, date: new Date(date) },
        { classId, status: record.status, teacherId: req.userId, remarks: record.remarks },
        { upsert: true }
      );
    }
    res.json({ success: true, message: 'Attendance marked' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add grade
router.post('/grades', authMiddleware, roleCheck(['teacher']), async (req, res) => {
  try {
    const { studentId, subject, score, term, year, remarks } = req.body;
    const grade = new Grade({
      studentId, subject, score, term, year, teacherId: req.userId, remarks
    });
    await grade.save();
    res.json({ success: true, message: 'Grade added', grade });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Report discipline case
router.post('/discipline', authMiddleware, roleCheck(['teacher']), async (req, res) => {
  try {
    const { studentId, category, description } = req.body;
    const discipline = new Discipline({
      studentId, reportedBy: req.userId, incidentDate: new Date(), category, description
    });
    await discipline.save();
    res.json({ success: true, message: 'Discipline case reported' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Request permission
router.post('/permissions', authMiddleware, roleCheck(['teacher', 'student']), async (req, res) => {
  try {
    const { studentId, type, reason, fromDate, toDate } = req.body;
    const user = await User.findById(req.userId);
    const permission = new Permission({
      requesterId: req.userId, requesterName: user.fullName, requesterRole: user.role,
      studentId, studentName: user.role === 'student' ? user.fullName : null,
      type, reason, fromDate, toDate
    });
    await permission.save();
    res.json({ success: true, message: 'Permission request submitted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;