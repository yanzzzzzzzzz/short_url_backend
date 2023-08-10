const express = require("express");
const cors = require("cors");
require("express-async-errors");
const app = express();
const UrlRouter = require("./controller/URLController");
const usersRouter = require("./controller/UsersController");
const loginRouter = require("./controller/LoginController");
const middleware = require("./utils/middleware");
const config = require("./utils/config");
const mongoose = require("mongoose");
app.use(cors());
mongoose
  .connect(config.MONGODB_URI)
  .then()
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

app.use(express.json());
app.use(middleware.requestLogger);
app.use(middleware.tokenExtractor);
app.use("/api/url", middleware.userExtractor, UrlRouter);
app.use("/api/users", usersRouter);
app.use("/api/login", loginRouter);
app.use(middleware.errorHandler);
app.use(middleware.unknownEndpoint);
module.exports = app;
