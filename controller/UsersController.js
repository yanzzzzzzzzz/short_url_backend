const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");

usersRouter.post("", async (req, res) => {
  const { username, name, password } = req.body;
  const userIsExist = await User.findOne({ username });
  if (userIsExist) {
    return res.status(400);
  } else {
    const saltRounts = 10;
    const passwordHash = await bcrypt.hash(password, saltRounts);

    const user = new User({
      username,
      name,
      passwordHash,
    });

    const savedUser = await user.save();

    res.status(201).json(savedUser);
  }
});

module.exports = usersRouter;
