const express = require("express");
const cors = require("cors");
require("express-async-errors");
const app = express();
const UrlRouter = require("./controller/URLController");
const usersRouter = require("./controller/UsersController");
const middleware = require("./utils/middleware");
const config = require("./utils/config");
const mongoose = require("mongoose");
app.use(cors());
mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

app.use(express.json());
app.use(middleware.requestLogger);
app.use("/api/url", UrlRouter);
app.use("/api/users", usersRouter);
app.use(middleware.errorHandler);
app.use(middleware.unknownEndpoint);
module.exports = app;
