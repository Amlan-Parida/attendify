const mongoose = require('mongoose');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const app = require('./server'); // Wait, is server.js exporting app?
// Let's just create a mock request.
const { createSubject } = require('./controllers/subjectController');

const MONGO_URI = 'mongodb+srv://Attendify-Amlan:gvkuCuuwybWonA5u@cluster0.p0abfnr.mongodb.net/attendify?appName=Cluster0';

async function test() {
  await mongoose.connect(MONGO_URI);
  const user = await User.findOne();

  const req = {
    user: { _id: user._id },
    body: {
      name: 'Mathematics',
      slots: [ { day: 1, startTime: '09:00', endTime: '10:00', type: 'Theory', weight: 1 } ],
      daysOfWeek: [ 1 ],
      classesPerWeek: 1,
      defaultWeight: 1,
      minAttendance: 75,
      color: '#6366f1'
    }
  };

  const res = {
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      console.log('Status:', this.statusCode);
      console.log('Response:', JSON.stringify(data, null, 2));
    }
  };

  await createSubject(req, res);
  process.exit(0);
}

test();
