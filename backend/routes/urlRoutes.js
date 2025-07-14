const express = require("express");
const router = express.Router();
const Url = require("../models/Url");
const { nanoid } = require("nanoid");
const requestIp = require("request-ip");
const Click = require("../models/Click");
const BASE_URL = process.env.BASE_URL; 

// console.log("BASE_URL:", BASE_URL);

const isValidCode = (code) => /^[a-zA-Z0-9_-]+$/.test(code);

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
    validity: expireAt
  });

  await newUrl.save();

  return res.status(201).json({
    shortUrl: `${BASE_URL}/${finalCode}`,
    shortcode: finalCode,
    validity: expireAt.toISOString()
  });
});


router.get("/:shortcode", async (req, res) => {
    const { shortcode } = req.params;
    const urlEntry = await Url.findOne({ shortcode });
  
    if (!urlEntry) return res.status(404).json({ message: "Short URL not found" });
  
    const now = new Date();
    if (now > urlEntry.validity) {
      return res.status(410).json({ message: "This short URL has expired" });
    }
  
    const ip = requestIp.getClientIp(req); 
    const referrer = req.get("Referer") || "Direct";
  
    await Click.create({
      shortcode,
      ip,
      referrer
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
        referrer
      }
    });
});

module.exports = router;
