var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
mongoose.connect('localhost:27017/test');
var Schema = mongoose.Schema;

var userDataSchema = new Schema({
  proj_name: String,
  num_of_Tests: { type: String, default: 'N/A' },
  num_passed: { type: String, default: 'N/A' },
  num_failed: { type: String, default: 'N/A' },
  num_std: { type: String, default: 'N/A' },
  coverage: { type: String, default: 'N/A' },
  updated: { type: Date, default: Date.now() },
  sw_version: { type: String, default: 'N/A' },
  frequency: { type: String, default: 'N/A' },
  svn_url: String
}, { collection: 'projects'});

var projectData = mongoose.model('project', userDataSchema);

router.get('/', function (req, res, next) {
  projectData.find()
      .then(function(doc) {
        res.render('index', {projects: doc, 
          freqConv: [
            {"value": "On Commit"}, 
            {"value": "Daily"}, 
            {"value": "Weekly"}]});
      });
});

router.post('/addProject', function (req, res, next) {
  var item = {
    proj_name: req.body.name,
    num_of_Tests: 0,
    num_passed: 0,
    num_failed: 0,
    num_std: 0,
    coverage: 0,
    sw_version: 0,
    frequency: req.body.frequency,
    svn_url: req.body.url
  };

  var data = new projectData(item);
  data.save();

  res.redirect('/');
});

router.post('/updateProject', function (req, res, next) {
  var id = req.body.id;
  console.log(id);
  console.log(req.body.frequency);
  projectData.findById(id, function(err, doc) {
    if (err) {
      console.error('error, no entry found');
      return;
    }
    doc.proj_name = req.body.name;
    doc.frequency = req.body.frequency;
    doc.svn_url = req.body.url;
    doc.updated = Date.now();
    doc.save();
  })

  res.redirect('/');
});

module.exports = router;
