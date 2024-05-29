const express = require('express');
const LogoutRouter = express.Router();
const LogoutController = require('../controller/LogoutController');

LogoutRouter.post('/', LogoutController.logout);

module.exports = LogoutRouter;
