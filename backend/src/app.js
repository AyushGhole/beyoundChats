// src/app.js
const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const articleRoutes = require("./routes/article.routes");
const cors = require("cors");

require("dotenv").config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use("/api/", articleRoutes);

app.get("/", (req, res) => {
  res.send("BeyondChats API Running");
});

connectDB();

app.listen(5000, () => {
  console.log("Server running on port 5000");
});

module.exports = app;
