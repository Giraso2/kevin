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

// MongoDB Atlas Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:admin123@cluster.mongodb.net/essa_school?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas!'))
  .catch(err => console.error('MongoDB Connection Error:', err.message));

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

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  audience: { type: [String], default: ['all'] },
  priority: { type: String, enum: ['normal', 'high', 'urgent'], default: 'normal' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Announcement = mongoose.model('Announcement', announcementSchema);

// Socket.IO
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  socket.on('join', (userId) => socket.join(userId));
  socket.on('disconnect', () => console.log('🔌 Client disconnected:', socket.id));
});

// Auth middleware
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    req.userId = decoded.id;
    req.userRole = decoded.role;
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

app.post('/api/super-admin/create-admin', authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    if (!currentUser || currentUser.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied. Super admin only.' });
    }
    
    const { fullName, email, password, phone, role } = req.body;
    const allowedRoles = ['academic_admin', 'discipline_admin', 'accounts_admin'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });
    
    const hashedPassword = await bcrypt.hash(password || 'admin123', 10);
    const newAdmin = new User({ fullName, email, password: hashedPassword, role, phone: phone || '', createdBy: req.userId, isActive: true });
    await newAdmin.save();
    
    res.json({ success: true, message: `${role} created successfully`, user: { _id: newAdmin._id, fullName, email, role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/super-admin/admins', authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    if (!currentUser || currentUser.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const admins = await User.find({ role: { $in: ['academic_admin', 'discipline_admin', 'accounts_admin'] } }).select('-password');
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/super-admin/admins/:id', authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    if (!currentUser || currentUser.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/super-admin/announcements', authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    if (!currentUser || currentUser.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const { title, content, audience, priority } = req.body;
    if (!title || !content) return res.status(400).json({ message: 'Title and content required' });
    
    const announcement = new Announcement({ title, content, audience: audience || ['all'], priority: priority || 'normal', createdBy: req.userId });
    await announcement.save();
    res.json({ success: true, announcement });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/super-admin/announcements', authMiddleware, async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 }).limit(50);
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/super-admin/announcements/:id', authMiddleware, async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Create default super admin
const createDefaultSuperAdmin = async () => {
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
};

const PORT = process.env.PORT || 5000;
createDefaultSuperAdmin().then(() => {
  server.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📍 Health: http://localhost:${PORT}/api/health`);
    console.log(`\n📋 Login Credentials:`);
    console.log(`Super Admin: admin@essa.rw / admin123\n`);
  });
});