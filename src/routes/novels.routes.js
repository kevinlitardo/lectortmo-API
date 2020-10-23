const express = require("express");
const router = express.Router();
const {Novels} = require("../models/File");
const verify = require("../middlewares/verifyToken");
const User = require("../models/User");

// get all
router.get("/", async (_, res) => {
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
router.get("/user/:userId", async (req, res) => {
  const novels = await Novels.find({uploader: req.params.userId})
  res.json( novels );
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

  const user = await User.findById(req.params.userId);
  novel.uploader = user;
  user.uploads.novels.push(novel);
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
  try {
    const updatedNovel = await Novels.updateOne(
      {
        _id: req.params.fileId,
      },
      {
        $set: req.body
      }
    );
    res.json(updatedNovel);
  } catch (err) {
    res.json({ message: err });
  }
});

// delete specific novel
router.delete("/:novelId/:userId", verify, async (req, res) => {
  await User.findByIdAndUpdate(req.params.userId, {
    $pull: { uploadedNovels: req.params.novelId },
  });

  try {
    const removedNovel = await Novels.findByIdAndRemove({
      _id: req.params.novelId,
    });
    res.json(removedNovel);
  } catch (err) {
    res.json({ message: err });
  }
});

module.exports = router;
