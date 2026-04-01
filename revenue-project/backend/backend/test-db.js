const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URL = process.env.MONGO_URL;
console.log('Connecting to:', MONGO_URL.replace(/\/\/([^:]+):([^@]+)@/, '//****:****@'));

mongoose.connect(MONGO_URL)
  .then(() => {
    console.log('✅ MongoDB connected successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });