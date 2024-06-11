const bcrypt = require('bcryptjs');
const User = require('../models/user');
const auth = require('../utils/auth');

exports.createUser = async (req, res) => {
  const { username, email, password } = req.body;
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'email is invalid' });
  }
  const existingUser = await User.findOne({ email: email });
  if (existingUser) {
    return res.status(400).json({ error: 'This email is already registered' });
  }
  if (username.length < 3) {
    return res.status(400).json({ error: 'username length too short' });
  }
  if (!password || password.length == 0) {
    return res.status(400).json({ error: 'password can not be null' });
  }

  const saltRounts = 10;
  const passwordHash = await bcrypt.hash(password, saltRounts);

  const user = new User({
    username,
    email,
    passwordHash
  });

  const savedUser = await user.save();

  auth.setAuthCookies(savedUser, res);
  res.status(201).json(savedUser);
};

function isValidEmail(email) {
  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

exports.getUser = async (req, res) => {
  res.json(req.user);
};
