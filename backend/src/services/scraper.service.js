// src/services/scraper.service.js
const axios = require("axios");
const cheerio = require("cheerio");

const BASE_URL = "https://beyondchats.com";

async function getLastPageUrl() {
  const { data } = await axios.get(`${BASE_URL}/blogs/`);
  const $ = cheerio.load(data);

  let lastPage = null;

  $(".page-numbers").each((_, el) => {
    const text = $(el).text();
    if (!isNaN(text)) lastPage = text;
  });

  if (!lastPage) throw new Error("Pagination not found");

  return `${BASE_URL}/blogs/page/${lastPage}/`;
}

async function getArticleLinks(pageUrl) {
  const { data } = await axios.get(pageUrl);
  const $ = cheerio.load(data);

  const links = [];

  $("article h2 a").each((_, el) => {
    if (links.length < 5) {
      links.push($(el).attr("href"));
    }
  });

  return links;
}

async function scrapeArticle(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const title = $("h1").first().text().trim();

  const content = $(".entry-content p")
    .map((_, el) => $(el).text())
    .get()
    .join("\n\n");

  return { title, content, url };
}

module.exports = {
  getLastPageUrl,
  getArticleLinks,
  scrapeArticle,
};
