require('dotenv').config();

const connectDB = require('../src/config/database');
const app = require('../src/app');

module.exports = async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error('Vercel API bootstrap error:', error);
    return res.status(500).json({
      message: 'Backend initialization failed.',
    });
  }
};
