const express = require('express');
const router = express.Router();

const projectData = require('../models/project')

router.get('/projects', function (req, res, next) {
  projectData.find()
    .then(function (doc) {
      res.render('index', { projects: doc })
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.get('/', function (req, res, next) {
  res.redirect('/projects');
});

router.get('/projects/:projectId', function (req, res, next) {
  res.render('/projects/' + projectId);
  //todo
});

module.exports = router;
