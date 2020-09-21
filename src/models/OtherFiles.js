const mongoose = require("mongoose");

const OtherFilesSchema = mongoose.Schema(
  {
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
    demography: {
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("File", OtherFilesSchema);
