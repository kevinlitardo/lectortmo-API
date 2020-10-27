const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const {pagination} = require("../middlewares/pagination");
const verify = require("../middlewares/verifyToken");
const jwt = require("jsonwebtoken");
const { cloudinary } = require('../utils/cloudinary')
const {
  registerValidation,
  loginValidation,
} = require("../validation/validation");

// check for saved frontend token
router.post('/whoiam', async (req, res) =>{
  const token = req.header("auth_token");
  if (!token) return res.status(200).send("No user saved");

  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    
    const user = await User.findById(verified._id)
    res.status(200).send({
      username: user.username, 
      id: user._id, 
      userIMG: user.userIMG, 
      lists: user.lists,
    })
  } catch (err) {
    res.status(400).send("Invalid Token");
  }
})

// user register
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

  const user = new User({
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

// user login
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
    res.header("auth_token", token).status(200).send({
      username: user.username, 
      id: user._id, 
      userIMG: user.userIMG, 
      lists: user.lists,
      token: token
    });
  } catch (error) {
    res.send({ message: error });
  }
});

// update user
router.patch('/update', verify, async (req, res) => {
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
      const fileStr = image
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
router.patch('/lists', verify, async (req, res)=> {
  const {fileId, list, userId, prevList} = req.body

  const user = await User.findById(userId);
  if(prevList != null){
    user.lists[prevList] = user.lists[prevList].filter((id) => id != fileId)
    await user.save()
  }

  if(list === prevList) {
    user.lists[list] = user.lists[prevList].filter((id) => id != fileId)
    try{
      await user.save()
      res.json(user.lists).end()
    } catch (error) {
      res.status(500).send(error)
    }
  }

  if(list !== prevList){
    try {
      user.lists[list].push(fileId);
      await user.save();
      res.json(user.lists)
    } catch (error) {
      res.status(500).send(error)
    }
  }
})

// get specific user list
router.get("/:userId/:list", [verify, pagination(User)], async (_req, res) => {
  res.send(res.pagination)
});

//get user uploads by type
router.get('/uploads/:userId/:type', [verify, pagination(User)], async (_req, res) => {
  res.send(res.pagination)
})

module.exports = router;
