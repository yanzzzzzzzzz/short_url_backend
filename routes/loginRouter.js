const express = require('express');
const LoginRouter = express.Router();
const LoginController = require('../controller/LoginController');

LoginRouter.post('/', LoginController.login);

module.exports = LoginRouter;
