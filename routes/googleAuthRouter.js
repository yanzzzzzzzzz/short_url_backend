const express = require('express');
const googleAuthRouter = express.Router();
const googleAuthController = require('../controller/GoogleAuthController');

googleAuthRouter.get('/auth', googleAuthController.auth);

module.exports = googleAuthRouter;
