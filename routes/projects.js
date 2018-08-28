const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const ProjectData = require('../models/project');

router.get('/', (req, res, next) => {
  ProjectData.find()
    .exec()
    .then(docs => {
      console.log(docs);
      res.status(200).json(docs);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.post('/', (req, res, next) => {
  const ProjectData = new ProjectData({
    proj_name: req.body.name,
    num_of_Tests: 0,
    num_passed: 0,
    num_failed: 0,
    num_std: 0,
    coverage: 0,
    sw_version: 0,
    frequency: req.body.frequency,
    svn_url: req.body.url
  });
  ProjectData.save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: 'Handling POST requests to /Projects',
        createdProject: result
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.get('/:ProjectId', (req, res, next) => {
  const id = req.params.ProjectId;
  ProjectData.findById(id)
    .exec()
    .then(doc => {
      console.log('From database', doc);
      if (doc) {
        res.status(200).json(doc);
      } else {
        res
          .status(404)
          .json({ message: 'No valid entry found for provided ID' });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.patch('/:ProjectId', (req, res, next) => {
  const id = req.params.ProjectId;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  ProjectData.update({ _id: id }, { $set: updateOps })
    .exec()
    .then(result => {
      console.log(result);
      res.status(200).json(result);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.delete('/:ProjectId', (req, res, next) => {
  const id = req.params.ProjectId;
  ProjectData.remove({ _id: id })
    .exec()
    .then(result => {
      res.status(200).json(result);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

module.exports = router;
