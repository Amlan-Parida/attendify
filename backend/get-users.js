const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const User = require('./models/User');

const MONGO_URI = 'mongodb+srv://Attendify-Amlan:gvkuCuuwybWonA5u@cluster0.p0abfnr.mongodb.net/attendify?appName=Cluster0';

async function check() {
  await mongoose.connect(MONGO_URI);
  const users = await User.find({}).lean();
  console.log('Users:', users.length);
  const subjects = await Subject.find({}).lean();
  console.log('Subjects:', subjects.length);
  if (subjects.length > 0) {
    console.log('First subject:', subjects[0]);
  }
  process.exit(0);
}

check();
