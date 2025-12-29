//src/routes/article.route.js
const express = require("express");
const router = express.Router();
const {
  scrapeAndStoreArticles,
  getArticles,
  deleteAllArticles,
  deleteArticle,
  updateArticle,
  getArticleById,
  createArticle,
} = require("../controllers/article.controller");

router.post("/scrape", scrapeAndStoreArticles);
router.get("/fetch/articles", getArticles);
router.delete("/delete/:id", deleteArticle);
router.get("/fetch/:id", getArticleById);
router.put("/update/:id", updateArticle);
router.post("/create", createArticle);

module.exports = router;
