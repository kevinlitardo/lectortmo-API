const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FileSchema = Schema(
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
    chapters: {
      type: Array,
    },
    tags: {
      type: Array,
      required: true,
    },
    uploader: {
      type: Schema.Types.ObjectId,
      ref: "User",
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("File", FileSchema)
