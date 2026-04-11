const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Initial DB Connection Error: ${error.message}. Falling back to Memory Server...`);
    try {
      process.env.MONGOMS_DOWNLOAD_DIR = './.mongodb-binaries';
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`Fallback Memory MongoDB Connected: ${conn.connection.host}`);
    } catch (memError) {
      console.error(`Memory DB Error: ${memError.message}`);
      // Do not exit if we can help it, but here it's fatal
      process.exit(1);
    }
  }
};

module.exports = connectDB;
