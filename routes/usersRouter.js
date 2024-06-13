const express = require('express');
const usersRouter = express.Router();
const usersController = require('../controller/UsersController');

usersRouter.post('/', usersController.createUser);
usersRouter.get('/', usersController.getUser);
usersRouter.patch('/', usersController.updateUser);
usersRouter.delete('/', usersController.deleteUser);
module.exports = usersRouter;
