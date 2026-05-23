const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "http://localhost:5173", credentials: true }
});

app.use(cors());
app.use(express.json());

// ==================== MODELS ====================

const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  password: String,
  role: String,
  phone: String,
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const teacherProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fullName: String,
  email: String,
  subject: String,
  phone: String,
  createdAt: { type: Date, default: Date.now }
});

const studentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  studentId: String,
  fullName: String,
  email: String,
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  parentName: String,
  parentPhone: String,
  isActive: { type: Boolean, default: true },
  enrollmentDate: { type: Date, default: Date.now }
});

const classSchema = new mongoose.Schema({
  className: String,
  grade: { type: String, enum: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'] },
  academicYear: String,
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  createdAt: { type: Date, default: Date.now }
});

const assignmentSchema = new mongoose.Schema({
  title: String,
  description: String,
  subject: String,
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dueDate: Date,
  totalPoints: Number,
  submissions: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    submittedAt: Date,
    content: String,
    score: Number,
    status: { type: String, default: 'pending' }
  }],
  createdAt: { type: Date, default: Date.now }
});

const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  date: Date,
  status: String,
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const gradeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  subject: String,
  score: Number,
  grade: String,
  term: String,
  year: Number,
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const disciplineSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  studentName: String,
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reporterName: String,
  category: String,
  description: String,
  action: String,
  actionDetails: String,
  status: { type: String, default: 'pending' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

const permissionSchema = new mongoose.Schema({
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  requesterName: String,
  requesterRole: String,
  type: String,
  reason: String,
  fromDate: Date,
  toDate: Date,
  status: { type: String, default: 'pending' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
  rejectionReason: String,
  createdAt: { type: Date, default: Date.now }
});

const announcementSchema = new mongoose.Schema({
  title: String,
  content: String,
  audience: [String],
  priority: { type: String, default: 'normal' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const newsSchema = new mongoose.Schema({
  title: String,
  summary: String,
  content: String,
  image: String,
  category: { type: String, default: 'news' },
  date: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

const gallerySchema = new mongoose.Schema({
  title: String,
  image: String,
  category: String,
  date: { type: Date, default: Date.now }
});

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  senderName: String,
  senderRole: String,
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiverName: String,
  receiverRole: String,
  content: String,
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const TeacherProfile = mongoose.model('TeacherProfile', teacherProfileSchema);
const Student = mongoose.model('Student', studentSchema);
const Class = mongoose.model('Class', classSchema);
const Assignment = mongoose.model('Assignment', assignmentSchema);
const Attendance = mongoose.model('Attendance', attendanceSchema);
const Grade = mongoose.model('Grade', gradeSchema);
const Discipline = mongoose.model('Discipline', disciplineSchema);
const Permission = mongoose.model('Permission', permissionSchema);
const Announcement = mongoose.model('Announcement', announcementSchema);
const News = mongoose.model('News', newsSchema);
const Gallery = mongoose.model('Gallery', gallerySchema);
const Message = mongoose.model('Message', messageSchema);

// ==================== SOCKET.IO ====================
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  socket.on('join', (userId) => {
    if (userId) socket.join(userId);
    console.log(`User ${userId} joined room`);
  });
  socket.on('sendMessage', (data) => {
    io.to(data.receiverId).emit('newMessage', data);
  });
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// ==================== DATABASE CONNECTION ====================
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/essa_school')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('MongoDB Error:', err.message));

// ==================== MIDDLEWARE ====================
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    req.userId = decoded.id;
    req.userRole = decoded.role;
    req.userName = decoded.name;
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// ==================== AUTH ROUTES ====================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (user.role !== role) return res.status(401).json({ message: 'Invalid role' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    
    const token = jwt.sign({ id: user._id, role: user.role, name: user.fullName }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '7d' });
    res.json({ success: true, _id: user._id, fullName: user.fullName, email: user.email, role: user.role, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== SUPER ADMIN ROUTES ====================
app.get('/api/super-admin/admins', authMiddleware, async (req, res) => {
  const currentUser = await User.findById(req.userId);
  if (currentUser?.role !== 'super_admin') return res.status(403).json({ message: 'Access denied' });
  const admins = await User.find({ role: { $in: ['academic_admin', 'discipline_admin', 'accounts_admin'] } }).select('-password');
  res.json(admins);
});

app.post('/api/super-admin/create-admin', authMiddleware, async (req, res) => {
  const currentUser = await User.findById(req.userId);
  if (currentUser?.role !== 'super_admin') return res.status(403).json({ message: 'Access denied' });
  
  const { fullName, email, password, phone, role } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: 'Email exists' });
  
  const hashedPassword = await bcrypt.hash(password || 'admin123', 10);
  const newAdmin = new User({ fullName, email, password: hashedPassword, role, phone: phone || '', createdBy: req.userId });
  await newAdmin.save();
  res.json({ success: true, user: { _id: newAdmin._id, fullName, email, role } });
});

app.delete('/api/super-admin/admins/:id', authMiddleware, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

app.post('/api/super-admin/announcements', authMiddleware, async (req, res) => {
  const { title, content, audience, priority } = req.body;
  const announcement = new Announcement({ title, content, audience: audience || ['all'], priority: priority || 'normal', createdBy: req.userId });
  await announcement.save();
  res.json({ success: true, announcement });
});

app.get('/api/super-admin/announcements', authMiddleware, async (req, res) => {
  const announcements = await Announcement.find().sort({ createdAt: -1 });
  res.json(announcements);
});

app.get('/api/announcements', authMiddleware, async (req, res) => {
  const announcements = await Announcement.find({ isActive: true }).sort({ createdAt: -1 });
  res.json(announcements);
});

app.delete('/api/super-admin/announcements/:id', authMiddleware, async (req, res) => {
  await Announcement.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});
// ==================== ACADEMIC ADMIN ROUTES (ADD THESE) ====================

// Create Class - FIXED
app.post('/api/academic-admin/classes', authMiddleware, async (req, res) => {
  try {
    const { className, grade, academicYear, teacherId } = req.body;
    
    const currentUser = await User.findById(req.userId);
    if (currentUser?.role !== 'academic_admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const newClass = new Class({
      className,
      grade,
      academicYear,
      teacherId: teacherId || null,
      students: []
    });
    
    await newClass.save();
    
    // Populate teacher info
    let populatedClass = newClass.toObject();
    if (teacherId) {
      const teacher = await TeacherProfile.findOne({ userId: teacherId });
      if (teacher) {
        populatedClass.teacherId = { _id: teacherId, fullName: teacher.fullName };
      }
    }
    
    res.json({ success: true, class: populatedClass });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all classes for academic admin
app.get('/api/academic-admin/classes', authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    if (currentUser?.role !== 'academic_admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const classes = await Class.find().lean();
    
    // Populate teacher names
    for (let cls of classes) {
      if (cls.teacherId) {
        const teacher = await TeacherProfile.findOne({ userId: cls.teacherId });
        if (teacher) {
          cls.teacherId = { _id: cls.teacherId, fullName: teacher.fullName };
        }
      }
    }
    
    res.json(classes);
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Assign teacher to class - FIXED
app.put('/api/academic-admin/classes/:classId/assign-teacher', authMiddleware, async (req, res) => {
  try {
    const { teacherId } = req.body;
    const { classId } = req.params;
    
    const currentUser = await User.findById(req.userId);
    if (currentUser?.role !== 'academic_admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const classItem = await Class.findById(classId);
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    classItem.teacherId = teacherId;
    await classItem.save();
    
    // Get teacher name
    let teacherName = null;
    if (teacherId) {
      const teacher = await TeacherProfile.findOne({ userId: teacherId });
      teacherName = teacher ? teacher.fullName : 'Unknown';
    }
    
    res.json({ 
      success: true, 
      class: {
        ...classItem.toObject(),
        teacherId: teacherId ? { _id: teacherId, fullName: teacherName } : null
      }
    });
  } catch (error) {
    console.error('Assign teacher error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete class
app.delete('/api/academic-admin/classes/:id', authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    if (currentUser?.role !== 'academic_admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await Class.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== NEWS ROUTES ====================

// Get all news
app.get('/api/academic-admin/news', authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    if (currentUser?.role !== 'academic_admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const news = await News.find().sort({ date: -1 });
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create news
app.post('/api/academic-admin/news', authMiddleware, async (req, res) => {
  try {
    const { title, summary, content, image, category } = req.body;
    
    const currentUser = await User.findById(req.userId);
    if (currentUser?.role !== 'academic_admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const news = new News({
      title,
      summary,
      content: content || summary,
      image: image || 'https://via.placeholder.com/800x400/1a3a5c/ffffff?text=News+Image',
      category: category || 'news',
      date: new Date()
    });
    
    await news.save();
    res.json({ success: true, news });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete news
app.delete('/api/academic-admin/news/:id', authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    if (currentUser?.role !== 'academic_admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await News.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Public news endpoint (for frontend)
app.get('/api/news/public', async (req, res) => {
  try {
    const { category, limit = 10 } = req.query;
    const query = {};
    if (category && category !== 'all') query.category = category;
    
    const news = await News.find(query).sort({ date: -1 }).limit(parseInt(limit));
    res.json({ success: true, data: news });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single news
app.get('/api/news/:id', async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ success: false, message: 'News not found' });
    }
    res.json({ success: true, data: news });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== GALLERY ROUTES ====================

// Get all gallery items
app.get('/api/academic-admin/gallery', authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    if (currentUser?.role !== 'academic_admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const gallery = await Gallery.find().sort({ date: -1 });
    res.json(gallery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create gallery item
app.post('/api/academic-admin/gallery', authMiddleware, async (req, res) => {
  try {
    const { title, image, category } = req.body;
    
    const currentUser = await User.findById(req.userId);
    if (currentUser?.role !== 'academic_admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const galleryItem = new Gallery({
      title,
      image: image || 'https://via.placeholder.com/400x300/1a3a5c/ffffff?text=Gallery+Image',
      category: category || 'events',
      date: new Date()
    });
    
    await galleryItem.save();
    res.json({ success: true, gallery: galleryItem });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete gallery item
app.delete('/api/academic-admin/gallery/:id', authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    if (currentUser?.role !== 'academic_admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Public gallery endpoint
app.get('/api/gallery/public', async (req, res) => {
  try {
    const { category, limit = 20 } = req.query;
    const query = {};
    if (category && category !== 'all') query.category = category;
    
    const gallery = await Gallery.find(query).sort({ date: -1 }).limit(parseInt(limit));
    res.json({ success: true, data: gallery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== PERFORMANCE ROUTES ====================

// Get student performance
app.get('/api/academic-admin/students-performance', authMiddleware, async (req, res) => {
  try {
    const students = await Student.find().populate('userId', 'fullName email').populate('classId', 'grade className');
    
    const performanceData = students.map(student => ({
      studentId: student.studentId,
      name: student.fullName,
      class: student.classId ? `${student.classId.grade} ${student.classId.className}` : 'Not Assigned',
      averageScore: Math.floor(Math.random() * 30) + 65 // Demo data
    }));
    
    res.json(performanceData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get class performance
app.get('/api/academic-admin/class-performance', authMiddleware, async (req, res) => {
  try {
    const classes = await Class.find().populate('teacherId', 'fullName');
    
    const performanceData = classes.map(cls => ({
      className: `${cls.grade} ${cls.className}`,
      teacher: cls.teacherId?.fullName || 'Not Assigned',
      studentCount: cls.students?.length || 0,
      averageScore: Math.floor(Math.random() * 25) + 70 // Demo data
    }));
    
    res.json(performanceData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== CONTACT FORM ROUTES ====================

// Contact form submission (public)
app.post('/api/contact/submit', async (req, res) => {
  try {
    const { fullName, email, phone, subject, message } = req.body;
    
    // Here you can send email to kevineniyomurinzi@gmail.com
    console.log('Contact form submission:', { fullName, email, phone, subject, message });
    
    // Save to database if you want
    // const contact = new Contact({ fullName, email, phone, subject, message });
    // await contact.save();
    
    res.json({ 
      success: true, 
      message: 'Your message has been sent successfully. We will respond within 24 hours.' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get contact submissions (admin only)
app.get('/api/academic-admin/contacts', authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    if (currentUser?.role !== 'academic_admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Return demo contacts or from database
    const contacts = [
      { _id: '1', fullName: 'John Doe', email: 'john@example.com', phone: '+250788123456', subject: 'Admission Inquiry', message: 'I would like to know about admission process', status: 'pending', createdAt: new Date() },
      { _id: '2', fullName: 'Jane Smith', email: 'jane@example.com', phone: '+250788123457', subject: 'School Fees', message: 'When is the fee payment deadline?', status: 'read', createdAt: new Date() }
    ];
    
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== ADMISSION ROUTES ====================

// Submit admission application (public)
app.post('/api/admissions/submit', async (req, res) => {
  try {
    const applicationData = req.body;
    console.log('New admission application:', applicationData);
    
    // Here you can save to database and send email
    
    res.json({ 
      success: true, 
      message: 'Your application has been submitted successfully. You will receive a confirmation email shortly.',
      applicationId: 'APP_' + Date.now()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all applications (admin only)
app.get('/api/academic-admin/applications', authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    if (currentUser?.role !== 'academic_admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Return demo applications
    const applications = [
      { _id: '1', fullName: 'John Doe', email: 'john@example.com', phone: '+250788123456', level: 'S5 - Software Development', status: 'pending', applicationDate: new Date() },
      { _id: '2', fullName: 'Jane Smith', email: 'jane@example.com', phone: '+250788123457', level: 'S4 - Computer Science', status: 'reviewing', applicationDate: new Date() }
    ];
    
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update application status
app.put('/api/academic-admin/applications/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    // Update application status in database
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== SUBSCRIPTION ROUTES ====================

// Subscribe to newsletter (public)
app.post('/api/subscriptions/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    console.log('New subscription:', email);
    res.json({ success: true, message: 'Subscribed successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// ==================== TEACHER ROUTES ====================

// Teacher creates a class - FIXED
app.post('/api/teacher/create-class', authMiddleware, async (req, res) => {
  try {
    const { className, grade, academicYear } = req.body;
    
    console.log('Create class request from user:', req.userId);
    
    // Find the teacher
    const teacher = await User.findById(req.userId);
    if (!teacher) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (teacher.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can create classes' });
    }
    
    const newClass = new Class({ 
      className, 
      grade, 
      academicYear, 
      teacherId: req.userId,
      students: []
    });
    
    await newClass.save();
    const populatedClass = await Class.findById(newClass._id).populate('teacherId', 'fullName');
    
    res.json({ success: true, message: 'Class created successfully', class: populatedClass });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Teacher gets their classes
app.get('/api/teacher/classes', authMiddleware, async (req, res) => {
  try {
    const classes = await Class.find({ teacherId: req.userId }).populate('teacherId', 'fullName');
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Teacher updates their class
app.put('/api/teacher/classes/:classId', authMiddleware, async (req, res) => {
  try {
    const { className, grade, academicYear } = req.body;
    const classItem = await Class.findOne({ _id: req.params.classId, teacherId: req.userId });
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found or not yours' });
    }
    
    classItem.className = className;
    classItem.grade = grade;
    classItem.academicYear = academicYear;
    await classItem.save();
    
    res.json({ success: true, message: 'Class updated successfully', class: classItem });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Teacher deletes their class
app.delete('/api/teacher/classes/:classId', authMiddleware, async (req, res) => {
  try {
    const classItem = await Class.findOne({ _id: req.params.classId, teacherId: req.userId });
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found or not yours' });
    }
    
    await Student.deleteMany({ classId: req.params.classId });
    await Class.findByIdAndDelete(req.params.classId);
    
    res.json({ success: true, message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Teacher adds a student
app.post('/api/teacher/add-student', authMiddleware, async (req, res) => {
  try {
    const { fullName, email, password, studentId, classId, parentName, parentPhone } = req.body;
    
    const classItem = await Class.findOne({ _id: classId, teacherId: req.userId });
    if (!classItem) {
      return res.status(403).json({ message: 'You are not authorized for this class' });
    }
    
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password || 'student123', 10);
    const studentUser = new User({
      fullName,
      email,
      password: hashedPassword,
      role: 'student',
      createdBy: req.userId,
      isActive: true
    });
    await studentUser.save();
    
    const student = new Student({
      userId: studentUser._id,
      studentId: studentId || `STU${Date.now()}`,
      fullName,
      email,
      classId,
      teacherId: req.userId,
      parentName: parentName || '',
      parentPhone: parentPhone || '',
      enrollmentDate: new Date()
    });
    await student.save();
    
    await Class.findByIdAndUpdate(classId, { $push: { students: student._id } });
    
    res.json({ 
      success: true, 
      message: 'Student added successfully',
      student: {
        _id: student._id,
        fullName,
        email,
        studentId: student.studentId,
        password: password || 'student123'
      }
    });
  } catch (error) {
    console.error('Add student error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Teacher gets their students
app.get('/api/teacher/students', authMiddleware, async (req, res) => {
  try {
    const students = await Student.find({ teacherId: req.userId })
      .populate('userId', 'fullName email')
      .populate('classId', 'grade className');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Teacher deletes a student
app.delete('/api/teacher/students/:studentId', authMiddleware, async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    if (student.teacherId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await Class.findByIdAndUpdate(student.classId, { $pull: { students: student._id } });
    await User.findByIdAndDelete(student.userId);
    await Student.findByIdAndDelete(req.params.studentId);
    
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Teacher resets student password
app.post('/api/teacher/students/:studentId/reset-password', authMiddleware, async (req, res) => {
  try {
    const { newPassword } = req.body;
    const student = await Student.findById(req.params.studentId);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    if (student.teacherId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword || 'student123', 10);
    await User.findByIdAndUpdate(student.userId, { password: hashedPassword });
    
    res.json({ success: true, newPassword: newPassword || 'student123' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Teacher creates assignment
app.post('/api/teacher/assignments', authMiddleware, async (req, res) => {
  try {
    const { title, description, subject, classId, dueDate, totalPoints } = req.body;
    
    const classItem = await Class.findOne({ _id: classId, teacherId: req.userId });
    if (!classItem) {
      return res.status(403).json({ message: 'You are not assigned to this class' });
    }
    
    const assignment = new Assignment({
      title,
      description,
      subject,
      classId,
      teacherId: req.userId,
      dueDate,
      totalPoints: totalPoints || 100
    });
    await assignment.save();
    
    res.json({ success: true, assignment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Teacher gets assignments
app.get('/api/teacher/assignments', authMiddleware, async (req, res) => {
  try {
    const assignments = await Assignment.find({ teacherId: req.userId }).populate('classId', 'grade className');
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Teacher marks attendance
app.post('/api/teacher/attendance', authMiddleware, async (req, res) => {
  try {
    const { classId, date, records } = req.body;
    
    const classItem = await Class.findOne({ _id: classId, teacherId: req.userId });
    if (!classItem) {
      return res.status(403).json({ message: 'You are not assigned to this class' });
    }
    
    for (const record of records) {
      await Attendance.findOneAndUpdate(
        { studentId: record.studentId, date: new Date(date) },
        { classId, status: record.status, teacherId: req.userId },
        { upsert: true }
      );
    }
    res.json({ success: true, message: 'Attendance marked successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Teacher gets attendance
app.get('/api/teacher/attendance', authMiddleware, async (req, res) => {
  try {
    const attendance = await Attendance.find({ teacherId: req.userId })
      .populate('studentId', 'fullName studentId');
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== MESSAGE ROUTES ====================
app.get('/api/messages/users', authMiddleware, async (req, res) => {
  const users = await User.find({ _id: { $ne: req.userId }, isActive: true }).select('fullName email role');
  res.json(users);
});

app.get('/api/messages/unread/count', authMiddleware, async (req, res) => {
  const count = await Message.countDocuments({ receiverId: req.userId, isRead: false });
  res.json({ count });
});

app.get('/api/messages/user/:userId', authMiddleware, async (req, res) => {
  const messages = await Message.find({
    $or: [
      { senderId: req.userId, receiverId: req.params.userId },
      { senderId: req.params.userId, receiverId: req.userId }
    ]
  }).sort({ createdAt: 1 });
  
  await Message.updateMany({ senderId: req.params.userId, receiverId: req.userId, isRead: false }, { $set: { isRead: true } });
  res.json(messages);
});

app.post('/api/messages/send', authMiddleware, async (req, res) => {
  const { receiverId, content } = req.body;
  const sender = await User.findById(req.userId);
  const receiver = await User.findById(receiverId);
  
  const message = new Message({
    senderId: req.userId, senderName: sender?.fullName || 'Unknown', senderRole: sender?.role || 'unknown',
    receiverId, receiverName: receiver?.fullName || 'Unknown', receiverRole: receiver?.role || 'unknown',
    content
  });
  await message.save();
  
  io.to(receiverId).emit('newMessage', message);
  res.json({ success: true, message });
});

// ==================== CREATE DEFAULT USERS ====================
const createDefaultUsers = async () => {
  // Create Super Admin
  const existingSuperAdmin = await User.findOne({ email: 'admin@essa.rw' });
  if (!existingSuperAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      fullName: 'Super Administrator',
      email: 'admin@essa.rw',
      password: hashedPassword,
      role: 'super_admin',
      phone: '+250788123456',
      isActive: true
    });
    console.log('✅ Super Admin created: admin@essa.rw / admin123');
  }
  
  // Create Academic Admin
  const existingAcademicAdmin = await User.findOne({ email: 'academic@essa.rw' });
  if (!existingAcademicAdmin) {
    const hashedPassword = await bcrypt.hash('academic123', 10);
    await User.create({
      fullName: 'Academic Administrator',
      email: 'academic@essa.rw',
      password: hashedPassword,
      role: 'academic_admin',
      phone: '+250788123457',
      isActive: true
    });
    console.log('✅ Academic Admin created: academic@essa.rw / academic123');
  }
  
  // Create Sample Teacher
  const existingTeacher = await User.findOne({ email: 'teacher@essa.rw' });
  if (!existingTeacher) {
    const hashedPassword = await bcrypt.hash('teacher123', 10);
    const teacherUser = await User.create({
      fullName: 'John Teacher',
      email: 'teacher@essa.rw',
      password: hashedPassword,
      role: 'teacher',
      phone: '+250788123458',
      isActive: true
    });
    
    await TeacherProfile.create({
      userId: teacherUser._id,
      fullName: 'John Teacher',
      email: 'teacher@essa.rw',
      subject: 'Mathematics & Computer Science',
      phone: '+250788123458'
    });
    console.log('✅ Sample Teacher created: teacher@essa.rw / teacher123');
  }
};

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;

createDefaultUsers().then(() => {
  server.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📍 Health: http://localhost:${PORT}/api/health`);
    console.log(`\n📋 Login Credentials:`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 SUPER ADMIN:');
    console.log('   Email: admin@essa.rw');
    console.log('   Password: admin123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 ACADEMIC ADMIN:');
    console.log('   Email: academic@essa.rw');
    console.log('   Password: academic123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 TEACHER:');
    console.log('   Email: teacher@essa.rw');
    console.log('   Password: teacher123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n💡 WORKFLOW:');
    console.log('1. Academic Admin: Creates teacher accounts only');
    console.log('2. Teacher: Creates classes, adds students, manages everything');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  });
});