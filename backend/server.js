const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Import Models
const User = require('./models/User');
const Student = require('./models/Student');
const Grade = require('./models/Grade');
const Assignment = require('./models/Assignment');
const Attendance = require('./models/Attendance');

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/essa_school')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// ==================== AUTH MIDDLEWARE ====================
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const roleCheck = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};

// ==================== AUTH ROUTES ====================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });
    if (user.role !== role) return res.status(401).json({ message: 'Invalid role selected' });
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });
    
    user.lastLogin = new Date();
    await user.save();
    
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '7d' }
    );
    
    // Get role-specific data
    let roleData = null;
    if (role === 'student') {
      roleData = await Student.findOne({ user: user._id });
    }
    
    res.json({
      success: true,
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      roleData,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== TEACHER ROUTES ====================

// Get teacher's students
app.get('/api/teacher/students', authMiddleware, roleCheck('teacher'), async (req, res) => {
  try {
    const teacher = await User.findById(req.userId);
    const students = await Student.find().populate('user', 'fullName email');
    res.json(students.map(s => ({
      id: s._id,
      studentId: s.studentId,
      name: s.user.fullName,
      email: s.user.email,
      grade: s.grade,
      className: s.className,
      combination: s.combination
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add grade
app.post('/api/teacher/grades', authMiddleware, roleCheck('teacher'), async (req, res) => {
  try {
    const { studentId, studentName, subject, score, term, year, remarks } = req.body;
    const teacher = await User.findById(req.userId);
    
    const grade = new Grade({
      student: studentId,
      studentName,
      subject,
      score,
      term,
      year,
      teacher: req.userId,
      teacherName: teacher.fullName,
      remarks
    });
    
    await grade.save();
    res.json({ success: true, message: 'Grade added successfully', grade });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all grades (teacher view)
app.get('/api/teacher/grades', authMiddleware, roleCheck('teacher'), async (req, res) => {
  try {
    const grades = await Grade.find().sort({ createdAt: -1 });
    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create assignment
app.post('/api/teacher/assignments', authMiddleware, roleCheck('teacher'), async (req, res) => {
  try {
    const { title, description, subject, className, dueDate, totalPoints } = req.body;
    const teacher = await User.findById(req.userId);
    
    const assignment = new Assignment({
      title,
      description,
      subject,
      teacher: req.userId,
      teacherName: teacher.fullName,
      className,
      dueDate,
      totalPoints
    });
    
    await assignment.save();
    res.json({ success: true, message: 'Assignment created successfully', assignment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get teacher's assignments
app.get('/api/teacher/assignments', authMiddleware, roleCheck('teacher'), async (req, res) => {
  try {
    const assignments = await Assignment.find({ teacher: req.userId }).sort({ createdAt: -1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Grade assignment submission
app.put('/api/teacher/assignments/:assignmentId/submissions/:submissionId', authMiddleware, roleCheck('teacher'), async (req, res) => {
  try {
    const { score, feedback } = req.body;
    const assignment = await Assignment.findById(req.params.assignmentId);
    
    const submission = assignment.submissions.id(req.params.submissionId);
    submission.score = score;
    submission.feedback = feedback;
    submission.status = 'graded';
    
    await assignment.save();
    res.json({ success: true, message: 'Submission graded successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark attendance
app.post('/api/teacher/attendance', authMiddleware, roleCheck('teacher'), async (req, res) => {
  try {
    const { records } = req.body; // Array of { studentId, studentName, status, subject, date }
    const teacher = await User.findById(req.userId);
    
    for (const record of records) {
      await Attendance.findOneAndUpdate(
        { student: record.studentId, date: new Date(record.date), subject: record.subject },
        { 
          student: record.studentId,
          studentName: record.studentName,
          date: new Date(record.date),
          status: record.status,
          subject: record.subject,
          teacher: req.userId,
          teacherName: teacher.fullName
        },
        { upsert: true, new: true }
      );
    }
    
    res.json({ success: true, message: 'Attendance marked successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get attendance records
app.get('/api/teacher/attendance', authMiddleware, roleCheck('teacher'), async (req, res) => {
  try {
    const { date, subject } = req.query;
    const query = {};
    if (date) query.date = new Date(date);
    if (subject) query.subject = subject;
    
    const attendance = await Attendance.find(query).sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== STUDENT ROUTES ====================

// Get student dashboard data
app.get('/api/student/dashboard', authMiddleware, roleCheck('student'), async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.userId }).populate('user', 'fullName email');
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }
    
    // Get grades
    const grades = await Grade.find({ student: student._id }).sort({ createdAt: -1 });
    const averageScore = grades.length > 0 
      ? (grades.reduce((sum, g) => sum + g.score, 0) / grades.length).toFixed(1)
      : 0;
    
    // Get attendance
    const attendance = await Attendance.find({ student: student._id }).sort({ date: -1 }).limit(10);
    const totalDays = await Attendance.countDocuments({ student: student._id });
    const presentDays = await Attendance.countDocuments({ student: student._id, status: 'Present' });
    const attendanceRate = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;
    
    // Get assignments
    const assignments = await Assignment.find({ className: student.className }).sort({ dueDate: 1 });
    
    const assignmentsWithStatus = assignments.map(assignment => {
      const submission = assignment.submissions.find(s => s.student?.toString() === student._id.toString());
      return {
        id: assignment._id,
        title: assignment.title,
        subject: assignment.subject,
        dueDate: assignment.dueDate,
        status: submission ? submission.status : 'pending',
        score: submission?.score,
        feedback: submission?.feedback
      };
    });
    
    res.json({
      student: {
        id: student._id,
        name: student.user.fullName,
        email: student.user.email,
        studentId: student.studentId,
        grade: student.grade,
        className: student.className,
        combination: student.combination
      },
      grades: grades.slice(0, 5),
      averageScore,
      attendance: attendance.slice(0, 10),
      attendanceRate,
      assignments: assignmentsWithStatus,
      totalAssignments: assignments.length,
      completedAssignments: assignmentsWithStatus.filter(a => a.status === 'submitted' || a.status === 'graded').length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all grades for student
app.get('/api/student/grades', authMiddleware, roleCheck('student'), async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.userId });
    const grades = await Grade.find({ student: student._id }).sort({ term: -1, year: -1 });
    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all attendance for student
app.get('/api/student/attendance', authMiddleware, roleCheck('student'), async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.userId });
    const attendance = await Attendance.find({ student: student._id }).sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit assignment
app.post('/api/student/assignments/:assignmentId/submit', authMiddleware, roleCheck('student'), async (req, res) => {
  try {
    const { fileUrl, comment } = req.body;
    const student = await Student.findOne({ user: req.userId });
    const assignment = await Assignment.findById(req.params.assignmentId);
    
    const existingSubmission = assignment.submissions.find(s => s.student?.toString() === student._id.toString());
    
    if (existingSubmission) {
      existingSubmission.submittedAt = new Date();
      existingSubmission.fileUrl = fileUrl;
      existingSubmission.status = 'submitted';
    } else {
      assignment.submissions.push({
        student: student._id,
        studentName: student.user.fullName,
        fileUrl,
        status: 'submitted'
      });
    }
    
    await assignment.save();
    res.json({ success: true, message: 'Assignment submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== PARENT ROUTES ====================

// Get parent's children data
app.get('/api/parent/children', authMiddleware, roleCheck('parent'), async (req, res) => {
  try {
    const students = await Student.find({ parent: req.userId }).populate('user', 'fullName email');
    res.json(students.map(s => ({
      id: s._id,
      name: s.user.fullName,
      grade: s.grade,
      className: s.className,
      combination: s.combination,
      studentId: s.studentId
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get child's grades
app.get('/api/parent/children/:childId/grades', authMiddleware, roleCheck('parent'), async (req, res) => {
  try {
    const grades = await Grade.find({ student: req.params.childId }).sort({ createdAt: -1 });
    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get child's attendance
app.get('/api/parent/children/:childId/attendance', authMiddleware, roleCheck('parent'), async (req, res) => {
  try {
    const attendance = await Attendance.find({ student: req.params.childId }).sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== ADMIN ROUTES ====================

app.get('/api/admin/dashboard', authMiddleware, roleCheck('admin'), async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalParents = await User.countDocuments({ role: 'parent' });
    const totalGrades = await Grade.countDocuments();
    
    res.json({
      totalStudents,
      totalTeachers,
      totalParents,
      totalGrades,
      recentActivities: await Grade.find().sort({ createdAt: -1 }).limit(5)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== SEED DATABASE ====================

const seedDatabase = async () => {
  const existingUsers = await User.countDocuments();
  if (existingUsers > 0) {
    console.log('Database already has users, skipping seed...');
    return;
  }
  
  // Create users
  const users = [
    { fullName: 'Jean Paul Ndayisaba', email: 'student@essa.rw', password: 'student123', role: 'student', phone: '+250788123457' },
    { fullName: 'Mukansanga Marie', email: 'teacher@essa.rw', password: 'teacher123', role: 'teacher', phone: '+250788123458' },
    { fullName: 'Habimana Jean', email: 'parent@essa.rw', password: 'parent123', role: 'parent', phone: '+250788123459' },
    { fullName: 'Dr. Uwimana Jean Paul', email: 'admin@essa.rw', password: 'admin123', role: 'admin', phone: '+250788123456' }
  ];
  
  const createdUsers = {};
  for (const user of users) {
    const newUser = new User(user);
    await newUser.save();
    createdUsers[user.role] = newUser;
    console.log(`✅ Created user: ${user.email} (${user.role})`);
  }
  
  // Create student profile
  const student = new Student({
    user: createdUsers.student._id,
    studentId: 'STU2024001',
    grade: 'S6',
    className: 'Software Development',
    combination: 'Software Development'
  });
  await student.save();
  console.log('✅ Created student profile');
  
  // Add some sample grades
  const grades = [
    { student: student._id, studentName: 'Jean Paul Ndayisaba', subject: 'Mathematics', score: 85, term: 'Term 1', year: 2026, teacher: createdUsers.teacher._id, teacherName: 'Mukansanga Marie' },
    { student: student._id, studentName: 'Jean Paul Ndayisaba', subject: 'English', score: 78, term: 'Term 1', year: 2026, teacher: createdUsers.teacher._id, teacherName: 'Mukansanga Marie' },
    { student: student._id, studentName: 'Jean Paul Ndayisaba', subject: 'Physics', score: 92, term: 'Term 1', year: 2026, teacher: createdUsers.teacher._id, teacherName: 'Mukansanga Marie' },
    { student: student._id, studentName: 'Jean Paul Ndayisaba', subject: 'Computer Science', score: 95, term: 'Term 1', year: 2026, teacher: createdUsers.teacher._id, teacherName: 'Mukansanga Marie' }
  ];
  
  for (const grade of grades) {
    await Grade.create(grade);
  }
  console.log('✅ Added sample grades');
  
  // Add sample attendance
  const attendanceRecords = [
    { student: student._id, studentName: 'Jean Paul Ndayisaba', date: new Date('2026-04-22'), status: 'Present', subject: 'Mathematics', teacher: createdUsers.teacher._id, teacherName: 'Mukansanga Marie' },
    { student: student._id, studentName: 'Jean Paul Ndayisaba', date: new Date('2026-04-23'), status: 'Present', subject: 'English', teacher: createdUsers.teacher._id, teacherName: 'Mukansanga Marie' },
    { student: student._id, studentName: 'Jean Paul Ndayisaba', date: new Date('2026-04-24'), status: 'Present', subject: 'Physics', teacher: createdUsers.teacher._id, teacherName: 'Mukansanga Marie' },
    { student: student._id, studentName: 'Jean Paul Ndayisaba', date: new Date('2026-04-25'), status: 'Late', subject: 'Chemistry', teacher: createdUsers.teacher._id, teacherName: 'Mukansanga Marie' }
  ];
  
  for (const record of attendanceRecords) {
    await Attendance.create(record);
  }
  console.log('✅ Added sample attendance');
  
  // Add sample assignment
  const assignment = new Assignment({
    title: 'Programming Project',
    description: 'Create a web application using React',
    subject: 'Computer Science',
    teacher: createdUsers.teacher._id,
    teacherName: 'Mukansanga Marie',
    className: 'Software Development',
    dueDate: new Date('2026-05-15'),
    totalPoints: 100
  });
  await assignment.save();
  console.log('✅ Added sample assignment');
  
  console.log('\n🔐 DEMO CREDENTIALS:');
  console.log('-------------------');
  console.log('Student: student@essa.rw / student123');
  console.log('Teacher: teacher@essa.rw / teacher123');
  console.log('Parent: parent@essa.rw / parent123');
  console.log('Admin: admin@essa.rw / admin123');
  console.log('-------------------\n');
};

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}\n`);
  await seedDatabase();
});