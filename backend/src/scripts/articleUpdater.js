const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");

const API_BASE = "http://localhost:5000/api/fetch/articles";
const API_UPDATE = "http://localhost:5000/api/update";

// ------------------ FETCH ARTICLES ------------------
async function fetchArticles() {
  const res = await axios.get(API_BASE);
  console.log("Fetched articles:", res.data.count);
  return res.data.articles;
}

// ------------------ FETCH ARTICLES  ------------------
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

// ------------------ VALIDATOR ------------------
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

// ------------------ AUTHORITY SITES ------------------
const AUTHORITY_SITES = [
  "https://www.ibm.com",
  "https://www.healthit.gov",
  "https://www.ncbi.nlm.nih.gov",
  "https://www.forbes.com",
  "https://www.hbr.org",
];

// ------------------ GOOGLE SEARCH ------------------
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

// ------------------ TEST ------------------
(async () => {
  const articles = await fetchArticles();

  console.log("\nSearching competitors for:", articles[0].title);
  const competitors = await googleSearch(articles[0].title);
  console.log("Top competitors:", competitors);
})();

// ------------------ SCRAPE CONTENT ------------------
async function scrapeCompetitorArticle(url) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.setViewport({ width: 1200, height: 800 });

    // Wait for JS content to load (works in all Puppeteer versions)
    await new Promise((r) => setTimeout(r, 3000));

    // Try multiple selectors based on site
    let selectors = [];

    if (url.includes("npr.org")) {
      selectors = [
        "div.article__story-text p",
        "div[data-testid='story-text'] p",
      ];
    } else if (url.includes("nih.gov")) {
      selectors = ["div.node__content p", "div.article__body p"];
    } else {
      selectors = ["p"];
    }

    let content = "";

    for (let sel of selectors) {
      const paragraphs = await page.$$eval(sel, (ps) =>
        ps.map((p) => p.innerText.trim()).filter((t) => t.length > 50)
      );
      if (paragraphs.length > 0) {
        content = paragraphs.join("\n");
        break; // stop once we found content
      }
    }

    if (!content) {
      // fallback: take first long <p> elements
      const paragraphs = await page.$$eval("p", (ps) =>
        ps.map((p) => p.innerText.trim()).filter((t) => t.length > 50)
      );
      content = paragraphs.slice(0, 20).join("\n");
    }

    return (
      content.slice(0, 3000) || "No content could be scraped from this URL."
    );
  } catch (err) {
    console.error("Error scraping competitor:", url, err.message);
    return "Error scraping content.";
  } finally {
    await browser.close();
  }
}

// ------------------ TEST------------------
(async () => {
  const url =
    "https://www.npr.org/sections/shots-health-news/2024/12/30/nx-s1-5239924/bird-flu-q-a-what-to-know-to-help-protect-yourself-and-your-pets";
  const articleContent = await scrapeCompetitorArticle(url);
  console.log("Preview:", articleContent.slice(0, 500));
})();

// ------------------ CONTENT TRANSFORMATION (LLM SUBSTITUTE) ------------------
function rewriteWithoutAI(original, competitorContents, references) {
  let rewritten = `
## Updated Article

${original}

---

## Insights from Top Ranking Articles
`;

  competitorContents.forEach((c, i) => {
    rewritten += `\n### Source ${i + 1}\n${c}\n`;
  });

  rewritten += `
---

## References
${references.map((r) => `- ${r}`).join("\n")}
`;

  return rewritten;
}

// ------------------ PUBLISH VIA CRUD ------------------
async function publishArticle(article) {
  if (!article._id) return;

  await axios.put(`${API_UPDATE}/${article._id}`, article);
  console.log("Article updated:", article.title);
}

// ------------------ MAIN PIPELINE ------------------
(async () => {
  const articles = await fetchArticles();

  for (const article of articles) {
    console.log("\nProcessing:", article.title);

    // Search
    const competitors = await googleSearch(article.title);
    console.log("Competitors:", competitors);

    // Scrape
    const contents = [];
    for (const url of competitors) {
      contents.push(await scrapeCompetitorArticle(url));
    }

    // Rewrite (NO AI)
    const newContent = rewriteWithoutAI(article.content, contents, competitors);

    // Publish
    await publishArticle({ ...article, content: newContent });
  }
})();
