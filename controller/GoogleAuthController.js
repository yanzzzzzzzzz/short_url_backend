const axios = require('axios');
const qs = require('qs');
const User = require('../models/user');
const config = require('../utils/config');
const authUtils = require('../utils/authUtils');

exports.auth = async (req, res) => {
  try {
    const code = req.query.code;
    const { id_token, access_token } = await getGoogleOAuthTokens(code, 'auth');
    const googleUser = await getGoogleUser(id_token, access_token);

    if (!googleUser.verified_email) {
      return res.status(403).send('Google account is not verified');
    }
    const user = await findAndUpdateUser(googleUser);

    authUtils.setAuthCookies(user, res);
    res.redirect(config.FRONTEND_URL);
  } catch (error) {
    console.error('Error during authentication:', error.message);
    res.status(500).send('Internal Server Error');
  }
};

async function getGoogleOAuthTokens(code, type) {
  const url = 'https://oauth2.googleapis.com/token';
  const values = {
    code,
    client_id: config.GOOGLE_CLIENT_ID,
    client_secret: config.GOOGLE_CLIENT_SECRET,
    redirect_uri: `${config.GOOGLE_OAUTH_REDIRECT_URL}/${type}`,
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
    console.error('Error fetching Google OAuth tokens:', error.message);
    throw new Error('Failed to fetch Google OAuth tokens');
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
    console.error('Error fetching Google user:', error.message);
    throw new Error('Failed to fetch Google user');
  }
}

async function findAndUpdateUser(googleUser) {
  try {
    let user = await User.findOne({ googleId: googleUser.id });
    if (!user) {
      user = new User({
        username: googleUser.name,
        name: googleUser.name,
        email: googleUser.email,
        googleId: googleUser.id
      });
      await user.save();
      console.log('New user registered:', user);
    } else {
      console.log('User already registered:', user);
    }
    return user;
  } catch (error) {
    console.error('Error finding or updating user:', error.message);
    throw new Error('Failed to find or update user');
  }
}
