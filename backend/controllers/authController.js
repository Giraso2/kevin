const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Parent = require('../models/Parent');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { fullName, email, password, role, phone, address } = req.body;
    
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create user
    const user = await User.create({
      fullName,
      email,
      password,
      role,
      phone,
      address
    });
    
    // Create role-specific profile
    if (role === 'student') {
      const studentId = `STU${Date.now()}`;
      await Student.create({
        user: user._id,
        studentId,
        grade: 'S1',
        class: 'General'
      });
    } else if (role === 'teacher') {
      const teacherId = `TCH${Date.now()}`;
      await Teacher.create({
        user: user._id,
        teacherId,
        subject: 'General',
        department: 'General'
      });
    } else if (role === 'parent') {
      const parentId = `PRN${Date.now()}`;
      await Parent.create({
        user: user._id,
        parentId
      });
    }
    
    const token = generateToken(user._id);
    
    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Check role
    if (user.role !== role) {
      return res.status(401).json({ message: 'Invalid role selected' });
    }
    
    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Update last login
    user.lastLogin = Date.now();
    await user.save();
    
    // Get role-specific data
    let roleData = null;
    if (role === 'student') {
      roleData = await Student.findOne({ user: user._id }).populate('parent');
    } else if (role === 'teacher') {
      roleData = await Teacher.findOne({ user: user._id });
    } else if (role === 'parent') {
      roleData = await Parent.findOne({ user: user._id }).populate('children');
    }
    
    const token = generateToken(user._id);
    
    res.json({
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
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    let roleData = null;
    
    if (user.role === 'student') {
      roleData = await Student.findOne({ user: user._id });
    } else if (user.role === 'teacher') {
      roleData = await Teacher.findOne({ user: user._id });
    } else if (user.role === 'parent') {
      roleData = await Parent.findOne({ user: user._id });
    }
    
    res.json({ user, roleData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getMe, changePassword };