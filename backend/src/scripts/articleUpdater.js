const axios = require("axios");
const cheerio = require("cheerio");
const API_BASE = "http://localhost:5000/api/fetch/articles";

async function fetchArticles() {
  const res = await axios.get(API_BASE);
  console.log("Fetched articles:", res.data.count);
  return res.data.articles;
}

(async () => {
  try {
    const articles = await fetchArticles();
    articles.forEach((a, i) => {
      console.log(`${i + 1}. ${a.title}`);
    });
  } catch (err) {
    console.error("Failed to fetch articles:", err.message);
  }
})();

function isValidArticleUrl(url) {
  const blockedKeywords = [
    "account",
    "login",
    "signup",
    "privacy",
    "terms",
    "guide",
    "browsers",
    "#",
  ];

  // Allow real NCBI articles only
  if (url.includes("ncbi.nlm.nih.gov")) {
    return url.includes("/pmc/articles/");
  }

  return (
    url.startsWith("http") &&
    !blockedKeywords.some((word) => url.includes(word))
  );
}

const AUTHORITY_SITES = [
  "https://www.ibm.com",
  "https://www.healthit.gov",
  "https://www.ncbi.nlm.nih.gov",
  "https://www.forbes.com",
  "https://www.hbr.org",
];

async function googleSearch(query) {
  const results = [];

  for (const site of AUTHORITY_SITES) {
    try {
      const searchUrl = `${site}/search?q=${encodeURIComponent(query)}`;

      const { data } = await axios.get(searchUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        },
      });

      const $ = cheerio.load(data);

      $("a").each((_, el) => {
        const href = $(el).attr("href");
        if (href && href.startsWith("http")) {
          results.push(href);
        }
      });

      if (results.length > 0) break;
    } catch (err) {
      continue;
    }
  }

  return [...new Set(results)].filter(isValidArticleUrl).slice(0, 2);
}

(async () => {
  const articles = await fetchArticles();

  console.log("\nSearching competitors for:", articles[0].title);
  const competitors = await googleSearch(articles[0].title);
  console.log("Top competitors:", competitors);
})();

async function scrapeCompetitorArticle(url) {
  const { data } = await axios.get(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  const $ = cheerio.load(data);
  let content = "";

  $("p").each((_, el) => {
    const text = $(el).text().trim();
    if (text.length > 50) content += text + "\n";
  });

  return content.slice(0, 3000);
}

(async () => {
  try {
    const articles = await fetchArticles();

    console.log("\nSearching competitors for:", articles[0].title);
    const competitors = await googleSearch(articles[0].title);

    console.log("Competitor URLs:", competitors);

    if (!competitors.length) {
      console.log("No competitor articles found");
      return;
    }

    const competitorContent = await scrapeCompetitorArticle(competitors[0]);

    console.log(
      "\nCompetitor content preview:\n",
      competitorContent.slice(0, 500)
    );
  } catch (err) {
    console.error("Pipeline error:", err.message);
  }
})();
