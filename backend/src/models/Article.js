// src/models/Article.js
const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
    },
    content: {
      type: String,
    },
    url: {
      type: String,
      unique: true,
    },
    type: {
      type: String,
      enum: ["original", "updated"],
      default: "original",
    },
    originalArticleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
      default: null,
    },
    references: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("beyondArticle", articleSchema);
