const express = require('express');
const logoutRouter = express.Router();
const logoutController = require('../controller/LogoutController');

logoutRouter.post('/', logoutController.logout);

module.exports = logoutRouter;
