const router = require("express").Router();
const User = require("../models/User");
const Users = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { cloudinary } = require('../utils/cloudinary')
const {
  registerValidation,
  loginValidation,
} = require("../validation/validation");

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send("Los datos no cumplen los requisitos");

  // check if user email or name exists
  const userExists = await User.findOne({ username: username });
  if (userExists) return res.status(400).send("Username already exists");
  const emailExists = await User.findOne({ email: email });
  if (emailExists) return res.status(400).send("Email already exists");

  // hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = new Users({
    username: username,
    email: email,
    password: hashedPassword,
  });
  try {
    const savedUser = await user.save();
    res.send(savedUser);
  } catch (err) {
    res.status(400).send("error at register");
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const { error } = loginValidation(req.body);
  if (error) res.status(400).send(error.details[0].message);

  const user = await User.findOne({ email: email });
  if (!user) res.status(400).send("The email doesn't exists");

  // check if password match
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) res.status(400).send("Invalid password");

  try {
    // create and assign token
    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
    res.cookie("auth_token", token, {
      httpOnly: true,
      maxAge: 3600,
      // secure: true,
    });
    res.status(200).send({username: user.username, id: user._id, userIMG: user.userIMG, lists: user.lists});
  } catch (error) {
    res.send({ message: error });
  }
});

// update user
router.patch('/update', async (req, res) => {
  const {username, new_password, new_email, image} = req.body
  let updateValues = {}
  if(new_password !== '') {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);
    updateValues.password = hashedPassword
  }
  if(new_email !== '') updateValues.email = new_email
  if(username !== '') updateValues.username = username
    const usernameExists = await User.findOne({ username: username });
    if (usernameExists) return res.status(400).send("Username already exists");
    const emailExists = await User.findOne({ email: new_email });
    if (emailExists) return res.status(400).send("Email already exists");
  if(image !== '') {
    try {
      const fileStr = req.body.image
      const uploadedResponse = await cloudinary.uploader.upload(fileStr, {
        upload_preset: 'lectortmo'
      })
      await User.updateOne(
        {_id: req.body.id},{
          $set: {
            userIMG: uploadedResponse.secure_url
          }
        }
      )
      res.send('Uploaded!')
    } catch (error) {
      res.status(500).send(error)
    }
  }

  if (Object.keys(updateValues).length > 0) {
    try {
      await User.updateOne(
        { _id: req.body.id }, {
          $set: updateValues
        }
      )
      res.status(200).send('Updated!').end()
    } catch (error) {
      console.log(error)
      res.status(500).send('Something went wrong').end()
    }
  }
})

// add file to user lists
router.patch('/lists', async (req, res)=> {
  const {fileId, list, userId, prevList} = req.body

  const user = await User.findById(userId);
  if(prevList != null){
    user.lists[prevList] = user.lists[prevList].filter((id) => id != fileId)
    await user.save()
  }

  try {
    user.lists[list].push(fileId);
    await user.save();
    res.json(user.lists)
  } catch (error) {
    res.status(500).send(error)
  }
})

// get specific user manhwas list
router.get("/:userId/:list", async (req, res) => {
  try {
    await User.findOne({_id: req.params.userId}).
      populate(`lists.${req.params.list}`).
      select(`lists.${req.params.list} -_id`).
      exec((err, list)=>{
        if(err) return console.log(err)
        res.json(list)
    })
  } catch (err) {
    console.log(err)
  }
});

//logout 
router.get('/logout', (_req, res)=>{
  res.cookie("auth_token", '', {maxAge: 1}).end()
})

module.exports = router;
