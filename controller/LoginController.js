const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const loginRouter = require('express').Router();
const User = require('../models/user');
const config = require('../utils/config');
const auth = require('../utils/auth');

loginRouter.post('/', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (user === null) {
    return res.status(401).json({ error: 'invalid username or password' });
  }
  const passwordCorrect = await bcrypt.compare(password, user.passwordHash);

  if (!passwordCorrect) {
    return res.status(401).json({ error: 'invalid username or password' });
  }

  auth.setAuthCookies(user, res);
  return res.status(200).end();
});

module.exports = loginRouter;
