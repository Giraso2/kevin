const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Make io accessible to routes
app.set('io', io);

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);
  
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });
  
  socket.on('sendMessage', (data) => {
    io.to(data.receiverId).emit('newMessage', data);
    socket.emit('messageSent', data);
  });
  
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/essa_school')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('MongoDB Error:', err));

// ==================== SCHEMAS ====================
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
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  subject: String,
  qualification: String,
  experience: Number
});

const classSchema = new mongoose.Schema({
  className: String,
  grade: String,
  academicYear: String,
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  createdAt: { type: Date, default: Date.now }
});

const studentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  studentId: String,
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  enrollmentDate: Date
});

const announcementSchema = new mongoose.Schema({
  title: String,
  content: String,
  audience: [String],
  priority: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const newsSchema = new mongoose.Schema({
  title: String,
  summary: String,
  content: String,
  image: String,
  category: { type: String, enum: ['news', 'event', 'announcement'] },
  date: Date,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const gallerySchema = new mongoose.Schema({
  title: String,
  image: String,
  category: String,
  date: Date,
  isActive: { type: Boolean, default: true }
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
  }]
});

const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  date: Date,
  status: String,
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const permissionSchema = new mongoose.Schema({
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  requesterName: String,
  requesterRole: String,
  type: String,
  reason: String,
  fromDate: Date,
  toDate: Date,
  status: { type: String, default: 'pending' }
});

const disciplineSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  incidentDate: Date,
  category: String,
  description: String,
  status: { type: String, default: 'pending' }
});

const pageContentSchema = new mongoose.Schema({
  page: { type: String, required: true, unique: true },
  title: String,
  content: String,
  heroImage: String,
  sections: mongoose.Schema.Types.Mixed,
  updatedAt: { type: Date, default: Date.now }
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
const Class = mongoose.model('Class', classSchema);
const Student = mongoose.model('Student', studentSchema);
const Announcement = mongoose.model('Announcement', announcementSchema);
const News = mongoose.model('News', newsSchema);
const Gallery = mongoose.model('Gallery', gallerySchema);
const Assignment = mongoose.model('Assignment', assignmentSchema);
const Attendance = mongoose.model('Attendance', attendanceSchema);
const Permission = mongoose.model('Permission', permissionSchema);
const Discipline = mongoose.model('Discipline', disciplineSchema);
const PageContent = mongoose.model('PageContent', pageContentSchema);
const Message = mongoose.model('Message', messageSchema);

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
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// ==================== AUTH ROUTES ====================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });
    if (user.role !== role) return res.status(401).json({ message: 'Invalid role selected' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });
    
    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.fullName },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '7d' }
    );
    
    res.json({ success: true, _id: user._id, fullName: user.fullName, email: user.email, role: user.role, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== SUPER ADMIN ROUTES ====================
app.post('/api/super-admin/create-admin', authMiddleware, async (req, res) => {
  const currentUser = await User.findById(req.userId);
  if (currentUser.role !== 'super_admin') return res.status(403).json({ message: 'Access denied' });
  
  const { fullName, email, password, phone, role } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ message: 'Email already exists' });
  
  const hashedPassword = await bcrypt.hash(password || 'admin123', 10);
  const newAdmin = new User({ fullName, email, password: hashedPassword, role, phone: phone || '', createdBy: req.userId });
  await newAdmin.save();
  res.json({ success: true, message: `${role} created`, user: { _id: newAdmin._id, fullName, email, role } });
});

app.get('/api/super-admin/admins', authMiddleware, async (req, res) => {
  const currentUser = await User.findById(req.userId);
  if (currentUser.role !== 'super_admin') return res.status(403).json({ message: 'Access denied' });
  const admins = await User.find({ role: { $in: ['academic_admin', 'discipline_admin', 'accounts_admin'] } }).select('-password');
  res.json(admins);
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
  const announcements = await Announcement.find().sort({ createdAt: -1 }).limit(50);
  res.json(announcements);
});

app.delete('/api/super-admin/announcements/:id', authMiddleware, async (req, res) => {
  await Announcement.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// ==================== ACADEMIC ADMIN ROUTES ====================

// Get all teachers
app.get('/api/academic-admin/teachers', authMiddleware, async (req, res) => {
  const teachers = await User.find({ role: 'teacher' }).select('-password');
  res.json(teachers);
});

// Create teacher
app.post('/api/academic-admin/create-teacher', authMiddleware, async (req, res) => {
  const { fullName, email, password, phone, subject } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ message: 'Email already exists' });
  
  const hashedPassword = await bcrypt.hash(password || 'teacher123', 10);
  const teacher = new User({ fullName, email, password: hashedPassword, role: 'teacher', phone: phone || '', createdBy: req.userId });
  await teacher.save();
  await TeacherProfile.create({ user: teacher._id, subject: subject || 'General' });
  
  res.json({ success: true, message: 'Teacher created', teacher: { _id: teacher._id, fullName, email } });
});

// Delete teacher
app.delete('/api/academic-admin/teachers/:id', authMiddleware, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  await TeacherProfile.findOneAndDelete({ user: req.params.id });
  res.json({ success: true });
});

// Get all classes
app.get('/api/academic-admin/classes', authMiddleware, async (req, res) => {
  const classes = await Class.find().populate('teacher', 'fullName');
  res.json(classes);
});

// Create class
app.post('/api/academic-admin/classes', authMiddleware, async (req, res) => {
  const { className, grade, academicYear, teacherId } = req.body;
  const newClass = new Class({ className, grade, academicYear, teacher: teacherId || null });
  await newClass.save();
  res.json({ success: true, class: newClass });
});

// Delete class
app.delete('/api/academic-admin/classes/:id', authMiddleware, async (req, res) => {
  await Class.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Get all news/events
app.get('/api/academic-admin/news', authMiddleware, async (req, res) => {
  const news = await News.find().sort({ createdAt: -1 });
  res.json(news);
});

// Create news/event
app.post('/api/academic-admin/news', authMiddleware, async (req, res) => {
  const { title, summary, content, image, category, date } = req.body;
  const news = new News({ title, summary, content, image, category, date: date || new Date() });
  await news.save();
  res.json({ success: true, news });
});

// Delete news/event
app.delete('/api/academic-admin/news/:id', authMiddleware, async (req, res) => {
  await News.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Get gallery
app.get('/api/academic-admin/gallery', authMiddleware, async (req, res) => {
  const images = await Gallery.find().sort({ date: -1 });
  res.json(images);
});

// Add gallery image
app.post('/api/academic-admin/gallery', authMiddleware, async (req, res) => {
  const { title, image, category } = req.body;
  const gallery = new Gallery({ title, image, category, date: new Date() });
  await gallery.save();
  res.json({ success: true, gallery });
});

// Delete gallery image
app.delete('/api/academic-admin/gallery/:id', authMiddleware, async (req, res) => {
  await Gallery.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Get/Update page content
app.get('/api/academic-admin/content/:page', authMiddleware, async (req, res) => {
  let content = await PageContent.findOne({ page: req.params.page });
  if (!content) content = { page: req.params.page, title: '', content: '' };
  res.json(content);
});

app.put('/api/academic-admin/content/:page', authMiddleware, async (req, res) => {
  const { title, content, heroImage } = req.body;
  const updated = await PageContent.findOneAndUpdate(
    { page: req.params.page },
    { title, content, heroImage, updatedAt: new Date() },
    { upsert: true, new: true }
  );
  res.json({ success: true, content: updated });
});

// ==================== MESSAGE ROUTES ====================

// Get all users for chat
app.get('/api/messages/users', authMiddleware, async (req, res) => {
  const users = await User.find({ _id: { $ne: req.userId }, isActive: true }).select('fullName email role');
  res.json(users);
});

// Get conversations
app.get('/api/messages/conversations', authMiddleware, async (req, res) => {
  const conversations = await Message.aggregate([
    { $match: { $or: [{ senderId: req.userId }, { receiverId: req.userId }] } },
    { $sort: { createdAt: -1 } },
    { $group: {
        _id: { $cond: [{ $eq: ['$senderId', req.userId] }, '$receiverId', '$senderId'] },
        lastMessage: { $first: '$$ROOT' },
        unreadCount: { $sum: { $cond: [{ $and: [{ $eq: ['$receiverId', req.userId] }, { $eq: ['$isRead', false] }] }, 1, 0] } }
      }
    },
    { $sort: { 'lastMessage.createdAt': -1 } }
  ]);
  
  const result = await Promise.all(conversations.map(async (conv) => {
    const user = await User.findById(conv._id).select('fullName email role');
    return { userId: conv._id, user, lastMessage: conv.lastMessage, unreadCount: conv.unreadCount };
  }));
  
  res.json(result);
});

// Get messages with specific user
app.get('/api/messages/user/:userId', authMiddleware, async (req, res) => {
  const messages = await Message.find({
    $or: [
      { senderId: req.userId, receiverId: req.params.userId },
      { senderId: req.params.userId, receiverId: req.userId }
    ]
  }).sort({ createdAt: 1 });
  
  await Message.updateMany(
    { senderId: req.params.userId, receiverId: req.userId, isRead: false },
    { $set: { isRead: true } }
  );
  
  res.json(messages);
});

// Send message
app.post('/api/messages/send', authMiddleware, async (req, res) => {
  const { receiverId, content } = req.body;
  const sender = await User.findById(req.userId);
  const receiver = await User.findById(receiverId);
  
  const message = new Message({
    senderId: req.userId, senderName: sender.fullName, senderRole: sender.role,
    receiverId, receiverName: receiver.fullName, receiverRole: receiver.role,
    content
  });
  await message.save();
  
  const io = req.app.get('io');
  io.to(receiverId).emit('newMessage', message);
  
  res.json({ success: true, message });
});

// Get unread count
app.get('/api/messages/unread/count', authMiddleware, async (req, res) => {
  const count = await Message.countDocuments({ receiverId: req.userId, isRead: false });
  res.json({ count });
});

// ==================== TEACHER ROUTES ====================
app.get('/api/teacher/students', authMiddleware, async (req, res) => {
  const classes = await Class.find({ teacher: req.userId });
  const classIds = classes.map(c => c._id);
  const students = await Student.find({ classId: { $in: classIds } }).populate('user', 'fullName email');
  res.json(students);
});

app.post('/api/teacher/create-student', authMiddleware, async (req, res) => {
  const { fullName, email, password, studentId, classId } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ message: 'Email exists' });
  
  const hashedPassword = await bcrypt.hash(password || 'student123', 10);
  const studentUser = new User({ fullName, email, password: hashedPassword, role: 'student', createdBy: req.userId });
  await studentUser.save();
  
  const student = new Student({ user: studentUser._id, studentId, classId, enrollmentDate: new Date() });
  await student.save();
  await Class.findByIdAndUpdate(classId, { $push: { students: student._id } });
  
  res.json({ success: true, student: { _id: student._id, studentId, fullName, email, password: password || 'student123' } });
});

app.delete('/api/teacher/students/:id', authMiddleware, async (req, res) => {
  const student = await Student.findById(req.params.id).populate('user');
  await Class.findByIdAndUpdate(student.classId, { $pull: { students: student._id } });
  await User.findByIdAndDelete(student.user._id);
  await Student.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

app.post('/api/teacher/students/:id/reset-password', authMiddleware, async (req, res) => {
  const { newPassword } = req.body;
  const student = await Student.findById(req.params.id).populate('user');
  const hashedPassword = await bcrypt.hash(newPassword || 'student123', 10);
  student.user.password = hashedPassword;
  await student.user.save();
  res.json({ success: true });
});

app.post('/api/teacher/assignments', authMiddleware, async (req, res) => {
  const { title, description, subject, classId, dueDate, totalPoints } = req.body;
  const assignment = new Assignment({ title, description, subject, classId, teacherId: req.userId, dueDate, totalPoints: totalPoints || 100 });
  await assignment.save();
  res.json({ success: true, assignment });
});

app.get('/api/teacher/assignments', authMiddleware, async (req, res) => {
  const assignments = await Assignment.find({ teacherId: req.userId });
  res.json(assignments);
});

app.post('/api/teacher/attendance', authMiddleware, async (req, res) => {
  const { classId, date, records } = req.body;
  for (const record of records) {
    await Attendance.findOneAndUpdate(
      { studentId: record.studentId, date: new Date(date) },
      { classId, status: record.status, teacherId: req.userId },
      { upsert: true }
    );
  }
  res.json({ success: true });
});

app.post('/api/teacher/permissions', authMiddleware, async (req, res) => {
  const { type, reason, fromDate, toDate } = req.body;
  const user = await User.findById(req.userId);
  const permission = new Permission({ requesterId: req.userId, requesterName: user.fullName, requesterRole: user.role, type, reason, fromDate: new Date(fromDate), toDate: new Date(toDate) });
  await permission.save();
  res.json({ success: true });
});

app.post('/api/teacher/discipline', authMiddleware, async (req, res) => {
  const { studentId, category, description, incidentDate } = req.body;
  const discipline = new Discipline({ studentId, reportedBy: req.userId, incidentDate: new Date(incidentDate), category, description });
  await discipline.save();
  res.json({ success: true });
});

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running', timestamp: new Date().toISOString() });
});

// Create default super admin
const createDefaultAdmin = async () => {
  const adminExists = await User.findOne({ role: 'super_admin' });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      fullName: 'Super Administrator',
      email: 'admin@essa.rw',
      password: hashedPassword,
      role: 'super_admin',
      phone: '+250788123456',
      isActive: true
    });
    console.log('\n✅ Super Admin created!');
    console.log('📧 Email: admin@essa.rw');
    console.log('🔑 Password: admin123\n');
  }
};

const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💬 Socket.IO server ready`);
  await createDefaultAdmin();
});