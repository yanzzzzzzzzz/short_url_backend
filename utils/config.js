require('dotenv').config();

const {
  MONGODB_URI_DOCKER,
  MONGODB_URI_DEV,
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
  FRONTEND_URL,
  FACEBOOK_OAUTH_CLIENT_ID,
  FACEBOOK_OAUTH_SECRET,
  ENV_BASE_URL
} = process.env;

const defaultDbName = 'URLShortenerDB';
const defaultTestDbName = 'URLShortenerDBTest';

const dockerConnectString = MONGODB_URI_DOCKER || 'mongodb://mongodb/';
const localConnectString = MONGODB_URI_DEV || 'mongodb://localhost:27018/';

const isDocker = NODE_ENV === 'docker';
const isTest = NODE_ENV === 'test';

const connectString = isDocker ? dockerConnectString : localConnectString;
const dbName = isTest ? MONGODB_NAME || defaultTestDbName : MONGODB_NAME || defaultDbName;

const MONGODB_URI = `${connectString}${dbName}`;
const PORT = ENV_PORT || 4001;
const REDIS_HOST = ENV_REDIS_HOST || 'localhost';
const REDIS_PORT = ENV_REDIS_PORT || 6379;

const BASE_URL = ENV_BASE_URL || 'http://localhost:4001';
module.exports = {
  PORT,
  MONGODB_URI,
  SECRET,
  REDIS_PASSWORD,
  REDIS_HOST,
  REDIS_PORT,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_OAUTH_REDIRECT_URL,
  FRONTEND_URL,
  FACEBOOK_OAUTH_CLIENT_ID,
  FACEBOOK_OAUTH_SECRET,
  BASE_URL
};
