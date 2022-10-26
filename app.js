const config = require("./utils/config");
const express = require("express");
require('express-async-errors')
const app = express();
const cors = require("cors");
const blogsRouter = require("./controllers/blogs");
const usersRouter = require('./controllers/users')
const middleware = require("./utils/middleware");
const logger = require("./utils/logger");
const mongoose = require("mongoose");

logger.info("connecting to", config.MONGODB_URI);

const mongoUrl = config.MONGODB_URI;
mongoose
    .connect(mongoUrl)
    .then((result) => {
        console.log("connected!");
    })
    .catch((err) => logger.error(err));

app.use(cors());
app.use(express.json());
app.use(middleware.requestLogger);

app.use("/api/blogs", blogsRouter);
app.use('/api/users', usersRouter)

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
