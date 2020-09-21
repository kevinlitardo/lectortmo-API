const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
