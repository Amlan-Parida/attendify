async function testLive() {
  try {
    const jwt = require('jsonwebtoken');
    const mongoose = require('mongoose');
    const User = require('./models/User');
    
    await mongoose.connect('mongodb+srv://Attendify-Amlan:gvkuCuuwybWonA5u@cluster0.p0abfnr.mongodb.net/attendify?appName=Cluster0');
    let user = await User.findOne();
    if (!user) {
       console.log('No user to piggyback on');
       process.exit(1);
    }
    
    const token = jwt.sign({ id: user._id }, 'dev_jwt_secret_12345', { expiresIn: '30d' });
    
    const payload = {
      name: 'Mathematics ' + Date.now(),
      slots: [ { day: 1, startTime: '09:00', endTime: '10:00', type: 'Theory', weight: 1 } ],
      daysOfWeek: [ 1 ],
      classesPerWeek: 1,
      defaultWeight: 1,
      minAttendance: 75,
      color: '#6366f1'
    };

    const subRes = await fetch('https://attendify-gamma-ashy.vercel.app/api/subjects', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    
    const data = await subRes.text();
    console.log('Live Server Status:', subRes.status);
    console.log('Live Server Response:', data);

  } catch (err) {
    console.error('Error:', err);
  }
  process.exit(0);
}

testLive();
