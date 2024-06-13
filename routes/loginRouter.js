const express = require('express');
const loginRouter = express.Router();
const loginController = require('../controller/LoginController');

loginRouter.post('/', loginController.login);
loginRouter.get('/authentication', loginController.authentication);

module.exports = loginRouter;
