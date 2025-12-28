// src/config/db.js

const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  await mongoose.connect(process.env.ATLAS_URL).then(() => {
    console.log("Mongo readyState:", mongoose.connection.readyState);
    console.log("MongoDB Connected");
  });
};

module.exports = connectDB;
