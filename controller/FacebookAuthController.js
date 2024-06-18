const config = require('../utils/config');
const User = require('../models/user');
const authUtils = require('../utils/authUtils');

exports.callback = async (req, res) => {
  try {
    const appAccessTokenRes = await fetch(
      `https://graph.facebook.com/v20.0/oauth/access_token?${new URLSearchParams({
        client_id: config.FACEBOOK_OAUTH_CLIENT_ID,
        client_secret: config.FACEBOOK_OAUTH_SECRET,
        grant_type: 'client_credentials'
      })}`
    );
    const { access_token: appAccessToken } = await appAccessTokenRes.json();
    const { code, error } = req.query;

    const accessTokenRes = await fetch(
      `https://graph.facebook.com/v20.0/oauth/access_token?${new URLSearchParams({
        client_id: config.FACEBOOK_OAUTH_CLIENT_ID,
        client_secret: config.FACEBOOK_OAUTH_SECRET,
        redirect_uri: `${config.BASE_URL}/api/sessions/oauth/facebook/callback`,
        code: code
      })}`
    );
    const data = await accessTokenRes.json();

    const verifyTokenRes = await fetch(
      `https://graph.facebook.com/debug_token?${new URLSearchParams({
        input_token: data.access_token,
        access_token: appAccessToken
      })}`
    );
    const verifyTokenJson = await verifyTokenRes.json();
    const profileRes = await fetch(
      `https://graph.facebook.com/v20.0/${verifyTokenJson.data.user_id}?${new URLSearchParams({
        access_token: data.access_token,
        fields: ['id', 'short_name', 'email'].join(',')
      })}`
    );
    const profileJson = await profileRes.json();
    const user = await findAndUpdateUser(profileJson.id, profileJson.email, profileJson.short_name);
    await authUtils.setAuthCookies(user, res);
    res.redirect(config.FRONTEND_URL);
  } catch (error) {
    console.error('Error during authentication:', error.message);
    res.status(500).send('Internal Server Error:', error.message);
  }
};

exports.auth = async (_req, res) => {
  const authEndpoint = new URL('https://www.facebook.com/v20.0/dialog/oauth');
  authEndpoint.searchParams.append('client_id', config.FACEBOOK_OAUTH_CLIENT_ID);
  authEndpoint.searchParams.append(
    'redirect_uri',
    `${config.BASE_URL}/api/sessions/oauth/facebook/callback`
  );
  authEndpoint.searchParams.append('response_type', 'code');
  authEndpoint.searchParams.append('scope', ['public_profile', 'email'].join(' '));

  res.redirect(authEndpoint.href);
};

const findAndUpdateUser = async (facebookId, email, username) => {
  try {
    const user = await User.findOne({ facebookId: facebookId });
    if (!user) {
      const newUser = new User({
        username,
        email,
        facebookId
      });
      await newUser.save();
      return newUser;
    }
    return user;
  } catch (error) {
    console.error('Error finding or updating user:', error.message);
    throw new Error('Failed to find or update user');
  }
};
