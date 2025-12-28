//src/routes/article.route.js
const express = require("express");
const router = express.Router();
const { scrapeAndStoreArticles } = require("../controllers/article.controller");

router.post("/scrape", scrapeAndStoreArticles);

module.exports = router;
