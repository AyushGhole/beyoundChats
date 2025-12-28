//src/routes/article.route.js
const express = require("express");
const router = express.Router();
const {
  scrapeAndStoreArticles,
  getArticles,
  deleteAllArticles,
} = require("../controllers/article.controller");

router.post("/scrape", scrapeAndStoreArticles);
router.get("/fetch/articles", getArticles);
router.delete("/delete/articles", deleteAllArticles);

module.exports = router;
