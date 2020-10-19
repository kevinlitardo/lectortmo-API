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
    uploads: {
      mangas: [
        {
          type: Schema.Types.ObjectId,
          ref: "Mangas",
        },
      ],
      manhwas: [
        {
          type: Schema.Types.ObjectId,
          ref: "Manhwas",
        },
      ],
      novels: [
        {
          type: Schema.Types.ObjectId,
          ref: "Novels",
        },
      ],
    },
    lists: {
      read: [
        {type: Schema.Types.ObjectId}
      ],
      pending: [
        {type: Schema.Types.ObjectId}
      ],
      following: [
        {type: Schema.Types.ObjectId}
      ],
      favorite: [
        {type: Schema.Types.ObjectId}
      ],
      obtained: [
        {type: Schema.Types.ObjectId}
      ],
      abandoned: [
        {type: Schema.Types.ObjectId}
      ]
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
