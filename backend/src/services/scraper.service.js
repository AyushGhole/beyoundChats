// src/services/scraper.service.js
const axios = require("axios");
const cheerio = require("cheerio");

const BASE_URL = "https://beyondchats.com";

async function getLastPageUrl() {
  const { data } = await axios.get(`${BASE_URL}/blogs/`);
  const $ = cheerio.load(data);

  const pageLinks = [];

  $("a.page-numbers").each((_, el) => {
    const href = $(el).attr("href");
    if (href && href.includes("/blogs/page/")) {
      pageLinks.push(href);
    }
  });

  if (pageLinks.length === 0) {
    throw new Error("Pagination links not found");
  }

  return pageLinks[pageLinks.length - 1];
}

function getArticleLinksFromPage(html) {
  const $ = cheerio.load(html);
  const links = new Set();

  $("a").each((_, el) => {
    const href = $(el).attr("href");

    if (
      href &&
      href.startsWith("https://beyondchats.com/blogs/") &&
      !href.includes("/tag/") &&
      !href.includes("/page/") &&
      !href.includes("/category/")
    ) {
      links.add(href);
    }
  });

  return Array.from(links);
}

async function scrapeArticle(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const title = $("h1").first().text().trim();

  if (!title || title.length < 10) {
    throw new Error("Invalid article page");
  }

  let content = "";

  $("article p").each((_, el) => {
    const text = $(el).text().trim();
    if (text.length > 40) {
      content += text + "\n\n";
    }
  });

  if (!content) {
    throw new Error("Article content not found");
  }

  return { title, content, url };
}

module.exports = {
  getLastPageUrl,
  getArticleLinksFromPage,
  scrapeArticle,
};
