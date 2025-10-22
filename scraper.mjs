import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs-extra";

async function scrapePage(page) {
  const url = `https://www.app-sales.net/nowfree/?page=${page}`;
  const response = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "Accept-Language": "en-US,en;q=0.9"
    }
  });
  const html = response.data;
  const $ = cheerio.load(html);

  const pageData = [];
  $(".sale-list-item").each((i, el) => {
    const appname = $(el).find(".app-name").text().trim();
     const appdev = $(el).find(".app-dev").text().trim();
    const appprice = $(el).find(".pricing .price-old").text().trim() || "Free";
    const appdownloads = $(el).find(".app-meta .downloads").text().replace("star", "").trim();
    const apprating = $(el).find(".app-meta .rating").text().replace("star", "").trim();
    const appredirecturl = $(el).find(".sale-list-action .waves-effect").attr("href");
    let appurl = $(el).find(".app-icon img").attr("src");

    // Improve image quality
    if (appurl && appurl.includes("=s")) {
      appurl = appurl.replace(/=s\d+/, "=s200");
    }

    pageData.push({
      appname,
      appdev,
      appprice,
      apprating,
      appdownloads,
      appurl,
      appPlatform: "Playstore",
      appredirecturl,
    });
  });

  return pageData;
}

async function scrapeFreeApps() {
  try {
    const pages = [1, 2]; // scrape pages 1 and 2
    let allData = [];

    for (const page of pages) {
      console.log(`Scraping page ${page}...`);
      const pageData = await scrapePage(page);
      allData = allData.concat(pageData);
    }

    // Save combined data
    await fs.writeJson("data.json", allData, { spaces: 2 });
    console.log(`✅ Scraping complete! Total apps: ${allData.length}`);
  } catch (error) {
    console.error("❌ Error scraping data:", error.message);
    process.exit(1);
  }
}

scrapeFreeApps();
