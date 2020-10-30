const express = require("express");
const router = express.Router();
const File = require("../models/File");
const verify = require("../middlewares/verifyToken");
const {pagination} = require("../middlewares/pagination");
const User = require("../models/User");

// get all ordered by rating + to -
router.get("/trending", pagination(File), async (_req, res) => {
  res.json(res.pagination)
});

//get all by demography and ordered by ratinga + to -
router.get("/trending/:demography", pagination(File), async (_req, res) => {
  res.json(res.pagination)
});

// get all most recent
router.get("/recent", pagination(File), async (_, res) => {
  res.json(res.pagination);
});

// get all per type
router.get("/type/:type", pagination(File), async (_req, res) => {
  res.json(res.pagination)
});

// get all per demography
router.get("/demo/:demography", pagination(File), async (_req, res) => {
  res.json(res.pagination)
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

// submit new file
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
  const {type} = req.body

  const user = await User.findOne({_id: req.params.userId})

  //remove from old list 
  if(type) {
    const lists = Object.keys(user.uploads).splice(1)
    const values = Object.values(user.uploads).splice(1)

    for (let i = 0; i < 3; i++) {
      if(values[i].some(id => id == req.params.fileId)){
        if(lists[i].slice(1, -2) == type.slice(1, -1)) return
        user.uploads[lists[i]] = values[i].filter(id => id != req.params.fileId)
      }
    }

    if(type === "Manga"){
      user.uploads.mangas.push(req.params.fileId)
    }
    if(type === "Manhwa"){
      user.uploads.manhwas.push(req.params.fileId)
    }
    if(type === "Novela"){
      user.uploads.novels.push(req.params.fileId)
    }
  }

  try {
    const updatedFile = await File.updateOne(
      {
        _id: req.params.fileId,
      },
      {
        $set: req.body
      }
    );
    user.save()
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
    const removedFile = await File.deleteOne({
      _id: req.params.fileId,
    });
    user.save()
    res.json(removedFile);
  } catch (err) {
    res.json({ message: err });
  }
});

module.exports = router;