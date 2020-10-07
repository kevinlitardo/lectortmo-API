const express = require("express");
const router = express.Router();
const Novels = require("../models/Novels");
const verify = require("../middlewares/verifyToken");
const User = require("../models/User");

// get all
router.get("/", async (req, res) => {
  try {
    const novels = await Novels.find();
    res.json(novels);
  } catch (err) {
    res.json({ message: err });
  }
});

// get specific novel
router.get("/:title", async (req, res) => {
  const title = req.params.title.replace("-", " ");
  try {
    const specificNovel = await Novels.findOne({ title: title });
    res.json(specificNovel);
    console.log(req.params.title);
  } catch (err) {
    res.json({ message: err });
  }
});

// get specific user uploaded novels
router.get("/:userId", async (req, res) => {
  const user = await User.findById(req.params).populate("novels");
  res.json({ user });
});

// submit novel
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
  const novel = new Novels({
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
  novels.uploader = user;
  user.uploadedNovels.push(novel);
  try {
    const savedNovel = await novel.save();
    await user.save();
    res.json(savedNovel);
  } catch (err) {
    res.json({ message: err });
  }
});

// edit specific novel
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
    const updatedNovel = await Novels.updateOne(
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
    res.json(updatedNovel);
    console.log(req.params.fileId);
  } catch (err) {
    res.json({ message: err });
  }
});

// delete specific novel
router.delete("/:fileId/:userId", verify, async (req, res) => {
  await User.findByIdAndUpdate(req.params.userId, {
    $pull: { uploadedNovels: req.params.manhwaId },
  });

  try {
    const removedNovel = await Novels.findByIdAndRemove({
      _id: req.params.fileId,
    });
    res.json(removedNovel);
  } catch (err) {
    res.json({ message: err });
  }
});

module.exports = router;
