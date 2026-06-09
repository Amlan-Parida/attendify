const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const BACKUP_PATH = path.join(__dirname, '..', 'db-backup.json');

// Retrieve model definitions dynamically to avoid circular dependencies during initialization
const getModels = () => {
  return {
    User: require('../models/User'),
    Subject: require('../models/Subject'),
    Attendance: require('../models/Attendance'),
    AcademicTemplate: require('../models/AcademicTemplate'),
    AcademicDocument: require('../models/AcademicDocument')
  };
};

const saveBackup = async () => {
  try {
    const backupData = {};
    const models = getModels();
    for (const [name, model] of Object.entries(models)) {
      if (name === 'User') {
        backupData[name] = await model.find({}).select('+password').lean();
      } else {
        backupData[name] = await model.find({}).lean();
      }
    }
    fs.writeFileSync(BACKUP_PATH, JSON.stringify(backupData, null, 2));
    console.log('💾 Local database backup saved.');
  } catch (err) {
    console.error('⚠️ Failed to save database backup:', err.message);
  }
};

const restoreBackup = async () => {
  try {
    if (!fs.existsSync(BACKUP_PATH)) {
      console.log('ℹ️ No local backup file found to restore.');
      return;
    }
    const raw = fs.readFileSync(BACKUP_PATH, 'utf8');
    const backupData = JSON.parse(raw);
    const models = getModels();
    for (const [name, model] of Object.entries(models)) {
      if (backupData[name] && backupData[name].length > 0) {
        await model.deleteMany({});
        await model.insertMany(backupData[name]);
        console.log(`✨ Restored ${backupData[name].length} documents for ${name}`);
      }
    }
    console.log('✅ Local database backup successfully restored.');
  } catch (err) {
    console.error('⚠️ Failed to restore database backup:', err.message);
  }
};

// Set up automatic triggers on any database write
const setupBackupPlugin = () => {
  let timer = null;
  const triggerBackup = () => {
    // Debounce saves to disk to prevent performance bottlenecks on rapid writes
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      saveBackup();
    }, 1000);
  };

  mongoose.plugin((schema) => {
    schema.post('save', triggerBackup);
    schema.post('insertMany', triggerBackup);
    schema.post('updateOne', triggerBackup);
    schema.post('updateMany', triggerBackup);
    schema.post('deleteOne', triggerBackup);
    schema.post('deleteMany', triggerBackup);
    schema.post('findOneAndUpdate', triggerBackup);
    schema.post('findOneAndDelete', triggerBackup);
  });
};

module.exports = {
  saveBackup,
  restoreBackup,
  setupBackupPlugin
};
