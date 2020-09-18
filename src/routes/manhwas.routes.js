const express = require("express");
const router = express.Router();
const Manhwas = require("../models/Manhwas");

// get all
router.get("/", async (req, res) => {
  try {
    const manhwas = await Manhwas.find();
    res.json(manhwas);
  } catch (err) {
    res.json({ message: err });
  }
});

// submit file
router.post("/upload", async (req, res) => {
  const { title, description, imageURL, type, rating, status, tags } = req.body;
  const manhwa = new Manhwas({
    title: title,
    description: description,
    imageURL: imageURL,
    type: type,
    rating: rating,
    status: status,
    tags: tags,
  });
  try {
    const savedManhwas = await manhwa.save();
    res.json(savedManhwas);
  } catch (err) {
    res.json({ message: err });
  }
});

// get specific file
router.get("/:manhwaId", async (req, res) => {
  try {
    const specificManhwa = await Manhwas.findById(req.params.manhwaId);
    res.json(specificManhwa);
    console.log(req.params.manhwaId);
  } catch (err) {
    res.json({ message: err });
  }
});

// edit specific file
router.patch("/:manhwaId", async (req, res) => {
  try {
    const updatedManhwa = await Manhwas.updateOne(
      {
        _id: req.params.manhwaId,
      },
      {
        $set: { title: req.body.title },
      }
    );
    res.json(updatedManhwa);
    console.log(req.params.manhwaId);
  } catch (err) {
    res.json({ message: err });
  }
});

// delete specific file
router.delete("/:manhwaId", async (req, res) => {
  try {
    const removedManhwa = await Manhwas.findByIdAndRemove({
      _id: req.params.manhwaId,
    });
    res.json(removedManhwa);
    console.log(req.params.manhwaId);
  } catch (err) {
    res.json({ message: err });
  }
});

module.exports = router;
