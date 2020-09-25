const express = require("express");
const router = express.Router();
const OtherFiles = require("../models/OtherFiles");

// get all
router.get("/", async (req, res) => {
  try {
    const files = await OtherFiles.find();
    res.json(files);
  } catch (err) {
    res.json({ message: err });
  }
});

// submit file
router.post("/upload", async (req, res) => {
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
  try {
    const savedFiles = await file.save();
    res.json(savedFiles);
  } catch (err) {
    res.json({ message: err });
  }
});

// get specific file
router.get("/:fileId", async (req, res) => {
  try {
    const specificFile = await OtherFiles.findById(req.params.fileId);
    res.json(specificFile);
    console.log(req.params.fileId);
  } catch (err) {
    res.json({ message: err });
  }
});

// edit specific file
router.patch("/:fileId", async (req, res) => {
  try {
    const updatedFile = await OtherFiles.updateOne(
      {
        _id: req.params.fileId,
      },
      {
        $set: { title: req.body.title },
      }
    );
    res.json(updatedFile);
    console.log(req.params.fileId);
  } catch (err) {
    res.json({ message: err });
  }
});

// delete specific file
router.delete("/:fileId", async (req, res) => {
  try {
    const removedFile = await OtherFiles.findByIdAndRemove({
      _id: req.params.fileId,
    });
    res.json(removedFile);
    console.log(req.params.fileId);
  } catch (err) {
    res.json({ message: err });
  }
});

module.exports = router;
