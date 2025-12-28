// src/controllers/article.controller.js
const beyondArticle = require("../models/Article");
const axios = require("axios");
const {
  getLastPageUrl,
  getArticleLinksFromPage,
  scrapeArticle,
} = require("../services/scraper.service");
const cheerio = require("cheerio");

const BASE_URL = "https://beyondchats.com";

async function getAllBlogPages() {
  const { data } = await axios.get(`${BASE_URL}/blogs/`);
  const $ = cheerio.load(data);

  const pages = [];

  $("a.page-numbers").each((_, el) => {
    const href = $(el).attr("href");
    if (href && href.includes("/blogs/page/")) {
      pages.push(href);
    }
  });

  if (pages.length === 0) {
    throw new Error("No pagination pages found");
  }

  return [...new Set(pages)]; // remove duplicates
}

// Fetch and save the data in the database
exports.scrapeAndStoreArticles = async (req, res) => {
  try {
    const pages = await getAllBlogPages();
    pages.reverse(); // oldest first

    let savedCount = 0;
    const savedArticles = [];

    console.log("📄 Total pagination pages found:", pages.length);

    for (const pageUrl of pages) {
      if (savedCount >= 5) break;

      console.log("➡️ Visiting page:", pageUrl);

      // 1️⃣ Fetch pagination page
      const { data } = await axios.get(pageUrl);

      // 2️⃣ Extract ARTICLE links
      const articleLinks = getArticleLinksFromPage(data);
      console.log("🔗 Found article links:", articleLinks.length);

      for (const articleUrl of articleLinks) {
        if (savedCount >= 5) break;

        console.log("📝 Processing article:", articleUrl);

        const exists = await beyondArticle.findOne({ url: articleUrl });
        if (exists) {
          console.log("⏭️ Already exists, skipping");
          continue;
        }

        try {
          // 3️⃣ Scrape article
          const articleData = await scrapeArticle(articleUrl);

          // 🛑 Validation guard
          if (
            !articleData.title ||
            articleData.title.length < 10 ||
            !articleData.content ||
            articleData.content.length < 50
          ) {
            console.log("❌ Invalid article data, skipping");
            continue;
          }

          console.log("💾 Saving article:", articleData.title);

          // 4️⃣ Save to MongoDB (SAVES IMMEDIATELY)
          const article = await beyondArticle.create(articleData);

          console.log("✅ Saved with ID:", article._id);

          savedArticles.push(article);
          savedCount++;
        } catch (err) {
          console.error("❌ Error scraping article:", articleUrl);
          console.error(err.message);
        }
      }
    }

    console.log("🎉 Total articles saved:", savedArticles.length);

    res.json({
      message: "Articles scraped and stored successfully",
      count: savedArticles.length,
      articles: savedArticles,
    });
  } catch (error) {
    console.error("🔥 Fatal error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Get the data from the database
exports.getArticles = async (req, res) => {
  try {
    // Optional: pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch articles sorted by newest first
    const articles = await beyondArticle
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Total count for verification / pagination
    const total = await beyondArticle.countDocuments();

    res.json({
      message: "Articles fetched successfully",
      count: articles.length,
      total,
      page,
      limit,
      articles,
    });
  } catch (err) {
    console.error("Error fetching articles:", err);
    res.status(500).json({ error: "Failed to fetch articles" });
  }
};

//Delete Route
exports.deleteAllArticles = async (req, res) => {
  try {
    const result = await beyondArticle.deleteMany({}); // deletes all documents
    res.json({
      message: "All articles deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error("Error deleting articles:", err);
    res.status(500).json({ error: "Failed to delete articles" });
  }
};
