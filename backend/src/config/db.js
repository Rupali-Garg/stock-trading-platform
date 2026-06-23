const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // mongoose.connect returns a promise
    const connection = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${connection.connection.host}`);

  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Exit the process — don't run the server without a database
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB Disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB Error:', err);
});

module.exports = connectDB;