const express = require("express");
const router = express.Router();
const File = require("../models/File");
const verify = require("../middlewares/verifyToken");
const User = require("../models/User");

// get all
router.get("/:type", async (req, res) => {
  const string = req.params.type.slice(1, -1)
  console.log(string)
  try {
    const file = await File.find({"type": {"$regex": string}});
    res.json(file);
  } catch (err) {
    res.json({ message: err });
  }
});

// get specific file
router.get("/file/:title", async (req, res) => {
  const title = req.params.title.replace("-", " ");
  try {
    const specificFile = await File.findOne({ title: {"$regex": title}});
    res.json(specificFile);
    console.log(title);
  } catch (err) {
    res.json({ message: err });
  }
});

// get specific user uploaded File
// router.get("/:userId", async (req, res) => {
//   const File = await File.find({uploader: req.params.userId})
//   res.json( File );
// });

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
  const file = new File({
    title: title,
    description: description,
    imageURL: imageURL,
    type: type,
    demography: demography,
    status: status,
    tags: tags,
  });

  const user = await User.findById(req.params.userId);
  file.uploader = user;
  if(type === 'Manga'){ user.uploads.mangas.push(file) }  
  if(type === 'Manhwa'){ user.uploads.manhwas.push(file) }  
  if(type === 'Novela'){ user.uploads.novels.push(file) }  

  try {
    const savedFile = await file.save();
    await user.save();
    res.json({ savedFile });
  } catch (err) {
    res.json({ message: err });
  }
});

// edit specific file
router.patch("/:fileId/:userId", verify, async (req, res) => {
  try {
    const updatedFile = await File.updateOne(
      {
        _id: req.params.fileId,
      },
      {
        $set: req.body
      }
    );
    res.json(updatedFile);
  } catch (err) {
    res.json({ message: err });
  }
});

// delete specific file
router.delete("/:fileId/:userId", verify, async (req, res) => {
  const user = await User.findById(req.params.userId);
  const lists = Object.keys(user.uploads).slice(1)
  const arrays = Object.values(user.uploads).slice(1)
  for (let i = 0; i < 3; i++) {
    if(arrays[i].find(id => id == req.params.fileId)) {
      user.uploads[lists[i]] = arrays[i].filter(id=>id != req.params.fileId)
    }
  }

  try {
    const removedFile = await File.findByIdAndRemove({
      _id: req.params.fileId,
    });
    user.save()
    res.json(removedFile);
  } catch (err) {
    res.json({ message: err });
  }
});

module.exports = router;