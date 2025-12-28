// src/controllers/article.controller.js
const Article = require("../models/Article");
const {
  getLastPageUrl,
  getArticleLinks,
  scrapeArticle,
} = require("../services/scraper.service");

exports.scrapeAndStoreArticles = async (req, res) => {
  try {
    const lastPageUrl = await getLastPageUrl();
    const links = await getArticleLinks(lastPageUrl);

    const savedArticles = [];

    for (const link of links) {
      const exists = await Article.findOne({ url: link });
      if (exists) continue;

      const articleData = await scrapeArticle(link);
      const article = await Article.create(articleData);
      savedArticles.push(article);
    }

    res.json({
      message: "Articles scraped and stored successfully",
      count: savedArticles.length,
      articles: savedArticles,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
