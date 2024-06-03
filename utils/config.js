require('dotenv').config();

const {
  MONGODB_URI,
  MONGODB_NAME,
  NODE_ENV,
  PORT: ENV_PORT,
  SECRET,
  REDIS_PASSWORD,
  REDIS_HOST: ENV_REDIS_HOST,
  REDIS_PORT: ENV_REDIS_PORT,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_OAUTH_REDIRECT_URL,
  FRONTEND_URL
} = process.env;

const defaultDbName = 'URLShortenerDB';
const defaultTestDbName = 'URLShortenerDBTest';

const dockerConnectString = MONGODB_URI || 'mongodb://mongodb/';
const localConnectString = MONGODB_URI || 'mongodb://localhost:27017/';

const isDocker = NODE_ENV === 'docker';
const isTest = NODE_ENV === 'test';

const connectString = isDocker ? dockerConnectString : localConnectString;
const dbName = isTest ? MONGODB_NAME || defaultTestDbName : MONGODB_NAME || defaultDbName;

const MONGODB_URI_FINAL = `${connectString}${dbName}`;
const PORT = ENV_PORT || 4001;
const REDIS_HOST = ENV_REDIS_HOST || 'localhost';
const REDIS_PORT = ENV_REDIS_PORT || 6379;

module.exports = {
  PORT,
  MONGODB_URI: MONGODB_URI_FINAL,
  SECRET,
  REDIS_PASSWORD,
  REDIS_HOST,
  REDIS_PORT,
  GoogleClientId: GOOGLE_CLIENT_ID,
  GoogleClientSecret: GOOGLE_CLIENT_SECRET,
  GoogleOauthRedirectUrl: GOOGLE_OAUTH_REDIRECT_URL,
  FrontEndUrl: FRONTEND_URL
};
