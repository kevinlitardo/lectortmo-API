const mongoose = require("mongoose");

const ManhwasSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageURL: {
    type: String,
  },
  type: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    default: "0",
  },
  status: {
    type: String,
    required: true,
  },
  tags: {
    type: Array,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Manhwa", ManhwasSchema);
