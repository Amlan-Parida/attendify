const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const User = require('./models/User');

const MONGO_URI = 'mongodb+srv://Attendify-Amlan:gvkuCuuwybWonA5u@cluster0.p0abfnr.mongodb.net/attendify?appName=Cluster0';

async function test() {
  try {
    await mongoose.connect(MONGO_URI);
    
    // get any user
    const user = await User.findOne();
    if (!user) {
      console.log('No user found');
      process.exit(0);
    }
    
    const subject = new Subject({
      user: user._id,
      name: 'Test',
      classesPerWeek: 1,
      daysOfWeek: [1],
      slots: [{ day: 1, startTime: '09:00', endTime: '10:00', type: 'Theory', weight: 1 }],
      defaultWeight: 1,
      minAttendance: 75,
      color: '#6366f1'
    });
    
    await subject.save();
    console.log('Successfully saved subject');
    
    await Subject.deleteOne({ _id: subject._id });
    
  } catch (err) {
    console.error('Validation error:', err.message);
  }
  process.exit(0);
}

test();
