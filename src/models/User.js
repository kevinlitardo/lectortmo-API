const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = Schema(
  {
    username: {
      type: String,
      required: true,
      max: 20,
      min: 4,
    },
    email: {
      type: String,
      required: true,
      max: 100,
      min: 10,
    },
    password: {
      type: String,
      required: true,
      max: 100,
      min: 8,
    },
    userIMG: {
      type: String,
      default: "",
    },
    uploadedMangas: [
      {
        type: Schema.Types.ObjectId,
        ref: "Mangas",
      },
    ],
    uploadedManhwas: [
      {
        type: Schema.Types.ObjectId,
        ref: "Manhwas",
      },
    ],
    uploadedNovels: [
      {
        type: Schema.Types.ObjectId,
        ref: "Novels",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
