const express = require('express');
const app = express();

try {
  const cors = require('cors');
  const path = require('path');
  const dotenv = require('dotenv');
  const connectDB = require('./config/db');
  const startCronJobs = require('./utils/cron');

  dotenv.config({ path: path.resolve(__dirname, '.env') });
  connectDB();
  startCronJobs();

  app.use(
    cors({
      origin: process.env.CLIENT_URL || true,
      credentials: true,
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/subjects', require('./routes/subjects'));
  app.use('/api/attendance', require('./routes/attendance'));
  app.use('/api/analytics', require('./routes/analytics'));
  app.use('/api/templates', require('./routes/templates'));
  app.use('/api/ai', require('./routes/ai'));

  app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.originalUrl} not found` });
  });

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
      message: err.message || 'Internal Server Error',
    });
  });

  const PORT = process.env.PORT || 5000;
  if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
      console.log(`🚀 Attendify server running on port ${PORT}`);
    });
  }
} catch (error) {
  console.error("CRITICAL BOOT ERROR:", error);
  app.use((req, res) => {
    res.status(500).json({ error: "Server Boot Crash", message: error.message, stack: error.stack });
  });
}

module.exports = app;
