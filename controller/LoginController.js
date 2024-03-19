const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const loginRouter = require('express').Router();
const User = require('../models/user');
const config = require('../utils/config');
loginRouter.post('/', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (user === null) {
    return res.status(401).json({ error: 'invalid username or password' });
  }
  const passwordCorrect = bcrypt.compare(password, user.passwordHash);

  if (!passwordCorrect) {
    return res.status(401).json({ error: 'invalid username or password' });
  }

  const userForToken = { username: user.username, id: user._id };

  const token = jwt.sign(userForToken, config.SECRET, { expiresIn: 3600 });

  res.status(200).send({ token, username: user.username, name: user.name });
});

module.exports = loginRouter;
