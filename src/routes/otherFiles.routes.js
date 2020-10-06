const express = require("express");
const router = express.Router();
const OtherFiles = require("../models/OtherFiles");
const verify = require("../middlewares/verifyToken");
const User = require("../models/User");

// get all
router.get("/", async (req, res) => {
  try {
    const files = await OtherFiles.find();
    res.json(files);
  } catch (err) {
    res.json({ message: err });
  }
});

// get specific file
router.get("/:title", async (req, res) => {
  const title = req.params.title.replace("-", " ");
  try {
    const specificFile = await OtherFiles.findOne({ title: title });
    res.json(specificFile);
    console.log(req.params.fileId);
  } catch (err) {
    res.json({ message: err });
  }
});

// get specific user uploaded files
router.get("/:userId", async (req, res) => {
  const user = await User.findById(req.params).populate("files");
  res.json({ user });
});

// submit file
router.post("/upload/:userId", verify, async (req, res) => {
  const {
    title,
    description,
    imageURL,
    type,
    demography,
    rating,
    status,
    tags,
  } = req.body;
  const file = new OtherFiles({
    title: title,
    description: description,
    imageURL: imageURL,
    type: type,
    demography: demography,
    rating: rating,
    status: status,
    tags: tags,
  });

  const user = await User.findById(req.params);
  file.uploader = user;
  user.uploadedFiles.push(manhwa);
  try {
    const savedFiles = await file.save();
    await user.save();
    res.json(savedFiles);
  } catch (err) {
    res.json({ message: err });
  }
});

// edit specific file
router.patch("/:fileId/:userId", verify, async (req, res) => {
  const {
    title,
    description,
    imageURL,
    type,
    demography,
    status,
    tags,
  } = req.body;

  try {
    const updatedFile = await OtherFiles.updateOne(
      {
        _id: req.params.fileId,
      },
      {
        $set: {
          title: title,
          description: description,
          imageURL: imageURL,
          type: type,
          demography: demography,
          rating: rating,
          status: status,
          tags: tags,
        },
      }
    );
    res.json(updatedFile);
    console.log(req.params.fileId);
  } catch (err) {
    res.json({ message: err });
  }
});

// delete specific file
router.delete("/:fileId/:userId", verify, async (req, res) => {
  await User.findByIdAndUpdate(req.params.userId, {
    $pull: { uploadedManhwas: req.params.manhwaId },
  });

  try {
    const removedFile = await OtherFiles.findByIdAndRemove({
      _id: req.params.fileId,
    });
    res.json(removedFile);
  } catch (err) {
    res.json({ message: err });
  }
});

module.exports = router;
