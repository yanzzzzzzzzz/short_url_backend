const express = require('express');
const usersRouter = express.Router();
const usersController = require('../controller/UsersController');

usersRouter.post('/', usersController.createUser);
usersRouter.get('/', usersController.getUser);
usersRouter.patch('/', usersController.updateUser);
module.exports = usersRouter;
