const jwt = require('jsonwebtoken');
const config = require('./config');
const TOKEN_EXPIRATION_SECONDS = 3600;
function generateJwtToken(user) {
  return jwt.sign({ id: user._id }, config.SECRET, {
    expiresIn: TOKEN_EXPIRATION_SECONDS
  });
}

function setCookie(res, name, value, options) {
  res.cookie(name, value, options);
}

async function setAuthCookies(user, res) {
  const token = generateJwtToken(user);
  const expirationDate = new Date(Date.now() + TOKEN_EXPIRATION_SECONDS * 1000);

  setCookie(res, 'authToken', token, {
    httpOnly: true,
    expires: expirationDate
  });
}

module.exports = {
  setAuthCookies
};
