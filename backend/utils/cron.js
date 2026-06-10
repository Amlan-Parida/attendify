const cron = require('node-cron');
const Subject = require('../models/Subject');
const Attendance = require('../models/Attendance');
const User = require('../models/User');

const startCronJobs = () => {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      
      // Get current day of week (0=Sun, 1=Mon, ..., 6=Sat)
      const currentDay = now.getDay();
      
      // Format current time as HH:mm to match timetable slots
      // Ensure we use the exact minute for precision
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      
      // Find users with globalAutoMark enabled
      const usersWithGlobalAutoMark = await User.find({ globalAutoMark: true });
      const globalAutoMarkUserIds = usersWithGlobalAutoMark.map((u) => u._id);

      // We only care about subjects that have autoMarkPresent enabled 
      // OR whose owner has globalAutoMark enabled
      const subjectsToAutoMark = await Subject.find({ 
        $or: [
          { autoMarkPresent: true },
          { user: { $in: globalAutoMarkUserIds } }
        ]
      });
      
      for (const subject of subjectsToAutoMark) {
        // Find any slots for THIS subject that end EXACTLY at this minute today
        const matchingSlots = subject.slots.filter(
          (slot) => slot.day === currentDay && slot.endTime === currentTimeStr
        );
        
        for (const slot of matchingSlots) {
          // The class just ended! We need to mark them Present.
          // We use normalized UTC date for the attendance record to match normal marking behavior
          const normalizedDate = new Date();
          normalizedDate.setUTCHours(0, 0, 0, 0);

          // Use findOneAndUpdate with upsert
          // This ensures that if the user ALREADY manually marked themselves "Absent" or "Holiday"
          // during the class, we DO NOT override it! It only inserts if no record exists.
          await Attendance.findOneAndUpdate(
            { 
              user: subject.user, 
              subject: subject._id, 
              date: normalizedDate
            },
            {
              $setOnInsert: {
                user: subject.user,
                subject: subject._id,
                date: normalizedDate,
                startTime: slot.startTime,
                status: 'Present',
                weight: slot.weight || (slot.type === 'Theory' ? 2 : 1),
                note: 'Auto-marked by system'
              }
            },
            { upsert: true, new: true, runValidators: true }
          );
          
          console.log(`[Auto-Present] Marked present for user ${subject.user} in subject ${subject.name} at ${currentTimeStr}`);
        }
      }
    } catch (error) {
      console.error('[Auto-Present] Cron Job Error:', error);
    }
  });
};

module.exports = startCronJobs;
