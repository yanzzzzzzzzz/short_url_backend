const express = require('express');
const UsersRouter = express.Router();
const UsersController = require('../controller/UsersController');

UsersRouter.post('/', UsersController.createUser);
UsersRouter.get('/', UsersController.getUserCreateUrls);
UsersRouter.get('/:username', UsersController.getUser);

module.exports = UsersRouter;
