var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  var objects = {projects: [{
    "proj_name":"John",
    "num_of_Tests":30,
    "num_passed":5,
    "num_failed":5,
    "num_std":5,
    "coverage":5,
    "update_data":5,
    "refresh_date":5,
    "sw_version":5,
    "svn_url":"url svn mother fuker"
    },
    {
      "proj_name":"John",
      "num_of_Tests":30,
      "num_passed":5,
      "num_failed":5,
      "num_std":5,
      "coverage":5,
      "update_data":5,
      "refresh_date":5,
      "sw_version":5,
      "svn_url":"url svn mother fuker"
      },
      {
        "proj_name":"John",
        "num_of_Tests":30,
        "num_passed":5,
        "num_failed":5,
        "num_std":5,
        "coverage":5,
        "update_data":5,
        "refresh_date":5,
        "sw_version":5,
        "svn_url":"url svn mother fuker"
        }]};
  res.render('index', objects);
});

module.exports = router;
