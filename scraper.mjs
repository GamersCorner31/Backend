import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs-extra";

async function scrapeFreeApps() {
  try {
    const response = await axios.get("https://www.app-sales.net/nowfree/?page=1");
    const html = response.data;
    const $ = cheerio.load(html);

    const FreeAppsData = [];

    $(".sale-list-item").each((i, el) => {
      const appname = $(el).find(".app-name").text().trim();
      const appprice = $(el).find(".pricing .price-old").text().trim() || "Free";
      const apprating = $(el).find(".app-meta .rating").text().replace("star", "").trim();
      const appredirecturl = $(el).find(".sale-list-action .waves-effect").attr("href");
      let appurl = $(el).find(".app-icon img").attr("src");

      // Improve image quality
      if (appurl && appurl.includes("=s")) {
        appurl = appurl.replace(/=s\d+/, "=s200");
      }

      FreeAppsData.push({
        appname,
        appprice,
        apprating,
        appurl,
        appPlatform: "Playstore",
        appredirecturl,
      });
    });

    // Save scraped data as JSON file
    await fs.writeJson("data.json", FreeAppsData, { spaces: 2 });
    console.log("✅ Data saved successfully.");
  } catch (error) {
    console.error("❌ Error scraping data:", error.message);
    process.exit(1);
  }
}

scrapeFreeApps();
