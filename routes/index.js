const express = require('express');
const router = express.Router();

const ProjectData = require('../models/project')

router.get('/projects', function (req, res, next) {
  ProjectData.find()
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
  ProjectData.findById(req.params.projectId, (err, project) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: err });
    }
    res.render('project', {project :project});
  });
});

module.exports = router;
