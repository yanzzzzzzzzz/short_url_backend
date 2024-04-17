const redis = require('redis');
const config = require('../utils/config');

class RedisClient {
  constructor() {
    this.client = redis.createClient({
      password: config.REDIS_PASSWORD,
      socket: {
        host: config.REDIS_HOST,
        port: config.REDIS_PORT
      }
    });
    this.client.on('error', (err) => console.log('Redis Client Error', err));
    this.client.connect();
  }

  getClient() {
    return this.client;
  }
}

module.exports = new RedisClient().getClient();
