const router = require("express").Router();
const User = require("../models/User");
const Users = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {cloudinary} = require('../utils/cloudinary')
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
  } catch (error) {
    res.send({ message: err });
  }

  res.status(200).send([user.username, user._id, user.userIMG]).end();
});

// update user
router.patch('/update', async (req, res) => {
  let updateValues = {}
  if (req.body.new_password !== '') {
    updateValues = {
      username: req.body.username,
      email: req.body.email,
      password: req.body.new_password
    }
  } else {
    updateValues = {
      username: req.body.username,
      email: req.body.email,
    }
  }

  try {
    const updatedUser = await User.updateOne(
      {_id: req.body.id},{
        $set: updateValues
      }
    )
    console.log(updatedUser)
  } catch (error) {
    console.log(error)
    res.status(500).send('Something went wrong')
  }

  try {
    // create and assign token
    const token = jwt.sign({ _id: req.body.id}, process.env.TOKEN_SECRET);
    res.cookie("auth_token", token, {
      httpOnly: true,
      maxAge: 3600,
      // secure: true,
    });
    res.status(200).send([user.username, user._id, user.userIMG]).end();
  } catch (err) {
    res.send({ message: err });
  }

})

// upload image route 
router.patch('/updateImage', async (req, res) => {
  try {
    const fileStr = req.body.data
    const uploadedResponse = await cloudinary.uploader.upload(fileStr, {
      upload_preset: 'lectortmo'
    })

    const updatedUserImage = await User.updateOne(
      {_id: req.body.id},{
        $set: {
          userIMG: uploadedResponse.secure_url
        }
      }
    )
    console.log(updatedUserImage)
    res.send('Uploaded!')
  } catch (error) {
    console.log(error)
    res.status(500).send('Something went wrong')
  }
})

module.exports = router;
