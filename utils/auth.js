const jwt = require('jsonwebtoken');
const config = require('./config');
const expiredSecond = 3600;
function generateJwtToken(user) {
  return jwt.sign({ id: user._id }, config.SECRET, {
    expiresIn: expiredSecond
  });
}

function setCookie(res, name, value, options) {
  res.cookie(name, value, options);
}

async function setAuthCookies(user, res) {
  const token = generateJwtToken(user);
  const expirationDate = new Date(Date.now() + expiredSecond * 1000);

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
