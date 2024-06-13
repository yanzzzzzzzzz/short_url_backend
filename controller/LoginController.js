const bcrypt = require('bcryptjs');
const User = require('../models/user');
const auth = require('../utils/auth');
const config = require('../utils/config');
const jwt = require('jsonwebtoken');
const expiredSecond = 3600;

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (user === null) {
    return res.status(401).json({ error: 'invalid username or password' });
  }
  const passwordCorrect = await bcrypt.compare(password, user.passwordHash);

  if (!passwordCorrect) {
    return res.status(401).json({ error: 'invalid username or password' });
  }

  auth.setAuthCookies(user, res);
  return res.status(200).end();
};

exports.authentication = async (req, res) => {
  const token = req.cookies.customToken;
  if (!token) {
    return res.sendStatus(401);
  }
  jwt.verify(token, config.SECRET, (err, decoded) => {
    if (err) {
      return res.sendStatus(403);
    }

    res.status(200).end();
  });
};
