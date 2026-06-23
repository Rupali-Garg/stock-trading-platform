require('dotenv').config();

const app            = require('./app');
const connectDB      = require('./config/db');
const runOptimizations = require('./config/dbOptimization');

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();

    // Run optimizations after DB connects
    await runOptimizations();

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (err) {
    console.error('❌ Server failed to start:', err.message);
    process.exit(1);
  }
};

start();

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  process.exit(1);
});