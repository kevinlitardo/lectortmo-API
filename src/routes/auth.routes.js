const router = require("express").Router();
const User = require("../models/User");
const Users = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  registerValidation,
  loginValidation,
} = require("../validation/validation");

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // check if user email exists
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
    res.status(400).send(err);
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findOne({ email: email });
  if (!user) return res.status(400).send("The email doesn't exists");

  // check if password match
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(400).send("Invalid password");

  // create and assign token
  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
  res.header("auth-token", token).send(token);

  // res.send("Logged in!");
});

module.exports = router;