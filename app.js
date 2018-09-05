import createError from "http-errors";
import express from "express";
import path from "path";
import favicon from "serve-favicon";
import cookieParser from "cookie-parser";
import logger from "morgan";
import mongoose from "mongoose";
import kue from "kue";

import projectsRouter from "./routes/projects";
import reportsRouter from "./routes/reports";
import indexRouter from "./routes/index";

const app = express();

mongoose.connect(
  "mongodb://localhost:27017/test",
  { useNewUrlParser: true },
  error => {
    if (error) console.error(error);
  }
);

app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "dist")));

app.use("/", indexRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/reports", reportsRouter);
app.use("/kue-ui", kue.app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.json({
    message: err.message
  });
});

module.exports = app;
