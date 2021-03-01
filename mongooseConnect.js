const mongoose = require('mongoose');

const connectToDatabase = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to database');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectToDatabase;
