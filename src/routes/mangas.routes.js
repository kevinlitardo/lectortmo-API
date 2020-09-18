const express = require("express");
const router = express.Router();
const Mangas = require("../models/Mangas");

// get all
router.get("/", async (req, res) => {
  try {
    const mangas = await Mangas.find();
    res.json(mangas);
  } catch (err) {
    res.json({ message: err });
  }
});

// submit file
router.post("/upload", async (req, res) => {
  const { title, description, imageURL, type, rating, status, tags } = req.body;
  const manga = new Mangas({
    title: title,
    description: description,
    imageURL: imageURL,
    type: type,
    rating: rating,
    status: status,
    tags: tags,
  });
  try {
    const savedMangas = await manga.save();
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
router.patch("/:mangaId", async (req, res) => {
  try {
    const updatedManga = await Mangas.updateOne(
      {
        _id: req.params.mangaId,
      },
      {
        $set: { title: req.body.title },
      }
    );
    res.json(updatedManga);
    console.log(req.params.mangaId);
  } catch (err) {
    res.json({ message: err });
  }
});

// delete specific file
router.delete("/:mangaId", async (req, res) => {
  try {
    const removedManga = await Mangas.findByIdAndRemove({
      _id: req.params.mangaId,
    });
    res.json(removedManga);
    console.log(req.params.mangaId);
  } catch (err) {
    res.json({ message: err });
  }
});

module.exports = router;
