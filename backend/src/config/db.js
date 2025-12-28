// src/config/db.js
const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(process.env.ATLAS_URL);
  console.log("MongoDB Connected");
};

module.exports = connectDB;
