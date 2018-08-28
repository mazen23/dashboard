const express = require('express');
const router = express.Router();

router.get('/projects', function(req, res, next) {
  res.render('index');
});

router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/projects/:projecyId', function(req, res, next) {
  res.render('index');
  //todo
});

module.exports = router;
