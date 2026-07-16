const mongoose = require("mongoose");

// keeping this separate so server.js doesn't get cluttered
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err.message);
    // no point running the server without a DB, so just exit
    process.exit(1);
  }
};

module.exports = connectDB;
