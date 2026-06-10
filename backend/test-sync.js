const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '.env') });
const User = require('./models/User');
const Subject = require('./models/Subject');
const Attendance = require('./models/Attendance');

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('DB Connected');
  const user = await User.findOne({});
  if (!user) return console.log('No user found');
  console.log('Testing with user:', user.email);

  try {
    const subjects = await Subject.find({ user: user._id });
    console.log(`Found ${subjects.length} subjects.`);
    const attendance = await Attendance.find({ user: user._id });
    console.log(`Found ${attendance.length} attendance records.`);
  } catch (err) {
    console.error('Error fetching:', err);
  }
  process.exit(0);
}
test();
