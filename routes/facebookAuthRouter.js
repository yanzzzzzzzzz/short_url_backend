const express = require('express');
const facebookAuthRouter = express.Router();
const facebookAuthController = require('../controller/FacebookAuthController');

facebookAuthRouter.get('/auth', facebookAuthController.auth);
facebookAuthRouter.get('/callback', facebookAuthController.callback);

module.exports = facebookAuthRouter;
