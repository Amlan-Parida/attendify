const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const User = require('./models/User');

const MONGO_URI = 'mongodb+srv://Attendify-Amlan:gvkuCuuwybWonA5u@cluster0.p0abfnr.mongodb.net/attendify?appName=Cluster0';

async function test() {
  try {
    await mongoose.connect(MONGO_URI);
    
    // get any user
    const user = await User.findOne();
    
    const payload = {
      name: 'Mathematics',
      slots: [ { day: 1, startTime: '09:00', endTime: '10:00', type: 'Theory', weight: 1 } ],
      daysOfWeek: [ 1 ],
      classesPerWeek: 1,
      defaultWeight: 1,
      minAttendance: 75,
      color: '#6366f1'
    };

    const subject = new Subject({
      user: user ? user._id : new mongoose.Types.ObjectId(),
      name: payload.name,
      classesPerWeek: payload.classesPerWeek || 3,
      daysOfWeek: payload.daysOfWeek || [],
      slots: payload.slots || [],
      defaultWeight: payload.defaultWeight || 1,
      minAttendance: payload.minAttendance ?? 75,
      color: payload.color || '#6366f1',
      autoMarkPresent: !!payload.autoMarkPresent,
    });
    
    await subject.save();
    console.log('Saved successfully');
    await Subject.deleteOne({ _id: subject._id });
    
  } catch (err) {
    console.error('Validation error:', JSON.stringify(err.errors, null, 2) || err.message);
  }
  process.exit(0);
}

test();
