const googleAuthRouter = require('express').Router();
const axios = require('axios');
const qs = require('qs');
const User = require('../models/user');
const config = require('../utils/config');
const auth = require('../utils/auth');

googleAuthRouter.get('', async (req, res) => {
  const code = req.query.code;
  const { id_token, access_token } = await getGoogleOAuthTokens(code);
  const googleUser = await getGoogleUser(id_token, access_token);

  if (!googleUser.verified_email) {
    return res.status(403).send('Google account is not verified');
  }
  const user = await findAndUpdateUser(googleUser);

  auth.setAuthCookies(user, res);
  res.redirect(config.FrontEndUrl);
});

async function getGoogleOAuthTokens(code) {
  const url = 'https://oauth2.googleapis.com/token';

  const values = {
    code,
    client_id: config.GoogleClientId,
    client_secret: config.GoogleClientSecret,
    redirect_uri: config.GoogleOauthRedirectUrl,
    grant_type: 'authorization_code'
  };

  try {
    const res = await axios.post(url, qs.stringify(values), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return res.data;
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
}

async function getGoogleUser(id_token, access_token) {
  try {
    const res = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      {
        headers: {
          Authorization: `Bearer ${id_token}`
        }
      }
    );
    return res.data;
  } catch (error) {
    console.log(error, 'Error fetch google user');
    throw new Error(error.message);
  }
}

async function findAndUpdateUser(googleUser) {
  const user = await User.findOne({ googleId: googleUser.id });
  if (user === null) {
    const userModel = new User({
      username: googleUser.name,
      name: googleUser.name,
      email: googleUser.email,
      googleId: googleUser.id
    });
    const savedUser = await userModel.save();
    console.log('savedUser', savedUser);
    return savedUser;
  } else {
    console.log('already register');
  }
  return user;
}

module.exports = googleAuthRouter;
