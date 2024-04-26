const jwt = require('jsonwebtoken');
const config = require('./config');

function generateJwtToken(user) {
  return jwt.sign({ username: user.username, id: user._id }, config.SECRET, {
    expiresIn: 3600
  });
}

function setCookie(res, name, value, options) {
  res.cookie(name, value, options);
}

async function setAuthCookies(user, res) {
  const token = generateJwtToken(user);
  const expirationDate = new Date();
  expirationDate.setTime(expirationDate.getTime() + 60 * 60 * 1000);

  setCookie(res, 'customToken', token, {
    httpOnly: true,
    expires: expirationDate
  });

  setCookie(res, 'username', user.username, {
    expires: expirationDate
  });
}

module.exports = {
  setAuthCookies
};
