const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema({
  url: { type: String, required: true },
  shortcode: { type: String, required: true, unique: true },
  validity: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  clickCount: { type: Number, default: 0 }
});

urlSchema.index({ validity: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Url", urlSchema);
