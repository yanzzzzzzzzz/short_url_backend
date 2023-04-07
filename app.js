const express = require("express");
const cors = require("cors");
const app = express();
const UrlRouter = require("./controller/URLController");

app.use(cors());
app.use(express.json());

app.use("/api/url", UrlRouter);
module.exports = app;
