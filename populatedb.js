#! /usr/bin/env node

console.log('This script populates some test books, projects, reports and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb://your_username:your_password@your_dabase_url');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
if (!userArgs[0].startsWith('mongodb://')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}

var async = require('async')
var ReportData = require('./models/report')
var ProjectData = require('./models/project')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

var reports = []
var projects = []

function projectCreate(proj_name, freq_id, svn_url, cb) {
  projectdetail = {proj_name:proj_name , freq_id: freq_id , svn_url: svn_url }
  
  var project = new ProjectData(projectdetail);
       
  project.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New project: ' + project);
    projects.push(project)
    cb(null, project)
  }  );
}

function reportCreate(project, num_of_Tests, num_passed, num_failed, num_std, coverage, sw_version, cb) {
  var report = new ReportData({ project_id: project._id, num_of_Tests: num_of_Tests, num_passed: num_passed, num_failed: num_failed, num_std: num_std, coverage: coverage, sw_version: sw_version });
       
  report.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New report: ' + report);
    reports.push(report)
    cb(null, report);
  }   );
}


function createprojects(cb) {
    async.parallel([
        function(callback) {
            projectCreate('Patrick', '0', '1973-06-06', callback);
          },function(callback) {
            projectCreate('Patrdsaick', '3', '1973-06-06', callback);
          },function(callback) {
            projectCreate('Patrdasdsick', '2', '1973-06-06', callback);
          },function(callback) {
            projectCreate('Patrdaick', '1', '1973-06-06', callback);
          },function(callback) {
            projectCreate('Patrick', '3', '1973-06-06', callback);
          },function(callback) {
            projectCreate('Patrick', '2', '1973-06-06', callback);
          },function(callback) {
            projectCreate('Patrick', '1', '1973-06-06', callback);
          },
        ],
        // optional callback
        cb);
}


function createreports(cb) {
    async.parallel([
        function(callback) {
            reportCreate(projects[0], '4', '0', '8', '4', '0', '8', callback);
          },
          function(callback) {
              reportCreate(projects[3], '4', '0', '8', '4', '0', '8', callback);
            },
            function(callback) {
                reportCreate(projects[2], '4', '0', '8', '4', '0', '8', callback);
              },
              function(callback) {
                  reportCreate(projects[1], '4', '0', '8', '4', '0', '8', callback);
                },
                function(callback) {
                    reportCreate(projects[4], '4', '0', '8', '4', '0', '8', callback);
                  },
                  function(callback) {
                      reportCreate(projects[0], '4', '0', '8', '4', '0', '8', callback);
                    }
        ],
        // optional callback
        cb);
}

async.series([
    createprojects,
    createreports
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});



