const createError = require('http-errors');
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const hbs = require('express-handlebars');
const mongoose = require('mongoose');
const kue = require("kue");

const indexRouter = require('./routes/index');
const projectsRouter = require('./routes/projects');
const reportsRouter = require('./routes/reports');

const app = express();

mongoose.connect(
  'mongodb://localhost:27017/test',
  { useNewUrlParser: true },
  error => {
    if (error) console.error(error);
  }
);

app.engine(
  'hbs',
  hbs({
    extname: 'hbs',
    defaultLayout: 'layout',
    layoutsDir: __dirname + '/views/'
  })
);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/reports', reportsRouter);
app.use("/kue-ui", kue.app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.json({
    message: err.message
  });
});

module.exports = app;
