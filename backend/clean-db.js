const mongoose = require('mongoose');
const Attendance = require('./models/Attendance');
const Subject = require('./models/Subject');
const User = require('./models/User');

const MONGO_URI = 'mongodb+srv://Attendify-Amlan:gvkuCuuwybWonA5u@cluster0.p0abfnr.mongodb.net/attendify?appName=Cluster0';

async function clean() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB for cleanup');

    // Delete all attendances
    const attResult = await Attendance.deleteMany({});
    console.log(`Deleted ${attResult.deletedCount} attendance records.`);

    // Delete all subjects
    const subResult = await Subject.deleteMany({});
    console.log(`Deleted ${subResult.deletedCount} subjects.`);

    // Delete all users
    const userResult = await User.deleteMany({});
    console.log(`Deleted ${userResult.deletedCount} users.`);

    console.log('Database wiped completely clean.');
    process.exit(0);
  } catch (error) {
    console.error('Error cleaning DB:', error);
    process.exit(1);
  }
}

clean();
