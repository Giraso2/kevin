const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const resetDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/essa_school');
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Drop all collections
    const collections = await db.listCollections().toArray();
    for (const collection of collections) {
      await db.collection(collection.name).drop();
      console.log(`Dropped: ${collection.name}`);
    }
    
    // Create Super Admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.collection('users').insertOne({
      fullName: 'Super Administrator',
      email: 'admin@essa.rw',
      password: hashedPassword,
      role: 'super_admin',
      phone: '+250788123456',
      isActive: true,
      createdAt: new Date()
    });
    
    console.log('\n✅ Super Admin Created!');
    console.log('Email: admin@essa.rw');
    console.log('Password: admin123\n');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

resetDatabase();