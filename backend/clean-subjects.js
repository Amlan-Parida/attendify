const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Attendance = require('./models/Attendance');

const MONGO_URI = 'mongodb+srv://Attendify-Amlan:gvkuCuuwybWonA5u@cluster0.p0abfnr.mongodb.net/attendify?appName=Cluster0';

async function cleanSubjects() {
  try {
    await mongoose.connect(MONGO_URI);
    
    // Delete all attendances
    const attResult = await Attendance.deleteMany({});
    console.log(`Deleted ${attResult.deletedCount} attendance records.`);

    // Delete all subjects
    const subResult = await Subject.deleteMany({});
    console.log(`Deleted ${subResult.deletedCount} subjects.`);

    console.log('Subjects wiped.');
    process.exit(0);
  } catch (error) {
    console.error('Error cleaning DB:', error);
    process.exit(1);
  }
}

cleanSubjects();
