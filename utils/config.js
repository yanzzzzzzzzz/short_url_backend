require('dotenv').config();

const PORT = process.env.PORT || 4001;
const MONGODB_URI =
  process.env.NODE_ENV === 'test' ? process.env.TEST_MONGODB_URI : process.env.MONGODB_URI;
const SECRET = process.env.SECRET;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const GoogleClientId = process.env.GOOGLE_CLIENT_ID;
const GoogleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const GoogleOauthRedirectUrl = process.env.GOOGLE_OAUTH_REDIRECT_URL;
const FrontEndUrl = process.env.FRONTEND_URL;
module.exports = {
  PORT,
  MONGODB_URI,
  SECRET,
  REDIS_PASSWORD,
  REDIS_HOST,
  REDIS_PORT,
  GoogleClientId,
  GoogleClientSecret,
  GoogleOauthRedirectUrl,
  FrontEndUrl
};
