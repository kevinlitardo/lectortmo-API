const express = require("express");
const router = express.Router();
const Manhwas = require("../models/File");
const verify = require("../middlewares/verifyToken");
const User = require("../models/User");

// get all
router.get("/", async (_, res) => {
  try {
    const manhwas = await Manhwas.find();
    res.json(manhwas);
  } catch (err) {
    res.json({ message: err });
  }
});

// get specific file
router.get("/:title", async (req, res) => {
  const title = req.params.title.replace("-", " ");
  try {
    const specificManhwa = await Manhwas.findOne({ title: title });
    res.json(specificManhwa);
    console.log(req.params.title);
  } catch (err) {
    res.json({ message: err });
  }
});

// get specific user uploaded manhwas
router.get("/:userId", async (req, res) => {
  const manhwas = await Manhwas.find({uploader: req.params.userId})
  res.json( manhwas );
});

// submit file
router.post("/upload/:userId", verify, async (req, res) => {
  const {
    title,
    description,
    imageURL,
    type,
    demography,
    status,
    tags,
  } = req.body;
  const manhwa = new Manhwas({
    title: title,
    description: description,
    imageURL: imageURL,
    type: type,
    demography: demography,
    status: status,
    tags: tags,
  });

  const user = await User.findById(req.params.userId);
  manhwa.uploader = user;
  user.uploads.manhwas.push(manhwa);
  try {
    const savedManhwa = await manhwa.save();
    await user.save();
    res.json({ savedManhwa });
  } catch (err) {
    res.json({ message: err });
  }
});

// edit specific file
router.patch("/:manhwaId/:userId", verify, async (req, res) => {
  try {
    const updatedManhwa = await Manhwas.updateOne(
      {
        _id: req.params.manhwaId,
      },
      {
        $set: req.body
      }
    );
    res.json(updatedManhwa);
  } catch (err) {
    res.json({ message: err });
  }
});

// delete specific file
router.delete("/:manhwaId/:userId", verify, async (req, res) => {
  await User.findByIdAndUpdate(req.params.userId, {
    $pull: { uploadedManhwas: req.params.manhwaId },
  });

  try {
    const removedManhwa = await Manhwas.findByIdAndRemove({
      _id: req.params.manhwaId,
    });
    res.json(removedManhwa);
  } catch (err) {
    res.json({ message: err });
  }
});

module.exports = router;
