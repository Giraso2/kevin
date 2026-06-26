// ==================== LOAD ENVIRONMENT VARIABLES ====================
const dotenv = require('dotenv');
dotenv.config();

const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const http = require('http');
const socketIo = require('socket.io');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }
});

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== FILE UPLOAD CONFIGURATION ====================
const uploadDirs = ['./uploads', './uploads/news', './uploads/gallery', './uploads/profile', './uploads/assignments', './uploads/lessons'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const makeStorage = (folder, prefix) => multer.diskStorage({
  destination: (req, file, cb) => cb(null, `uploads/${folder}/`),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${prefix}-${unique}${path.extname(file.originalname)}`);
  }
});

const imageFileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const uploadNews = multer({ storage: makeStorage('news', 'news'), fileFilter: imageFileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
const uploadGallery = multer({ storage: makeStorage('gallery', 'gallery'), fileFilter: imageFileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
const uploadProfile = multer({ storage: makeStorage('profile', 'profile'), fileFilter: imageFileFilter, limits: { fileSize: 2 * 1024 * 1024 } });
const uploadAssignment = multer({ storage: makeStorage('assignments', 'assignment'), limits: { fileSize: 20 * 1024 * 1024 }, fileFilter: imageFileFilter });
const uploadLesson = multer({ storage: makeStorage('lessons', 'lesson'), limits: { fileSize: 20 * 1024 * 1024 }, fileFilter: imageFileFilter });

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==================== EMAIL CONFIGURATION ====================
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: { rejectUnauthorized: false }
});

emailTransporter.verify((error) => {
  if (error) console.error('❌ Email config error:', error.message);
  else console.log('✅ Email configured for:', process.env.EMAIL_USER);
});

// ==================== SCHEMAS ====================
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  phone: String,
  profileImage: String,
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date
});

const schoolSettingsSchema = new mongoose.Schema({
  schoolName: { type: String, default: 'Lycee St Marcel De Rukara' },
  motto: { type: String, default: 'Excel in Studies, Serve in Spirit, Act in Love' },
  address: { type: String, default: 'P.O Box 123, Kigali, Rwanda' },
  phone: { type: String, default: '+250 788 123 456' },
  email: { type: String, default: 'info@essa.rw' },
  academicYear: { type: String, default: new Date().getFullYear().toString() },
  term: { type: String, default: 'Term 1' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedAt: { type: Date, default: Date.now }
});

const teacherProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fullName: String,
  email: String,
  subject: String,
  phone: String,
  qualification: String,
  experience: String,
  createdAt: { type: Date, default: Date.now }
});
// ==================== VISITOR SCHEMA ====================
const visitorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: String,
  phone: String,
  purpose: { type: String, required: true },
  personToVisit: String,
  arrivalTime: { type: Date, default: Date.now },
  departureTime: Date,
  createdAt: { type: Date, default: Date.now }
});

// ==================== EVENT SCHEMA ====================
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: { type: Date, required: true },
  time: String,
  location: String,
  organizer: String,
  permissionRequired: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const studentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  studentId: { type: String, unique: true },
  fullName: { type: String, required: true },
  email: String,
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  parentName: String,
  parentPhone: String,
  parentEmail: String,
  dateOfBirth: Date,
  gender: { type: String, enum: ['male', 'female', 'other'] },
  address: String,
  isActive: { type: Boolean, default: true },
  enrollmentDate: { type: Date, default: Date.now }
});

const classSchema = new mongoose.Schema({
  className: { type: String, required: true },
  grade: { type: String, enum: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'], required: true },
  academicYear: { type: String, required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  capacity: { type: Number, default: 40 },
  subjects: [String],
  createdAt: { type: Date, default: Date.now }
});

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  grade: { type: String, enum: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'], required: true },
  description: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const timetableSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  day: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], required: true },
  period: { type: String, required: true },
  subject: { type: String, required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teacherName: String,
  timeFrom: String,
  timeTo: String,
  isBreak: { type: Boolean, default: false },
  isLunch: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  subject: String,
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dueDate: { type: Date, required: true },
  totalPoints: { type: Number, default: 100 },
  fileUrl: String,
  type: { type: String, enum: ['homework', 'classwork', 'project', 'quiz'], default: 'homework' },
  status: { type: String, enum: ['published', 'draft', 'archived'], default: 'published' },
  submissions: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    submittedAt: Date,
    content: String,
    fileUrl: String,
    score: Number,
    feedback: String,
    status: { type: String, default: 'pending' }
  }],
  createdAt: { type: Date, default: Date.now }
});

const lessonPlanSchema = new mongoose.Schema({
  title: { type: String, required: true },
  topic: { type: String, required: true },
  objectives: String,
  materials: String,
  fileUrl: String,
  shareWithStudents: { type: Boolean, default: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  createdAt: { type: Date, default: Date.now }
});

const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['present', 'absent', 'late', 'excused'], required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  remarks: String,
  period: String
});

const gradeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subject: { type: String, required: true },
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' },
  score: { type: Number, required: true },
  grade: { type: String, required: true },
  term: { type: String, required: true },
  year: { type: Number, required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  feedback: String,
  createdAt: { type: Date, default: Date.now }
});

const disciplineSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  studentName: { type: String, required: true },
  className: String,
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reporterName: String,
  category: { type: String, required: true },
  description: { type: String, required: true },
  severity: { type: String, enum: ['minor', 'moderate', 'major'], default: 'moderate' },
  evidence: String,
  action: String,
  actionDetails: String,
  status: { type: String, enum: ['pending', 'reviewing', 'resolved', 'dismissed'], default: 'pending' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

const permissionSchema = new mongoose.Schema({
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requesterName: { type: String, required: true },
  requesterRole: { type: String, required: true },
  type: { type: String, enum: ['medical', 'emergency', 'travel', 'bereavement', 'other'], required: true },
  reason: { type: String, required: true },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
  rejectionReason: String,
  slipGeneratedCount: { type: Number, default: 0 },
  lastSlipGeneratedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  audience: { type: mongoose.Schema.Types.Mixed, default: ['all'] },
  priority: { type: String, enum: ['normal', 'high', 'urgent'], default: 'normal' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true },
  expiresAt: Date,
  createdAt: { type: Date, default: Date.now }
});

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  summary: { type: String, required: true },
  content: String,
  image: String,
  category: { type: String, enum: ['news', 'event', 'announcement', 'achievement'], default: 'news' },
  tags: [String],
  author: { type: String, required: true },
  date: { type: Date, default: Date.now },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const gallerySchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, enum: ['events', 'academic', 'sports', 'cultural'], default: 'events' },
  description: String,
  photographer: { type: String, default: 'School Media Team' },
  date: { type: Date, default: Date.now },
  views: { type: Number, default: 0 },
  downloads: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true }
});

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, required: true },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipientName: { type: String, required: true },
  recipientRole: { type: String, required: true },
  subject: { type: String, required: true },
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  readAt: Date,
  isArchived: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  attachments: [String],
  parentMessageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  createdAt: { type: Date, default: Date.now }
});

const conversationSchema = new mongoose.Schema({
  participants: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    role: String,
    lastReadAt: Date
  }],
  lastMessage: String,
  lastMessageAt: { type: Date, default: Date.now },
  subject: String,
  messageCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
});

const admissionApplicationSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  nationality: { type: String, default: 'Rwandan' },
  nationalId: String,
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  level: { type: String, required: true },
  previousSchool: { type: String, required: true },
  lastAverage: { type: Number, required: true },
  achievements: String,
  parentName: { type: String, required: true },
  parentPhone: { type: String, required: true },
  parentEmail: String,
  parentOccupation: String,
  applyScholarship: { type: Boolean, default: false },
  reportCardUrl: String,
  birthCertUrl: String,
  studentPhotoUrl: String,
  applicationNumber: { type: String, unique: true },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'accepted', 'rejected', 'waitlisted'],
    default: 'pending'
  },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewNotes: String,
  reviewedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const contactSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  subject: String,
  message: { type: String, required: true },
  status: { type: String, enum: ['unread', 'read', 'replied'], default: 'unread' },
  repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  repliedAt: Date,
  reply: String,
  createdAt: { type: Date, default: Date.now }
});

const subscriptionSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  subscribedAt: { type: Date, default: Date.now }
});

const feeStructureSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  feeType: { type: String, required: true },
  amount: { type: Number, required: true },
  dueDate: Date,
  description: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const feePaymentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  studentName: String,
  amount: { type: Number, required: true },
  feeType: { type: String, required: true },
  paymentDate: { type: Date, default: Date.now },
  receiptNo: { type: String, unique: true },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'completed' },
  paymentMethod: { type: String, enum: ['cash', 'bank', 'mobile', 'card'], default: 'cash' },
  reference: String,
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const salarySchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  teacherName: { type: String, required: true },
  subject: String,
  amount: { type: Number, required: true },
  month: { type: String, required: true },
  year: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'approved', 'paid'], default: 'pending' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  paidAt: Date,
  createdAt: { type: Date, default: Date.now }
});

const budgetSchema = new mongoose.Schema({
  total: { type: Number, default: 0 },
  year: { type: String, default: new Date().getFullYear().toString() },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedAt: { type: Date, default: Date.now }
});

const incomeSchema = new mongoose.Schema({
  source: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  description: String,
  reference: String,
  category: { type: String, enum: ['fees', 'donations', 'grants', 'other'], default: 'other' },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

const expenseSchema = new mongoose.Schema({
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  description: String,
  reference: String,
  type: { type: String, enum: ['operational', 'salaries', 'maintenance', 'supplies', 'other'], default: 'operational' },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

// Auto-generate application number
admissionApplicationSchema.pre('save', async function (next) {
  if (!this.applicationNumber) {
    const count = await mongoose.model('AdmissionApplication').countDocuments();
    this.applicationNumber = `APP-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Auto-generate student ID
studentSchema.pre('save', async function (next) {
  if (!this.studentId) {
    const count = await mongoose.model('Student').countDocuments();
    this.studentId = `STU${new Date().getFullYear()}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});
const Visitor = mongoose.model('Visitor', visitorSchema);
const Event = mongoose.model('Event', eventSchema);
// Auto-generate receipt number
feePaymentSchema.pre('save', async function (next) {
  if (!this.receiptNo) {
    const count = await mongoose.model('FeePayment').countDocuments();
    this.receiptNo = `RCP-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// ==================== REGISTER MODELS ====================
const User = mongoose.model('User', userSchema);
const SchoolSettings = mongoose.model('SchoolSettings', schoolSettingsSchema);
const TeacherProfile = mongoose.model('TeacherProfile', teacherProfileSchema);
const Student = mongoose.model('Student', studentSchema);
const Class = mongoose.model('Class', classSchema);
const Subject = mongoose.model('Subject', subjectSchema);
const Timetable = mongoose.model('Timetable', timetableSchema);
const Assignment = mongoose.model('Assignment', assignmentSchema);
const Attendance = mongoose.model('Attendance', attendanceSchema);
const Grade = mongoose.model('Grade', gradeSchema);
const Discipline = mongoose.model('Discipline', disciplineSchema);
const Permission = mongoose.model('Permission', permissionSchema);
const Announcement = mongoose.model('Announcement', announcementSchema);
const News = mongoose.model('News', newsSchema);
const Gallery = mongoose.model('Gallery', gallerySchema);
const Message = mongoose.model('Message', messageSchema);
const Conversation = mongoose.model('Conversation', conversationSchema);
const AdmissionApplication = mongoose.model('AdmissionApplication', admissionApplicationSchema);
const Contact = mongoose.model('Contact', contactSchema);
const Subscription = mongoose.model('Subscription', subscriptionSchema);
const FeeStructure = mongoose.model('FeeStructure', feeStructureSchema);
const FeePayment = mongoose.model('FeePayment', feePaymentSchema);
const Salary = mongoose.model('Salary', salarySchema);
const Budget = mongoose.model('Budget', budgetSchema);
const Income = mongoose.model('Income', incomeSchema);
const Expense = mongoose.model('Expense', expenseSchema);
const LessonPlan = mongoose.model('LessonPlan', lessonPlanSchema);

// ==================== MIDDLEWARE ====================
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    req.userId = decoded.id;
    req.userRole = decoded.role;
    req.userName = decoded.name;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.userRole)) return res.status(403).json({ message: 'Access denied' });
  next();
};

// ==================== SOCKET.IO ====================
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    socket.userId = decoded.id;
    socket.userRole = decoded.role;
    next();
  } catch {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log('🔌 Connected:', socket.userId);
  socket.join(socket.userId);

  socket.on('join', (userId) => { if (userId) socket.join(userId); });
  socket.on('sendMessage', (data) => { io.to(data.receiverId).emit('newMessage', data); });
  socket.on('typing', ({ recipientId, isTyping }) => {
    socket.to(recipientId).emit('user_typing', { userId: socket.userId, isTyping });
  });
  socket.on('mark_read', ({ messageId, senderId }) => {
    socket.to(senderId).emit('message_read', { messageId });
  });
  socket.on('disconnect', () => { console.log('🔌 Disconnected:', socket.userId); });
});

// ==================== EMAIL HELPERS ====================
const sendWelcomeEmail = async (user) => {
  if (!process.env.EMAIL_USER) return;
  await emailTransporter.sendMail({
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: `Welcome to ESSA Nyarugunga Portal, ${user.fullName}!`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:linear-gradient(135deg,#1a3a5c,#2c5f8a);color:white;padding:30px;text-align:center;border-radius:10px 10px 0 0;">
        <h2>🎓 Welcome to ESSA Nyarugunga Portal</h2></div>
      <div style="background:#f5f5f5;padding:30px;border-radius:0 0 10px 10px;">
        <h3>Dear ${user.fullName},</h3>
        <p>Your account has been created successfully.</p>
        <div style="background:white;padding:15px;border-radius:8px;border-left:4px solid #ffc107;">
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Password:</strong> ${user.tempPassword || 'Set by administrator'}</p>
          <p><strong>Role:</strong> ${user.role?.toUpperCase()}</p>
        </div>
        <p>Best regards,<br><strong>ESSA Nyarugunga Administration</strong></p>
      </div></div>`
  });
};

// ==================== SEEDING ====================
const seedDatabase = async () => {
  console.log('\n🌱 Seeding database...');
  await Promise.all([
    User.deleteMany({}), TeacherProfile.deleteMany({}), Student.deleteMany({}),
    Class.deleteMany({}), Announcement.deleteMany({}), News.deleteMany({}),
    Gallery.deleteMany({}), AdmissionApplication.deleteMany({}),
    Contact.deleteMany({}), Subscription.deleteMany({}),
    SchoolSettings.deleteMany({}), Subject.deleteMany({}), Timetable.deleteMany({})
  ]);

  const hashedPassword = await bcrypt.hash('admin123', 10);
  const superAdmin = await User.create({
    fullName: 'Head Master',
    email: 'admin@essa.rw',
    password: hashedPassword,
    role: 'super_admin',
    phone: '+250788123456',
    isActive: true
  });

  await SchoolSettings.create({
    schoolName: 'Lycee St Marcel De Rukara',
    motto: 'Excel in Studies, Serve in Spirit, Act in Love',
    address: 'P.O Box 123, Kigali, Rwanda',
    phone: '+250 788 123 456',
    email: 'info@essa.rw',
    academicYear: new Date().getFullYear().toString(),
    term: 'Term 1',
    updatedBy: superAdmin._id
  });

  // Create some sample subjects
  const sampleSubjects = [
    { name: 'Mathematics', code: 'MATH', grade: 'S1' },
    { name: 'English', code: 'ENG', grade: 'S1' },
    { name: 'Physics', code: 'PHY', grade: 'S1' },
    { name: 'Chemistry', code: 'CHEM', grade: 'S1' },
    { name: 'Biology', code: 'BIO', grade: 'S1' },
    { name: 'History', code: 'HIST', grade: 'S1' },
    { name: 'Geography', code: 'GEO', grade: 'S1' },
  ];
  for (const s of sampleSubjects) {
    await Subject.create(s);
  }

  await Announcement.create([
    { title: 'Welcome to 2026 Academic Year', content: 'We are excited to welcome all students back.', audience: ['all'], priority: 'high', createdBy: superAdmin._id },
    { title: 'Parent-Teacher Conference', content: 'Scheduled for May 20, 2026.', audience: ['parents'], priority: 'normal', createdBy: superAdmin._id }
  ]);

  await News.create([
    { title: 'ESSA Wins Science Competition', summary: 'First place at the National Science Fair.', category: 'achievement', author: 'Science Dept', isPublished: true },
    { title: 'New Computer Lab Opens', summary: 'State-of-the-art lab with 50 new computers.', category: 'announcement', author: 'ICT Dept', isPublished: true }
  ]);

  await Gallery.create([
    { title: 'Graduation 2025', image: 'https://via.placeholder.com/500x350', category: 'events', isPublished: true },
    { title: 'Sports Day', image: 'https://via.placeholder.com/500x350', category: 'sports', isPublished: true }
  ]);

  console.log('✅ Super Admin: admin@essa.rw / admin123');
  console.log('🎉 Seeding done!\n');
};

// ==================== HEALTH ====================
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }));

// ==================== AUTH ====================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: 'Invalid credentials' });
    if (!user.isActive)
      return res.status(403).json({ message: 'Account is deactivated' });

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.fullName },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '7d' }
    );
    res.json({
      success: true,
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== SCHOOL SETTINGS ====================
app.get('/api/school-settings', async (req, res) => {
  try {
    let settings = await SchoolSettings.findOne();
    if (!settings) {
      settings = await SchoolSettings.create({
        schoolName: 'Lycee St Marcel De Rukara',
        motto: 'Excel in Studies, Serve in Spirit, Act in Love',
        address: 'P.O Box 123, Kigali, Rwanda',
        phone: '+250 788 123 456',
        email: 'info@essa.rw',
        academicYear: new Date().getFullYear().toString(),
        term: 'Term 1'
      });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/school-settings', authMiddleware, requireRole('super_admin'), async (req, res) => {
  try {
    let settings = await SchoolSettings.findOne();
    if (!settings) {
      settings = new SchoolSettings(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    settings.updatedBy = req.userId;
    settings.updatedAt = new Date();
    await settings.save();
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== PROFILE ====================
app.post('/api/user/upload-profile', authMiddleware, uploadProfile.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/profile/${req.file.filename}`;
    await User.findByIdAndUpdate(req.userId, { profileImage: imageUrl });
    res.json({ success: true, imageUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/user/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/user/profile', authMiddleware, async (req, res) => {
  try {
    const { fullName, phone } = req.body;
    const user = await User.findByIdAndUpdate(req.userId, { fullName, phone }, { new: true }).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/user/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);
    if (!(await bcrypt.compare(currentPassword, user.password)))
      return res.status(400).json({ message: 'Current password is incorrect' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== CONTACT ====================
app.post('/api/contact/submit', async (req, res) => {
  try {
    const { fullName, email, phone, subject, message } = req.body;
    const contact = await Contact.create({ fullName, email, phone, subject, message });
    if (process.env.EMAIL_USER) {
      emailTransporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL || 'admin@essa.rw',
        subject: `📬 New Contact from ${fullName}`,
        html: `<p><b>Name:</b> ${fullName}</p><p><b>Email:</b> ${email}</p><p><b>Phone:</b> ${phone || '-'}</p><p><b>Subject:</b> ${subject || '-'}</p><p><b>Message:</b> ${message}</p>`
      }).catch(console.error);
    }
    res.json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/admin/contacts', authMiddleware, requireRole('super_admin', 'secretary_admin'), async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/admin/contacts/:id', authMiddleware, requireRole('super_admin', 'secretary_admin'), async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status, repliedBy: req.userId, repliedAt: new Date(), reply: req.body.reply },
      { new: true }
    );
    res.json({ success: true, contact });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== SUBSCRIPTIONS ====================
app.post('/api/subscriptions/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    let sub = await Subscription.findOne({ email });
    if (sub) {
      if (!sub.isActive) { sub.isActive = true; await sub.save(); }
      return res.json({ success: true, message: 'Subscribed successfully!' });
    }
    await Subscription.create({ email });
    res.json({ success: true, message: 'Subscribed successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/subscriptions/unsubscribe', async (req, res) => {
  try {
    await Subscription.findOneAndUpdate({ email: req.body.email }, { isActive: false });
    res.json({ success: true, message: 'Unsubscribed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== ANNOUNCEMENTS ====================
app.get('/api/announcements', async (req, res) => {
  try {
    const announcements = await Announcement.find({ isActive: true }).sort({ createdAt: -1 });
    const formatted = announcements.map(ann => ({
      ...ann.toObject(),
      audience: Array.isArray(ann.audience) ? ann.audience[0] : (ann.audience || 'all')
    }));
    res.json(formatted);
  } catch (error) {
    console.error('GET /api/announcements error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/announcements', authMiddleware, async (req, res) => {
  try {
    const allowedRoles = ['super_admin', 'academic_admin', 'discipline_admin', 'accounts_admin', 'secretary_admin'];
    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({ message: 'Access denied. You do not have permission to post announcements.' });
    }

    let audience = req.body.audience;
    if (typeof audience === 'string') {
      audience = audience === 'all' ? ['all'] : [audience];
    }
    if (!audience || (Array.isArray(audience) && audience.length === 0)) {
      audience = ['all'];
    }

    const announcement = await Announcement.create({
      title: req.body.title,
      content: req.body.content,
      audience: audience,
      priority: req.body.priority || 'normal',
      createdBy: req.userId,
      isActive: true,
      expiresAt: req.body.expiresAt
    });

    res.json({
      success: true,
      announcement: {
        ...announcement.toObject(),
        audience: announcement.audience[0]
      }
    });
  } catch (error) {
    console.error('POST /api/announcements error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/super-admin/announcements', authMiddleware, requireRole('super_admin'), async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    const formatted = announcements.map(ann => ({
      ...ann.toObject(),
      audience: Array.isArray(ann.audience) ? ann.audience[0] : (ann.audience || 'all')
    }));
    res.json(formatted);
  } catch (error) {
    console.error('GET /api/super-admin/announcements error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/super-admin/announcements', authMiddleware, requireRole('super_admin'), async (req, res) => {
  try {
    let audience = req.body.audience;
    if (typeof audience === 'string') {
      audience = audience === 'all' ? ['all'] : [audience];
    }
    if (!audience || (Array.isArray(audience) && audience.length === 0)) {
      audience = ['all'];
    }

    const announcement = await Announcement.create({
      title: req.body.title,
      content: req.body.content,
      audience: audience,
      priority: req.body.priority || 'normal',
      createdBy: req.userId,
      isActive: true,
      expiresAt: req.body.expiresAt
    });

    res.json({
      success: true,
      announcement: {
        ...announcement.toObject(),
        audience: announcement.audience[0]
      }
    });
  } catch (error) {
    console.error('POST /api/super-admin/announcements error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/super-admin/announcements/:id', authMiddleware, requireRole('super_admin'), async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({
      success: true,
      announcement: {
        ...announcement.toObject(),
        audience: Array.isArray(announcement.audience) ? announcement.audience[0] : (announcement.audience || 'all')
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/super-admin/announcements/:id', authMiddleware, requireRole('super_admin'), async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== NEWS ====================
app.get('/api/news/public', async (req, res) => {
  try {
    const { category, limit = 10 } = req.query;
    const query = { isPublished: true };
    if (category && category !== 'all') query.category = category;
    const news = await News.find(query).sort({ date: -1 }).limit(parseInt(limit));
    res.json({ success: true, data: news });
  } catch (error) {
    res.status(500).json({ success: false, data: [] });
  }
});

app.get('/api/news/:id', async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
    if (!news) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: news });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/academic-admin/news', authMiddleware, requireRole('academic_admin', 'super_admin'), async (req, res) => {
  const news = await News.find().sort({ date: -1 });
  res.json(news);
});

app.post('/api/academic-admin/news', authMiddleware, requireRole('academic_admin', 'super_admin'), uploadNews.single('image'), async (req, res) => {
  try {
    const { title, summary, content, category, tags } = req.body;
    const currentUser = await User.findById(req.userId);
    const imageUrl = req.file ? `${req.protocol}://${req.get('host')}/uploads/news/${req.file.filename}` : null;
    const news = await News.create({
      title, summary, content: content || summary,
      image: imageUrl, category: category || 'news',
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      author: currentUser?.fullName || 'Academic Admin',
      date: new Date(), isPublished: true
    });
    res.json({ success: true, news, imageUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/academic-admin/news/:id', authMiddleware, requireRole('academic_admin', 'super_admin'), async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(req.params.id, { ...req.body, updatedAt: new Date() }, { new: true });
    res.json({ success: true, news });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/academic-admin/news/:id', authMiddleware, requireRole('academic_admin', 'super_admin'), async (req, res) => {
  await News.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// ==================== GALLERY ====================
app.get('/api/gallery/public', async (req, res) => {
  try {
    const { category, limit = 20 } = req.query;
    const query = { isPublished: true };
    if (category && category !== 'all') query.category = category;
    const gallery = await Gallery.find(query).sort({ date: -1 }).limit(parseInt(limit));
    res.json({ success: true, data: gallery });
  } catch (error) {
    res.status(500).json({ success: false, data: [] });
  }
});

app.get('/api/academic-admin/gallery', authMiddleware, requireRole('academic_admin', 'super_admin'), async (req, res) => {
  const gallery = await Gallery.find().sort({ date: -1 });
  res.json(gallery);
});

app.post('/api/academic-admin/gallery', authMiddleware, requireRole('academic_admin', 'super_admin'), uploadGallery.single('image'), async (req, res) => {
  try {
    const { title, category, description } = req.body;
    const imageUrl = req.file ? `${req.protocol}://${req.get('host')}/uploads/gallery/${req.file.filename}` : null;
    if (!imageUrl) return res.status(400).json({ message: 'Image is required' });
    const galleryItem = await Gallery.create({
      title, image: imageUrl,
      category: category || 'events',
      description: description || '',
      isPublished: true
    });
    res.json({ success: true, gallery: galleryItem, imageUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/academic-admin/gallery/:id', authMiddleware, requireRole('academic_admin', 'super_admin'), async (req, res) => {
  await Gallery.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// ==================== ADMISSIONS ====================
app.post('/api/admissions/submit', async (req, res) => {
  try {
    const data = req.body;
    const application = await AdmissionApplication.create({
      fullName: data.fullName,
      dateOfBirth: new Date(data.dateOfBirth),
      nationality: data.nationality || 'Rwandan',
      nationalId: data.nationalId || '',
      email: data.email,
      phone: data.phone,
      address: data.address,
      level: data.level,
      previousSchool: data.previousSchool,
      lastAverage: parseFloat(data.lastAverage),
      achievements: data.achievements || '',
      parentName: data.parentName,
      parentPhone: data.parentPhone,
      parentEmail: data.parentEmail || '',
      parentOccupation: data.parentOccupation || '',
      applyScholarship: data.applyScholarship || false
    });
    res.json({ success: true, message: 'Application submitted!', applicationNumber: application.applicationNumber });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/academic-admin/applications', authMiddleware, requireRole('academic_admin', 'super_admin'), async (req, res) => {
  const applications = await AdmissionApplication.find().sort({ createdAt: -1 });
  res.json(applications);
});

app.put('/api/academic-admin/applications/:id/status', authMiddleware, requireRole('academic_admin', 'super_admin'), async (req, res) => {
  const application = await AdmissionApplication.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
      reviewNotes: req.body.reviewNotes || '',
      reviewedAt: new Date(),
      reviewedBy: req.userId
    },
    { new: true }
  );
  res.json({ success: true, application });
});

// ==================== SUPER ADMIN ====================
app.get('/api/super-admin/admins', authMiddleware, requireRole('super_admin'), async (req, res) => {
  try {
    const admins = await User.find({
      role: { $in: ['academic_admin', 'discipline_admin', 'accounts_admin', 'secretary_admin'] }
    }).select('-password').sort({ createdAt: -1 });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/super-admin/create-admin', authMiddleware, requireRole('super_admin'), async (req, res) => {
  try {
    const { fullName, email, password, phone, role } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already exists' });
    const hashedPassword = await bcrypt.hash(password || 'admin123', 10);
    const newAdmin = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role,
      phone: phone || '',
      createdBy: req.userId
    });
    sendWelcomeEmail({ fullName, email, role, tempPassword: password || 'admin123' }).catch(console.error);
    res.json({ success: true, user: { _id: newAdmin._id, fullName, email, role, isActive: newAdmin.isActive } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/super-admin/admins/:id', authMiddleware, requireRole('super_admin'), async (req, res) => {
  try {
    const { fullName, phone, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { fullName, phone, isActive },
      { new: true }
    ).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/super-admin/admins/:id', authMiddleware, requireRole('super_admin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/super-admin/stats', authMiddleware, requireRole('super_admin'), async (req, res) => {
  try {
    const [
      totalStudents,
      totalTeachers,
      totalClasses,
      pendingApplications,
      pendingDiscipline,
      pendingPermissions,
      totalIncome,
      totalExpenses,
      totalAdmins,
      totalSubjects,
      totalTimetables
    ] = await Promise.all([
      Student.countDocuments({ isActive: true }),
      TeacherProfile.countDocuments(),
      Class.countDocuments(),
      AdmissionApplication.countDocuments({ status: 'pending' }),
      Discipline.countDocuments({ status: 'pending' }),
      Permission.countDocuments({ status: 'pending' }),
      Income.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
      Expense.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
      User.countDocuments({ role: { $in: ['academic_admin', 'discipline_admin', 'accounts_admin', 'secretary_admin'] } }),
      Subject.countDocuments({ isActive: true }),
      Timetable.countDocuments()
    ]);
    res.json({
      success: true,
      totalStudents,
      totalTeachers,
      totalClasses,
      totalAdmins,
      totalSubjects,
      totalTimetables,
      pendingApplications,
      pendingDiscipline,
      pendingPermissions,
      totalIncome: totalIncome[0]?.total || 0,
      totalExpenses: totalExpenses[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== TEACHERS ====================
app.get('/api/academic-admin/teachers-list', authMiddleware, async (req, res) => {
  try {
    const teachers = await TeacherProfile.find().sort({ fullName: 1 });
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/academic-admin/create-teacher-credentials', authMiddleware, requireRole('academic_admin', 'super_admin'), async (req, res) => {
  try {
    const { fullName, email, password, subject, phone, qualification, experience } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already exists' });
    const finalPassword = password || 'teacher123';
    const hashedPassword = await bcrypt.hash(finalPassword, 10);
    const teacherUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: 'teacher',
      phone: phone || '',
      createdBy: req.userId
    });
    const teacherProfile = await TeacherProfile.create({
      userId: teacherUser._id,
      fullName,
      email,
      subject: subject || 'General',
      phone: phone || '',
      qualification,
      experience
    });
    sendWelcomeEmail({ fullName, email, role: 'teacher', tempPassword: finalPassword }).catch(console.error);
    res.json({ success: true, teacher: teacherProfile, password: finalPassword });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/academic-admin/teachers/:id', authMiddleware, requireRole('academic_admin', 'super_admin'), async (req, res) => {
  try {
    const { fullName, email, subject, phone, qualification, experience } = req.body;
    const teacher = await TeacherProfile.findByIdAndUpdate(
      req.params.id,
      { fullName, email, subject, phone, qualification, experience },
      { new: true }
    );
    if (teacher?.userId) await User.findByIdAndUpdate(teacher.userId, { fullName, email, phone });
    res.json({ success: true, teacher });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/academic-admin/teachers/:id', authMiddleware, requireRole('academic_admin', 'super_admin'), async (req, res) => {
  try {
    const teacher = await TeacherProfile.findById(req.params.id);
    if (teacher?.userId) await User.findByIdAndDelete(teacher.userId);
    await TeacherProfile.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== CLASSES ====================
app.get('/api/academic-admin/classes', authMiddleware, async (req, res) => {
  try {
    const classes = await Class.find().lean();
    for (const cls of classes) {
      if (cls.teacherId) {
        const teacher = await TeacherProfile.findOne({ userId: cls.teacherId });
        if (teacher) cls.teacherInfo = { _id: cls.teacherId, fullName: teacher.fullName };
      }
    }
    res.json(classes);
  } catch {
    res.json([]);
  }
});

app.post('/api/academic-admin/classes', authMiddleware, requireRole('academic_admin', 'super_admin'), async (req, res) => {
  try {
    const { className, grade, academicYear, teacherId, capacity, subjects } = req.body;
    const newClass = await Class.create({
      className,
      grade,
      academicYear,
      teacherId: teacherId || null,
      students: [],
      capacity: capacity || 40,
      subjects: subjects || []
    });
    res.json({ success: true, class: newClass });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/academic-admin/classes/:classId/assign-teacher', authMiddleware, requireRole('academic_admin', 'super_admin'), async (req, res) => {
  try {
    const classItem = await Class.findByIdAndUpdate(
      req.params.classId,
      { teacherId: req.body.teacherId },
      { new: true }
    );
    if (!classItem) return res.status(404).json({ message: 'Class not found' });
    res.json({ success: true, class: classItem });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/academic-admin/classes/:id', authMiddleware, requireRole('academic_admin', 'super_admin'), async (req, res) => {
  await Class.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// ==================== SUBJECTS (NEW) ====================
app.get('/api/academic-admin/subjects', authMiddleware, requireRole('academic_admin', 'super_admin'), async (req, res) => {
  try {
    const subjects = await Subject.find({ isActive: true }).sort({ name: 1 });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/academic-admin/subjects', authMiddleware, requireRole('academic_admin', 'super_admin'), async (req, res) => {
  try {
    const { name, code, grade, description } = req.body;
    const existing = await Subject.findOne({ code });
    if (existing) return res.status(400).json({ message: 'Subject code already exists' });
    const subject = await Subject.create({ name, code, grade, description });
    res.json({ success: true, subject });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/academic-admin/subjects/:id', authMiddleware, requireRole('academic_admin', 'super_admin'), async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, subject });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/academic-admin/subjects/:id', authMiddleware, requireRole('academic_admin', 'super_admin'), async (req, res) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== TIMETABLES (NEW) ====================
app.get('/api/academic-admin/timetables', authMiddleware, requireRole('academic_admin', 'super_admin'), async (req, res) => {
  try {
    const { classId } = req.query;
    const query = {};
    if (classId) query.classId = classId;
    const timetables = await Timetable.find(query).populate('classId', 'grade className').populate('teacherId', 'fullName');
    const formatted = timetables.map(t => ({
      ...t.toObject(),
      teacherName: t.teacherId?.fullName || '—'
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/academic-admin/timetables', authMiddleware, requireRole('academic_admin', 'super_admin'), async (req, res) => {
  try {
    const { classId, day, period, subject, teacherId, timeFrom, timeTo } = req.body;
    const teacher = await TeacherProfile.findOne({ userId: teacherId });
    const timetable = await Timetable.create({
      classId,
      day,
      period,
      subject,
      teacherId,
      teacherName: teacher?.fullName || '—',
      timeFrom,
      timeTo
    });
    res.json({ success: true, timetable });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/academic-admin/timetables/:id', authMiddleware, requireRole('academic_admin', 'super_admin'), async (req, res) => {
  try {
    await Timetable.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/academic-admin/timetables/:id', authMiddleware, requireRole('academic_admin', 'super_admin'), async (req, res) => {
  try {
    const timetable = await Timetable.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, timetable });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== STUDENTS ====================
app.get('/api/academic-admin/students', authMiddleware, async (req, res) => {
  try {
    const students = await Student.find().populate('classId', 'grade className').sort({ fullName: 1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/academic-admin/students', authMiddleware, requireRole('academic_admin', 'super_admin', 'teacher'), async (req, res) => {
  try {
    if (req.body.classId) {
      const classItem = await Class.findById(req.body.classId);
      if (req.userRole !== 'super_admin' && req.userRole !== 'academic_admin') {
        if (classItem.teacherId?.toString() !== req.userId) {
          return res.status(403).json({ message: 'You can only add students to your assigned classes' });
        }
      }
    }

    const student = await Student.create({
      fullName: req.body.fullName,
      email: req.body.email || '',
      classId: req.body.classId || null,
      parentName: req.body.parentName || '',
      parentPhone: req.body.parentPhone || '',
      parentEmail: req.body.parentEmail || '',
      dateOfBirth: req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : null,
      gender: req.body.gender || 'other',
      address: req.body.address || '',
      isActive: true
    });

    if (req.body.classId) {
      await Class.findByIdAndUpdate(req.body.classId, { $addToSet: { students: student._id } });
    }

    const hashedPassword = await bcrypt.hash(req.body.password || 'student123', 10);
    const studentUser = await User.create({
      fullName: req.body.fullName,
      email: req.body.email || `${req.body.fullName.replace(/\s/g, '').toLowerCase()}@student.essa.rw`,
      password: hashedPassword,
      role: 'student',
      phone: req.body.parentPhone,
      createdBy: req.userId
    });

    student.userId = studentUser._id;
    await student.save();

    res.json({ success: true, student, generatedPassword: req.body.password || 'student123' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/academic-admin/students/:id', authMiddleware, requireRole('academic_admin', 'super_admin'), async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== PERFORMANCE ====================
app.get('/api/academic-admin/students-performance', authMiddleware, async (req, res) => {
  try {
    const students = await Student.find().populate('classId', 'grade className');
    const performanceData = students.map(s => ({
      studentId: s.studentId || `STU${s._id.toString().slice(-6)}`,
      name: s.fullName,
      class: s.classId ? `${s.classId.grade} ${s.classId.className}` : 'Not Assigned',
      averageScore: Math.floor(Math.random() * 30) + 65
    }));
    res.json(performanceData);
  } catch {
    res.json([]);
  }
});

app.get('/api/academic-admin/class-performance', authMiddleware, async (req, res) => {
  try {
    const classes = await Class.find();
    const performanceData = classes.map(cls => ({
      className: `${cls.grade} ${cls.className}`,
      studentCount: cls.students?.length || 0,
      averageScore: Math.floor(Math.random() * 25) + 70
    }));
    res.json(performanceData);
  } catch {
    res.json([]);
  }
});

// ==================== GRADES ====================
app.get('/api/teacher/grades', authMiddleware, async (req, res) => {
  try {
    const grades = await Grade.find({ teacherId: req.userId }).populate('studentId', 'fullName studentId');
    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/teacher/grades', authMiddleware, requireRole('teacher', 'academic_admin', 'super_admin'), async (req, res) => {
  try {
    const grade = await Grade.create({ ...req.body, teacherId: req.userId });
    res.json({ success: true, grade });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/student/grades/:studentId', authMiddleware, async (req, res) => {
  try {
    const grades = await Grade.find({ studentId: req.params.studentId }).sort({ createdAt: -1 });
    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== ATTENDANCE ====================
app.post('/api/teacher/attendance', authMiddleware, requireRole('teacher', 'academic_admin', 'super_admin'), async (req, res) => {
  try {
    const { classId, date, records } = req.body;
    const bulk = records.map(r => ({
      updateOne: {
        filter: { studentId: r.studentId, classId, date: new Date(date) },
        update: { $set: { status: r.status, teacherId: req.userId, remarks: r.remarks || '' } },
        upsert: true
      }
    }));
    await Attendance.bulkWrite(bulk);
    res.json({ success: true, message: 'Attendance saved' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/teacher/attendance/:classId', authMiddleware, async (req, res) => {
  try {
    const { date } = req.query;
    const query = { classId: req.params.classId };
    if (date) query.date = new Date(date);
    const attendance = await Attendance.find(query).populate('studentId', 'fullName studentId');
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== ASSIGNMENTS ====================
app.get('/api/teacher/assignments', authMiddleware, requireRole('teacher', 'academic_admin', 'super_admin'), async (req, res) => {
  try {
    let query = {};
    if (req.userRole === 'teacher') {
      query.teacherId = req.userId;
    }
    const assignments = await Assignment.find(query).sort({ createdAt: -1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/teacher/assignments', authMiddleware, requireRole('teacher', 'academic_admin', 'super_admin'), uploadAssignment.single('file'), async (req, res) => {
  try {
    const fileUrl = req.file ? `${req.protocol}://${req.get('host')}/uploads/assignments/${req.file.filename}` : null;

    const assignment = await Assignment.create({
      title: req.body.title,
      description: req.body.description || '',
      classId: req.body.classId,
      subject: req.body.subject || '',
      type: req.body.type || 'homework',
      dueDate: new Date(req.body.dueDate),
      totalPoints: parseInt(req.body.totalPoints) || 100,
      fileUrl,
      teacherId: req.userId,
      status: 'published'
    });

    res.json({ success: true, assignment });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/teacher/assignments/:id/submit', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    const student = await Student.findOne({ userId: req.userId });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const existingSubmission = assignment.submissions.find(s => s.studentId.toString() === student._id.toString());
    if (existingSubmission) {
      return res.status(400).json({ message: 'Assignment already submitted' });
    }

    assignment.submissions.push({
      studentId: student._id,
      submittedAt: new Date(),
      content: req.body.content,
      status: 'submitted'
    });
    await assignment.save();

    res.json({ success: true, message: 'Assignment submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== LESSON PLANS ====================
app.get('/api/teacher/lesson-plans', authMiddleware, requireRole('teacher', 'academic_admin', 'super_admin'), async (req, res) => {
  try {
    let query = {};
    if (req.userRole === 'teacher') {
      query.teacherId = req.userId;
    }
    const lessonPlans = await LessonPlan.find(query).sort({ createdAt: -1 });
    res.json(lessonPlans);
  } catch (error) {
    res.json([]);
  }
});

app.post('/api/teacher/lesson-plans', authMiddleware, requireRole('teacher', 'academic_admin', 'super_admin'), uploadLesson.single('file'), async (req, res) => {
  try {
    const fileUrl = req.file ? `${req.protocol}://${req.get('host')}/uploads/lessons/${req.file.filename}` : null;

    const lessonPlan = await LessonPlan.create({
      title: req.body.title,
      topic: req.body.topic,
      objectives: req.body.objectives || '',
      materials: req.body.materials || '',
      fileUrl,
      shareWithStudents: req.body.shareWithStudents === 'true',
      teacherId: req.userId,
      classId: req.body.classId || null
    });

    res.json({ success: true, lessonPlan });
  } catch (error) {
    console.error('Create lesson plan error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ==================== DISCIPLINE ====================
app.get('/api/discipline-admin/cases', authMiddleware, requireRole('discipline_admin', 'super_admin'), async (req, res) => {
  try {
    const cases = await Discipline.find().sort({ createdAt: -1 });
    res.json(cases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/discipline-admin/cases', authMiddleware, async (req, res) => {
  try {
    const disciplineCase = await Discipline.create({
      ...req.body,
      reportedBy: req.userId,
      reporterName: req.userName
    });
    res.json({ success: true, case: disciplineCase });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/discipline-admin/cases/:id', authMiddleware, requireRole('discipline_admin', 'super_admin'), async (req, res) => {
  try {
    const disciplineCase = await Discipline.findByIdAndUpdate(
      req.params.id,
      { ...req.body, reviewedBy: req.userId, reviewedAt: new Date() },
      { new: true }
    );
    res.json({ success: true, case: disciplineCase });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/discipline-admin/stats', authMiddleware, requireRole('discipline_admin', 'super_admin'), async (req, res) => {
  try {
    const [pending, resolved, total] = await Promise.all([
      Discipline.countDocuments({ status: 'pending' }),
      Discipline.countDocuments({ status: 'resolved' }),
      Discipline.countDocuments()
    ]);
    res.json({ success: true, pending, resolved, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== PERMISSIONS ====================
app.get('/api/permissions', authMiddleware, async (req, res) => {
  try {
    let permissions;
    if (req.userRole === 'super_admin' || req.userRole === 'discipline_admin') {
      permissions = await Permission.find().sort({ createdAt: -1 });
    } else {
      permissions = await Permission.find({ requesterId: req.userId }).sort({ createdAt: -1 });
    }
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/permissions', authMiddleware, async (req, res) => {
  try {
    const permission = await Permission.create({
      ...req.body,
      requesterId: req.userId,
      requesterName: req.userName,
      requesterRole: req.userRole
    });
    res.json({ success: true, permission });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/permissions/:id', authMiddleware, async (req, res) => {
  try {
    if (req.userRole !== 'super_admin' && req.userRole !== 'discipline_admin') {
      return res.status(403).json({ message: 'Access denied. Only Super Admin or Discipline Admin can process permissions.' });
    }

    const permission = await Permission.findByIdAndUpdate(
      req.params.id,
      { ...req.body, reviewedBy: req.userId, reviewedAt: new Date() },
      { new: true }
    );
    res.json({ success: true, permission });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== PERMISSION SLIP GENERATION ====================
app.get('/api/permissions/:id/slip', async (req, res) => {
  try {
    let token = req.headers.authorization?.split(' ')[1];
    if (!token && req.query.token) {
      token = req.query.token;
    }

    const permission = await Permission.findById(req.params.id);
    if (!permission) {
      return res.status(404).send('<h2>Permission request not found</h2>');
    }

    if (permission.status !== 'approved') {
      return res.status(400).send('<h2>Permission slip can only be generated for approved requests</h2>');
    }

    const user = await User.findById(permission.requesterId);
    const settings = await SchoolSettings.findOne();

    const slipHtml = `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Permission Slip - ${settings?.schoolName || 'ESSA Nyarugunga'}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #e0e0e0; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; }
          .slip-container { max-width: 800px; width: 100%; background: white; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); overflow: hidden; }
          .header { background: linear-gradient(135deg, #0d1f33, #1a3a5c); color: white; padding: 25px 30px; text-align: center; }
          .header h1 { font-size: 24px; margin-bottom: 5px; letter-spacing: 1px; }
          .header p { font-size: 12px; opacity: 0.8; }
          .content { padding: 30px; }
          .title { text-align: center; margin-bottom: 25px; }
          .title h2 { color: #1a3a5c; font-size: 20px; border-bottom: 2px solid #ffc107; display: inline-block; padding-bottom: 8px; }
          .info-row { display: flex; margin-bottom: 15px; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
          .info-label { width: 140px; font-weight: 700; color: #555; font-size: 13px; }
          .info-value { flex: 1; color: #333; font-size: 14px; }
          .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; background: #e8f5e9; color: #27ae60; }
          .footer { background: #f8f9fa; padding: 20px 30px; text-align: center; font-size: 11px; color: #888; border-top: 1px solid #eee; }
          .signature-area { display: flex; justify-content: space-between; margin-top: 30px; padding-top: 20px; }
          .signature { text-align: center; width: 200px; }
          .signature-line { border-top: 1px solid #333; margin-top: 40px; padding-top: 8px; font-size: 11px; color: #666; }
          .button-group { text-align: center; padding: 20px 30px; background: #f8f9fa; border-top: 1px solid #eee; }
          .print-btn { background: #1a3a5c; color: white; border: none; padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; margin: 0 5px; transition: all 0.2s; }
          .print-btn:hover { background: #0d2b42; transform: translateY(-1px); }
          .close-btn { background: #e74c3c; color: white; border: none; padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; margin: 0 5px; transition: all 0.2s; }
          .close-btn:hover { background: #c0392b; }
          @media print { body { background: white; padding: 0; } .button-group { display: none; } .slip-container { box-shadow: none; border-radius: 0; } }
        </style>
      </head>
      <body>
        <div class="slip-container">
          <div class="header">
            <h1>🎓 ${settings?.schoolName || 'ESSA NYARUGUNGA'}</h1>
            <p>${settings?.motto || 'Excel in Studies, Serve in Spirit, Act in Love'}</p>
            <p>${settings?.address || 'P.O Box 123, Kigali, Rwanda'} | Tel: ${settings?.phone || '+250 788 123 456'}</p>
          </div>
          <div class="content">
            <div class="title"><h2>📄 OFFICIAL PERMISSION SLIP</h2></div>
            <div class="info-row"><div class="info-label">Permission Number:</div><div class="info-value"><strong>#${permission._id.toString().slice(-8).toUpperCase()}</strong></div></div>
            <div class="info-row"><div class="info-label">Requester Name:</div><div class="info-value"><strong>${permission.requesterName || user?.fullName || 'N/A'}</strong></div></div>
            <div class="info-row"><div class="info-label">Role:</div><div class="info-value">${permission.requesterRole?.toUpperCase() || 'N/A'}</div></div>
            <div class="info-row"><div class="info-label">Permission Type:</div><div class="info-value">${permission.type?.toUpperCase() || 'N/A'}</div></div>
            <div class="info-row"><div class="info-label">Reason:</div><div class="info-value">${permission.reason || 'Not specified'}</div></div>
            <div class="info-row"><div class="info-label">Valid From:</div><div class="info-value">${new Date(permission.fromDate).toLocaleDateString('en-RW', { day: '2-digit', month: 'long', year: 'numeric' })}</div></div>
            <div class="info-row"><div class="info-label">Valid To:</div><div class="info-value">${new Date(permission.toDate).toLocaleDateString('en-RW', { day: '2-digit', month: 'long', year: 'numeric' })}</div></div>
            <div class="info-row"><div class="info-label">Status:</div><div class="info-value"><span class="status-badge">✓ APPROVED</span></div></div>
            <div class="info-row"><div class="info-label">Approved On:</div><div class="info-value">${permission.reviewedAt ? new Date(permission.reviewedAt).toLocaleString() : new Date().toLocaleString()}</div></div>
            <div class="signature-area">
              <div class="signature"><div class="signature-line">Student's Signature</div></div>
              <div class="signature"><div class="signature-line">Parent's/Guardian's Signature</div></div>
              <div class="signature"><div class="signature-line">School Stamp & Signature</div></div>
            </div>
          </div>
          <div class="footer">
            <p>This is an electronically generated permission slip. Please present this document when requested.</p>
            <p>© ${new Date().getFullYear()} ${settings?.schoolName || 'ESSA Nyarugunga'} - All Rights Reserved</p>
          </div>
          <div class="button-group">
            <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
            <button class="close-btn" onclick="window.close()">✖️ Close</button>
          </div>
        </div>
      </body>
      </html>
    `;

    permission.slipGeneratedCount += 1;
    permission.lastSlipGeneratedAt = new Date();
    await permission.save();

    res.send(slipHtml);
  } catch (error) {
    console.error('Error generating permission slip:', error);
    res.status(500).send('<h2>Error generating permission slip</h2>');
  }
});

// ==================== FEES ====================
app.get('/api/accounts/fee-structures', authMiddleware, requireRole('accounts_admin', 'super_admin'), async (req, res) => {
  const feeStructures = await FeeStructure.find().populate('classId', 'grade className').sort({ createdAt: -1 });
  res.json(feeStructures);
});

app.post('/api/accounts/fee-structures', authMiddleware, requireRole('accounts_admin', 'super_admin'), async (req, res) => {
  try {
    const feeStructure = await FeeStructure.create(req.body);
    res.json({ success: true, feeStructure });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/accounts/fee-structures/:id', authMiddleware, requireRole('accounts_admin', 'super_admin'), async (req, res) => {
  await FeeStructure.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

app.get('/api/accounts/payments', authMiddleware, requireRole('accounts_admin', 'super_admin'), async (req, res) => {
  const payments = await FeePayment.find().populate('studentId', 'fullName studentId').sort({ paymentDate: -1 });
  res.json(payments);
});

app.post('/api/accounts/payments', authMiddleware, requireRole('accounts_admin', 'super_admin'), async (req, res) => {
  try {
    const payment = await FeePayment.create({
      ...req.body,
      paymentDate: req.body.paymentDate || new Date(),
      recordedBy: req.userId
    });
    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== SALARIES ====================
app.get('/api/accounts/salaries', authMiddleware, requireRole('accounts_admin', 'super_admin'), async (req, res) => {
  const salaries = await Salary.find().sort({ createdAt: -1 });
  res.json(salaries);
});

app.post('/api/accounts/salaries', authMiddleware, requireRole('accounts_admin', 'super_admin'), async (req, res) => {
  try {
    const salary = await Salary.create(req.body);
    res.json({ success: true, salary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/accounts/salaries/:id/approve', authMiddleware, requireRole('accounts_admin', 'super_admin'), async (req, res) => {
  try {
    const salary = await Salary.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', approvedBy: req.userId, approvedAt: new Date() },
      { new: true }
    );
    res.json({ success: true, salary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== BUDGET / INCOME / EXPENSES ====================
app.get('/api/accounts/budget', authMiddleware, requireRole('accounts_admin', 'super_admin'), async (req, res) => {
  let budget = await Budget.findOne().sort({ updatedAt: -1 });
  if (!budget) budget = { total: 0 };
  res.json(budget);
});

app.put('/api/accounts/budget', authMiddleware, requireRole('accounts_admin', 'super_admin'), async (req, res) => {
  try {
    let budget = await Budget.findOne();
    if (budget) {
      budget.total = req.body.total;
      budget.updatedBy = req.userId;
      budget.updatedAt = new Date();
      await budget.save();
    } else {
      budget = await Budget.create({ total: req.body.total, updatedBy: req.userId });
    }
    res.json({ success: true, budget });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/accounts/income', authMiddleware, requireRole('accounts_admin', 'super_admin'), async (req, res) => {
  const income = await Income.find().sort({ date: -1 });
  res.json(income);
});

app.post('/api/accounts/income', authMiddleware, requireRole('accounts_admin', 'super_admin'), async (req, res) => {
  try {
    const income = await Income.create({
      ...req.body,
      recordedBy: req.userId,
      date: req.body.date || new Date()
    });
    res.json({ success: true, income });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/accounts/expenses', authMiddleware, requireRole('accounts_admin', 'super_admin'), async (req, res) => {
  const expenses = await Expense.find().sort({ date: -1 });
  res.json(expenses);
});

app.post('/api/accounts/expenses', authMiddleware, requireRole('accounts_admin', 'super_admin'), async (req, res) => {
  try {
    const expense = await Expense.create({
      ...req.body,
      recordedBy: req.userId,
      date: req.body.date || new Date()
    });
    res.json({ success: true, expense });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/accounts/financial-summary', authMiddleware, requireRole('accounts_admin', 'super_admin'), async (req, res) => {
  try {
    const [incomeAgg, expenseAgg, pendingSalaries, completedPayments] = await Promise.all([
      Income.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
      Expense.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
      Salary.countDocuments({ status: 'pending' }),
      FeePayment.countDocuments({ status: 'completed' })
    ]);
    const totalIncome = incomeAgg[0]?.total || 0;
    const totalExpenses = expenseAgg[0]?.total || 0;
    res.json({
      success: true,
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      pendingSalaries,
      completedPayments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== MESSAGING ====================
app.get('/api/messages/users', authMiddleware, async (req, res) => {
  try {
    const users = await User.find(
      { _id: { $ne: req.userId }, isActive: true },
      'fullName email role profileImage'
    ).sort('fullName');
    const grouped = {
      super_admin: users.filter(u => u.role === 'super_admin'),
      academic_admin: users.filter(u => u.role === 'academic_admin'),
      discipline_admin: users.filter(u => u.role === 'discipline_admin'),
      accounts_admin: users.filter(u => u.role === 'accounts_admin'),
      secretary_admin: users.filter(u => u.role === 'secretary_admin'),
      teachers: users.filter(u => u.role === 'teacher'),
      students: users.filter(u => u.role === 'student'),
      parents: users.filter(u => u.role === 'parent')
    };
    res.json({ success: true, users: grouped });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/messages/conversations', authMiddleware, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);
    const conversations = await Conversation.aggregate([
      { $match: { 'participants.userId': userId, isActive: true } },
      { $sort: { lastMessageAt: -1 } }
    ]);
    res.json({ success: true, conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/messages/conversation/:userId', authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { senderId: req.userId, recipientId: req.params.userId },
        { senderId: req.params.userId, recipientId: req.userId }
      ],
      isDeleted: false
    }).sort({ createdAt: 1 }).limit(100);

    await Message.updateMany(
      { senderId: req.params.userId, recipientId: req.userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/messages/send', authMiddleware, async (req, res) => {
  try {
    const { recipientId, subject, content } = req.body;
    const [sender, recipient] = await Promise.all([User.findById(req.userId), User.findById(recipientId)]);
    if (!sender || !recipient) return res.status(404).json({ success: false, message: 'User not found' });

    const message = await Message.create({
      senderId: req.userId,
      senderName: sender.fullName,
      senderRole: sender.role,
      recipientId,
      recipientName: recipient.fullName,
      recipientRole: recipient.role,
      subject,
      content
    });

    let conversation = await Conversation.findOne({
      'participants.userId': { $all: [req.userId, recipientId] },
      isActive: true
    });

    if (conversation) {
      conversation.lastMessage = content.substring(0, 100);
      conversation.lastMessageAt = new Date();
      conversation.messageCount += 1;
      await conversation.save();
    } else {
      conversation = await Conversation.create({
        participants: [
          { userId: req.userId, name: sender.fullName, role: sender.role },
          { userId: recipientId, name: recipient.fullName, role: recipient.role }
        ],
        lastMessage: content.substring(0, 100),
        lastMessageAt: new Date(),
        subject,
        messageCount: 1
      });
    }

    io.to(recipientId.toString()).emit('new_message', {
      message: {
        _id: message._id,
        senderName: sender.fullName,
        subject,
        content,
        createdAt: message.createdAt
      },
      conversationId: conversation._id
    });

    res.json({ success: true, message, conversationId: conversation._id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/messages/unread-count', authMiddleware, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      recipientId: req.userId,
      isRead: false,
      isDeleted: false
    });
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/messages/:messageId/read', authMiddleware, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ success: false, message: 'Not found' });
    if (message.recipientId.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    message.isRead = true;
    message.readAt = new Date();
    await message.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/messages/:messageId', authMiddleware, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ success: false, message: 'Not found' });
    if (message.senderId.toString() !== req.userId && message.recipientId.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    message.isDeleted = true;
    await message.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== USER MANAGEMENT (SUPER ADMIN) ====================
app.get('/api/super-admin/users', authMiddleware, requireRole('super_admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/super-admin/users/:id/toggle-active', authMiddleware, requireRole('super_admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, isActive: user.isActive });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== TEACHER DASHBOARD ====================
app.get('/api/teacher/dashboard', authMiddleware, requireRole('teacher'), async (req, res) => {
  try {
    const teacherProfile = await TeacherProfile.findOne({ userId: req.userId });
    const classes = await Class.find({ teacherId: req.userId });
    const classIds = classes.map(c => c._id);
    const [totalStudents, pendingAssignments, recentGrades] = await Promise.all([
      Student.countDocuments({ classId: { $in: classIds } }),
      Assignment.countDocuments({ teacherId: req.userId, dueDate: { $gte: new Date() } }),
      Grade.find({ teacherId: req.userId }).sort({ createdAt: -1 }).limit(5)
    ]);
    res.json({
      success: true,
      teacherProfile,
      classes,
      totalStudents,
      pendingAssignments,
      recentGrades
    });
  } catch (error) {
    res.json({ success: true, teacherProfile: null, classes: [], totalStudents: 0, pendingAssignments: 0 });
  }
});

app.get('/api/teacher/assignments', authMiddleware, requireRole('teacher'), async (req, res) => {
  try {
    const assignments = await Assignment.find({ teacherId: req.userId }).sort({ createdAt: -1 });
    res.json(assignments);
  } catch (error) {
    res.json([]);
  }
});

app.get('/api/teacher/lesson-plans', authMiddleware, requireRole('teacher'), async (req, res) => {
  try {
    const lessonPlans = await LessonPlan.find({ teacherId: req.userId }).sort({ createdAt: -1 });
    res.json(lessonPlans);
  } catch (error) {
    res.json([]);
  }
});

app.get('/api/teacher/attendance', authMiddleware, requireRole('teacher'), async (req, res) => {
  try {
    const attendance = await Attendance.find({ teacherId: req.userId }).sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    res.json([]);
  }
});

// ==================== STUDENT DASHBOARD ====================
app.get('/api/student/dashboard', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.userId }).populate('classId', 'grade className');
    const [assignments, grades, attendance, feeStatus] = await Promise.all([
      Assignment.find({ classId: student?.classId?._id }).sort({ dueDate: 1 }),
      Grade.find({ studentId: student?._id }).sort({ createdAt: -1 }),
      Attendance.find({ studentId: student?._id }).sort({ date: -1 }),
      FeePayment.find({ studentId: student?._id }).sort({ paymentDate: -1 })
    ]);
    res.json({
      success: true,
      student,
      assignments,
      grades,
      attendance,
      feeStatus,
      className: student?.classId ? `${student.classId.grade} ${student.classId.className}` : 'Not Assigned',
      studentId: student?.studentId || 'N/A'
    });
  } catch (error) {
    res.json({ success: true, student: null, assignments: [], grades: [], attendance: [], feeStatus: [] });
  }
});

app.get('/api/student/assignments', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.userId });
    const assignments = await Assignment.find({ classId: student?.classId }).sort({ dueDate: 1 });
    res.json(assignments);
  } catch (error) {
    res.json([]);
  }
});

app.get('/api/student/grades', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.userId });
    const grades = await Grade.find({ studentId: student?._id }).sort({ createdAt: -1 });
    res.json(grades);
  } catch (error) {
    res.json([]);
  }
});

app.get('/api/student/attendance', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.userId });
    const attendance = await Attendance.find({ studentId: student?._id }).sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    res.json([]);
  }
});

app.get('/api/student/fees', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.userId });
    const payments = await FeePayment.find({ studentId: student?._id }).sort({ paymentDate: -1 });
    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    res.json({ success: true, payments, total, paid: total });
  } catch (error) {
    res.json({ success: true, payments: [], total: 0, paid: 0 });
  }
});

app.get('/api/student/announcements', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const announcements = await Announcement.find({
      isActive: true,
      $or: [{ audience: 'all' }, { audience: 'students' }]
    }).sort({ createdAt: -1 }).limit(10);
    res.json(announcements);
  } catch (error) {
    res.json([]);
  }
});

app.post('/api/student/assignments/:id/submit', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    const student = await Student.findOne({ userId: req.userId });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const existingSubmission = assignment.submissions.find(
      s => s.studentId.toString() === student._id.toString()
    );
    if (existingSubmission) {
      return res.status(400).json({ message: 'Assignment already submitted' });
    }

    assignment.submissions.push({
      studentId: student._id,
      submittedAt: new Date(),
      content: req.body.content,
      status: 'submitted'
    });
    await assignment.save();

    res.json({ success: true, message: 'Assignment submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== PARENT DASHBOARD ====================
app.get('/api/parent/children', authMiddleware, requireRole('parent'), async (req, res) => {
  try {
    const students = await Student.find({ parentPhone: req.userPhone }).populate('classId', 'grade className');
    if (students.length === 0) {
      const user = await User.findById(req.userId);
      const studentsByEmail = await Student.find({ parentEmail: user?.email }).populate('classId', 'grade className');
      res.json(studentsByEmail);
    } else {
      res.json(students);
    }
  } catch (error) {
    res.json([]);
  }
});

app.get('/api/parent/children/:childId/dashboard', authMiddleware, requireRole('parent'), async (req, res) => {
  try {
    const child = await Student.findById(req.params.childId).populate('classId', 'grade className');
    if (!child) return res.status(404).json({ message: 'Child not found' });

    const [grades, attendance, fees] = await Promise.all([
      Grade.find({ studentId: child._id }).sort({ createdAt: -1 }),
      Attendance.find({ studentId: child._id }).sort({ date: -1 }),
      FeePayment.find({ studentId: child._id }).sort({ paymentDate: -1 })
    ]);

    res.json({
      success: true,
      child,
      grades,
      attendance,
      fees,
      className: child.classId ? `${child.classId.grade} ${child.classId.className}` : 'Not Assigned'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// ==================== SECRETARY ADMIN ROUTES ====================

// ==================== VISITOR MANAGEMENT ====================
app.get('/api/secretary/visitors', authMiddleware, requireRole('secretary_admin', 'super_admin'), async (req, res) => {
  try {
    const visitors = await Visitor.find().sort({ arrivalTime: -1 });
    res.json(visitors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/secretary/visitors', authMiddleware, requireRole('secretary_admin', 'super_admin'), async (req, res) => {
  try {
    const visitor = await Visitor.create({
      ...req.body,
      arrivalTime: req.body.arrivalTime || new Date()
    });
    res.json({ success: true, visitor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/secretary/visitors/:id/checkout', authMiddleware, requireRole('secretary_admin', 'super_admin'), async (req, res) => {
  try {
    const visitor = await Visitor.findByIdAndUpdate(
      req.params.id,
      { departureTime: new Date() },
      { new: true }
    );
    if (!visitor) return res.status(404).json({ message: 'Visitor not found' });
    res.json({ success: true, visitor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== EVENT MANAGEMENT ====================
app.get('/api/secretary/events', authMiddleware, requireRole('secretary_admin', 'super_admin'), async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/secretary/events', authMiddleware, requireRole('secretary_admin', 'super_admin'), async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.json({ success: true, event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/secretary/events/:id', authMiddleware, requireRole('secretary_admin', 'super_admin'), async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/secretary/events/:id', authMiddleware, requireRole('secretary_admin', 'super_admin'), async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== NEWS MANAGEMENT (SECRETARY) ====================
app.get('/api/secretary/news', authMiddleware, requireRole('secretary_admin', 'super_admin'), async (req, res) => {
  try {
    const news = await News.find().sort({ date: -1 });
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/secretary/news', authMiddleware, requireRole('secretary_admin', 'super_admin'), uploadNews.single('image'), async (req, res) => {
  try {
    const { title, summary, content, category, tags } = req.body;
    const currentUser = await User.findById(req.userId);
    const imageUrl = req.file ? `${req.protocol}://${req.get('host')}/uploads/news/${req.file.filename}` : null;
    
    const news = await News.create({
      title,
      summary,
      content: content || summary,
      image: imageUrl,
      category: category || 'news',
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      author: currentUser?.fullName || 'Secretary',
      date: new Date(),
      isPublished: true
    });
    res.json({ success: true, news, imageUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/secretary/news/:id', authMiddleware, requireRole('secretary_admin', 'super_admin'), async (req, res) => {
  try {
    await News.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== GALLERY MANAGEMENT (SECRETARY) ====================
app.get('/api/secretary/gallery', authMiddleware, requireRole('secretary_admin', 'super_admin'), async (req, res) => {
  try {
    const gallery = await Gallery.find().sort({ date: -1 });
    res.json(gallery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/secretary/gallery', authMiddleware, requireRole('secretary_admin', 'super_admin'), uploadGallery.single('image'), async (req, res) => {
  try {
    const { title, category, description } = req.body;
    const imageUrl = req.file ? `${req.protocol}://${req.get('host')}/uploads/gallery/${req.file.filename}` : null;
    
    if (!imageUrl) return res.status(400).json({ message: 'Image is required' });
    
    const galleryItem = await Gallery.create({
      title,
      image: imageUrl,
      category: category || 'events',
      description: description || '',
      isPublished: true
    });
    res.json({ success: true, gallery: galleryItem, imageUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/secretary/gallery/:id', authMiddleware, requireRole('secretary_admin', 'super_admin'), async (req, res) => {
  try {
    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== ADMISSION APPLICATIONS (SECRETARY VIEW) ====================
app.get('/api/secretary/applications', authMiddleware, requireRole('secretary_admin', 'super_admin'), async (req, res) => {
  try {
    const applications = await AdmissionApplication.find().sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== FEE PAYMENTS (SECRETARY VIEW) ====================
app.get('/api/secretary/payments', authMiddleware, requireRole('secretary_admin', 'super_admin'), async (req, res) => {
  try {
    const payments = await FeePayment.find().populate('studentId', 'fullName studentId').sort({ paymentDate: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== ERROR HANDLER ====================
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  if (err.name === 'MulterError') return res.status(400).json({ message: err.message });
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

// ==================== DATABASE CONNECTION & START ====================
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/essa_school';
const PORT = process.env.PORT || 5000;

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 10000
})
  .then(async () => {
    console.log('✅ MongoDB Connected');
    const userCount = await User.countDocuments();
    if (process.argv.includes('--seed') || process.env.SEED_DB === 'true' || userCount === 0) {
      await seedDatabase();
    }
    server.listen(PORT, () => {
      console.log(`\n🚀 Server running on http://localhost:${PORT}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    });
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });