const express = require("express");
const router = express.Router();
const Mangas = require("../models/Mangas");
const verify = require("../middlewares/verifyToken");
const User = require("../models/User");

// get all
router.get("/", async (req, res) => {
  try {
    const mangas = await Mangas.find();
    res.json(mangas);
  } catch (err) {
    res.json({ message: err });
  }
});

// get specific user uploaded files
router.get("/:userId", async (req, res) => {
  const user = await User.findById(req.params).populate("mangas");
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

  const user = await User.findById(req.params);
  manga.uploader = user;
  user.uploadedMangas.push(manhwa);
  try {
    const savedMangas = await manga.save();
    await user.save();
    res.json(savedMangas);
  } catch (err) {
    res.json({ message: err });
  }
});

// get specific file
router.get("/:mangaId", async (req, res) => {
  try {
    const specificManga = await Mangas.findById(req.params.mangaId);
    res.json(specificManga);
    console.log(req.params.mangaId);
  } catch (err) {
    res.json({ message: err });
  }
});

// edit specific file
router.patch("/:mangaId/:userId", verify, async (req, res) => {
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
    const updatedManga = await Mangas.updateOne(
      {
        _id: req.params.mangaId,
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
    res.json(updatedManga);
  } catch (err) {
    res.json({ message: err });
  }
});

// delete specific file
router.delete("/:mangaId/:userId", verify, async (req, res) => {
  const user = await User.findById(req.params.userId);
  user.uploadedMangas.pull({ _id: req.params.mangaId });

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
