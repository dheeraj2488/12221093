const express = require("express");
const router = express.Router();
const Url = require("../models/Url");
const { nanoid } = require("nanoid");
const requestIp = require("request-ip");
const Click = require("../models/Click");
const BASE_URL = process.env.BASE_URL;

// console.log("BASE_URL:", BASE_URL);

const isValidCode = (code) => /^[a-zA-Z0-9_-]+$/.test(code);


// this route handles the creation of short URLs
router.post("/shorturls", async (req, res) => {
  const { url, validity, shortcode } = req.body;

  if (!url) return res.status(400).json({ message: "URL is required" });

  let finalCode;

  if (shortcode) {
    if (!isValidCode(shortcode)) {
      return res.status(400).json({ message: "Invalid shortcode format" });
    }

    const exists = await Url.findOne({ shortcode });
    if (exists) {
      return res.status(409).json({ message: "Shortcode already exists" });
    }

    finalCode = shortcode;
  } else {
    let isUnique = false;
    while (!isUnique) {
      finalCode = nanoid(8);
      const exists = await Url.findOne({ shortcode: finalCode });
      if (!exists) isUnique = true;
    }
  }

  const expireAt = new Date(Date.now() + (validity || 30) * 60 * 1000);

  const newUrl = new Url({
    url,
    shortcode: finalCode,
    validity: expireAt,
  });

  await newUrl.save();

  return res.status(201).json({
    shortUrl: `${BASE_URL}/${finalCode}`,
    shortcode: finalCode,
    validity: expireAt.toISOString(),
  });
});
 // this routes returns all the urls and their stats
router.get("/urls", async (req, res) => {
  try {
    console.log("Fetching URL statistics...");
    const urls = await Url.find().sort({ createdAt: -1 });
    const baseUrl = process.env.BASE_URL || "http://localhost:5050";

    const fullData = await Promise.all(
      urls.map(async (urlDoc) => {
        const clicks = await Click.find({ shortcode: urlDoc.shortcode }).sort({
          timestamp: -1,
        });

        return {
          url: urlDoc.url,
          shortcode: urlDoc.shortcode,
          createdAt: urlDoc.createdAt,
          validity: urlDoc.validity,
          shortUrl: `${baseUrl}/${urlDoc.shortcode}`,
          totalClicks: clicks.length,
          clicks: clicks.map((click) => ({
            timestamp: click.timestamp,
            referrer: click.referrer || "Direct",
            ip: click.ip || "N/A",
            country: click.country || "Unknown",
          })),
        };
      })
    );

    res.json(fullData);
  } catch (err) {
    console.error("Failed to fetch stats:", err.message);
    res.status(500).json({ message: "Server error fetching URL stats" });
  }
});


// this route handles redirection for shortcodes , tested from Postman and works fine
router.get("/:shortcode", async (req, res) => {
  const { shortcode } = req.params;
  const urlEntry = await Url.findOne({ shortcode });

  if (!urlEntry)
    return res.status(404).json({ message: "Short URL not found" });

  const now = new Date();
  if (now > urlEntry.validity) {
    return res.status(410).json({ message: "This short URL has expired" });
  }

  const ip = requestIp.getClientIp(req);
  const referrer = req.get("Referer") || "Direct";

  await Click.create({
    shortcode,
    ip,
    referrer,
  });

  urlEntry.clickCount += 1;
  await urlEntry.save();

  res.json({
    originalUrl: urlEntry.url,
    shortcode: urlEntry.shortcode,
    createdAt: urlEntry.createdAt,
    validity: urlEntry.validity,
    totalClicks: urlEntry.clickCount,
    lastClick: {
      ip,
      referrer,
    },
  });
});

module.exports = router;
