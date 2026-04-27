const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Parent = require('../models/Parent');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing data
    await User.deleteMany({});
    await Student.deleteMany({});
    await Teacher.deleteMany({});
    await Parent.deleteMany({});
    
    // Create Admin
    const admin = await User.create({
      fullName: 'Dr. Uwimana Jean Paul',
      email: 'admin@essa.rw',
      password: 'admin123',
      role: 'admin',
      phone: '+250788123456'
    });
    
    // Create Student
    const studentUser = await User.create({
      fullName: 'Jean Paul Ndayisaba',
      email: 'student@essa.rw',
      password: 'student123',
      role: 'student',
      phone: '+250788123457'
    });
    
    const student = await Student.create({
      user: studentUser._id,
      studentId: 'STU2024001',
      grade: 'S6',
      class: 'Software Development',
      combination: 'Software Development'
    });
    
    // Create Teacher
    const teacherUser = await User.create({
      fullName: 'Mukansanga Marie',
      email: 'teacher@essa.rw',
      password: 'teacher123',
      role: 'teacher',
      phone: '+250788123458'
    });
    
    await Teacher.create({
      user: teacherUser._id,
      teacherId: 'TCH2024001',
      subject: 'Mathematics',
      department: 'Science',
      qualification: 'Master\'s in Mathematics',
      experience: 8,
      classes: ['S4', 'S5', 'S6']
    });
    
    // Create Parent
    const parentUser = await User.create({
      fullName: 'Habimana Jean',
      email: 'parent@essa.rw',
      password: 'parent123',
      role: 'parent',
      phone: '+250788123459'
    });
    
    await Parent.create({
      user: parentUser._id,
      parentId: 'PRN2024001',
      children: [student._id],
      occupation: 'Business Owner',
      relationship: 'Father'
    });
    
    console.log('Seed data created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();