const mongoose = require("mongoose");

const clickSchema = new mongoose.Schema({
  shortcode: { type: String, required: true },
  ip: String,
  referrer: String,
  timestamp: { type: Date, default: Date.now },
  country: String 
});

module.exports = mongoose.model("Click", clickSchema);
