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

exports.updateUser = async (req, res) => {
  try {
    var update = {};
    const { username, email } = req.body;
    if (username) {
      update.username = username;
    }
    if (email) {
      update.email = email;
    }
    const savedUser = await User.findByIdAndUpdate(req.user.id, update, {
      new: true,
      runValidators: true
    });
    res.status(204).json({ username: savedUser.username, email: savedUser.email });
  } catch (error) {
    res.status(500).json({ error });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'please login' });
    }
    await User.findByIdAndDelete(req.user.id);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error });
  }
};
