const express = require('express');
const cors = require('cors');
require('express-async-errors');
const app = express();
const urlRouter = require('./routes/urlRouter');
const usersRouter = require('./routes/usersRouter');
const loginRouter = require('./routes/loginRouter');
const googleAuthRouter = require('./routes/googleAuthRouter');
const logoutRouter = require('./routes/logoutRouter');
const middleware = require('./utils/middleware');
const config = require('./utils/config');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const cookieParser = require('cookie-parser');
app.use(cors());
app.use(cookieParser());
const swaggerDocument = YAML.load('./swagger.yaml');

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    console.log('Connected to my DB');
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message);
  });

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express.json());
app.use(middleware.requestLogger);
app.use(middleware.tokenExtractor);
app.use('/api/url', middleware.userExtractor, urlRouter);
app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);
app.use('/api/sessions/oauth/google', googleAuthRouter);
app.use('/api/logout', logoutRouter);
app.use(middleware.errorHandler);
app.use(middleware.unknownEndpoint);
module.exports = app;
