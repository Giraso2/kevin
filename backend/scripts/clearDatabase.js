const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const clearDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/essa_school');
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    
    // Drop each collection
    for (const collection of collections) {
      await db.collection(collection.name).drop();
      console.log(`Dropped collection: ${collection.name}`);
    }
    
    console.log('\n✅ All collections cleared successfully!');
    console.log('Database is now empty. Only super admin will be created on server restart.\n');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
};

clearDatabase();