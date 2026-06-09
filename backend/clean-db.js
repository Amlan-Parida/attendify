require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const cleanDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://Attendify-Amlan:gvkuCuuwybWonA5u@cluster0.p0abfnr.mongodb.net/attendify?retryWrites=true&w=majority');
    console.log('Connected.');
    
    console.log('Deleting all users...');
    const result = await User.deleteMany({});
    console.log(`Successfully deleted ${result.deletedCount} users.`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error cleaning DB:', error);
    process.exit(1);
  }
};

cleanDB();
