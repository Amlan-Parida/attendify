const mongoose = require('mongoose');
const Attendance = require('./models/Attendance');
const Subject = require('./models/Subject');
const User = require('./models/User');

const MONGO_URI = 'mongodb+srv://Attendify-Amlan:gvkuCuuwybWonA5u@cluster0.p0abfnr.mongodb.net/attendify?appName=Cluster0';

async function check() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB');

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const records = await Attendance.find({ date: today }).populate('subject', 'name').lean();
  console.log('Records for today:', JSON.stringify(records, null, 2));

  process.exit(0);
}

check().catch(console.error);
