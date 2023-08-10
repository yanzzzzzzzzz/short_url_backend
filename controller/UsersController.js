const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");

usersRouter.post("", async (req, res) => {
  const { username, name, password } = req.body;
  if (username.length < 3) {
    return res.status(400).json({ error: "username length too short" });
  }
  if (!password || password.length == 0) {
    return res.status(400).json({ error: "password can not be null" });
  }
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(400).json({ error: "username must be unique" });
  }

  const saltRounts = 10;
  const passwordHash = await bcrypt.hash(password, saltRounts);

  const user = new User({
    username,
    name,
    passwordHash,
  });

  const savedUser = await user.save();

  res.status(201).json(savedUser);
});

usersRouter.get("/", async (req, res) => {
  const users = await User.find({}).populate("urls");
  res.json(users);
});

usersRouter.get("/:username", async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username });
  res.json(user);
});
module.exports = usersRouter;
