const express = require("express");
const router = express.Router();
const Mangas = require("../models/File");
const verify = require("../middlewares/verifyToken");
const User = require("../models/User");

// get all
router.get("/", async (_, res) => {
  try {
    const mangas = await Mangas.find();
    res.json(mangas);
  } catch (err) {
    res.json({ message: err });
  }
});

// get specific file
router.get("/:title", async (req, res) => {
  const title = req.params.title.replace("-", " ");
  try {
    const specificManga = await Mangas.findOne({ title: title });
    res.json(specificManga);
    console.log(req.params.mangaId);
  } catch (err) {
    res.json({ message: err });
  }
});

// get specific user uploaded files
router.get("/user/:userId", async (req, res) => {
  const mangas = await Mangas.find({uploader: req.params.userId})
  res.json( mangas );
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
  const manga = new Mangas({
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
  manga.uploader = user;
  user.uploads.mangas.push(manga);
  try {
    const savedMangas = await manga.save();
    await user.save();
    res.json(savedMangas);
  } catch (err) {
    res.json({ message: err });
  }
});

// edit specific file
router.patch("/:mangaId/:userId", verify, async (req, res) => {
  try {
    const updatedManga = await Mangas.updateOne(
      {
        _id: req.params.mangaId,
      },
      {
        $set: req.body
      }
    );
    res.json(updatedManga);
  } catch (err) {
    res.json({ message: err });
  }
});

// delete specific file
router.delete("/:mangaId/:userId", verify, async (req, res) => {
  await User.findByIdAndUpdate(req.params.userId, {
    $pull: { uploadedMangas: req.params.mangaId },
  });

  try {
    const removedManga = await Mangas.findByIdAndRemove({
      _id: req.params.mangaId,
    });
    res.json(removedManga);
  } catch (err) {
    res.json({ message: err });
  }
});

module.exports = router;
