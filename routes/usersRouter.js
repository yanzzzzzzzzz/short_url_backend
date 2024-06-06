const express = require('express');
const usersRouter = express.Router();
const usersController = require('../controller/UsersController');

usersRouter.post('/', usersController.createUser);
usersRouter.get('/:username', usersController.getUser);

module.exports = usersRouter;
