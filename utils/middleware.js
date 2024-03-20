const logger = require('./logger');
const config = require('./config');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const requestLogger = (request, _response, next) => {
  logger.info('Method:', request.method);
  logger.info('Method:', request.path);
  logger.info('Method:', request.body);
  logger.info('----');
  next();
};
const unknownEndpoint = (_request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

const errorHandler = (error, _request, response, next) => {
  logger.error(error.message);
  if (error.name === 'CastError') {
    return response.status(400).send({
      error: 'malformatted id'
    });
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({
      error: error.message
    });
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({
      error: 'invalid token'
    });
  } else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({
      error: 'token expired'
    });
  }
  next(error);
};
const userExtractor = async (request, _response, next) => {
  const token = request.token;
  if (token) {
    const decodedToken = jwt.verify(token, config.SECRET);
    request.user = await User.findById(decodedToken.id);
  }
  next();
};
const tokenExtractor = (request, _response, next) => {
  const authorization = request.get('authorization');
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    request.token = authorization.substring(7);
  }
  next();
};
module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  userExtractor,
  tokenExtractor
};
