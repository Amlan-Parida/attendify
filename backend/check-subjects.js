const mongoose = require('mongoose');
const Subject = require('./models/Subject');

const MONGO_URI = 'mongodb+srv://Attendify-Amlan:gvkuCuuwybWonA5u@cluster0.p0abfnr.mongodb.net/attendify?appName=Cluster0';

async function check() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB');

  const subjects = await Subject.find({}).lean();
  console.log('Subjects:', JSON.stringify(subjects, null, 2));

  process.exit(0);
}

check().catch(console.error);
