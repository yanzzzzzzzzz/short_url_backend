const redis = require('redis');
const config = require('../utils/config');

class RedisClient {
  constructor() {
    const cof = {
      password: config.REDIS_PASSWORD,
      socket: {
          host: config.REDIS_HOST,
          port: config.REDIS_PORT
      }
    };
    this.client = redis.createClient(cof);
    this.client.on('error', (err) => console.log('Redis Client Error', err));
    this.client.connect();
  }

  getClient() {
    return this.client;
  }
}

module.exports = new RedisClient().getClient();
