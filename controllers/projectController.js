const ProjectData = require("../models/project");
const ReportData = require("../models/report");
const kue = require("kue");
import axios from "axios";
const util = require("util");
const parseString = require("xml2js").parseString;
const queue = kue.createQueue({ disableSearch: false });

exports.project_list = (req, res) => {
  ProjectData.find()
    .populate("report_id")
    .sort({ _id: -1 })
    .exec()
    .then(docs => {
      res.status(200).json({
        draw: 1,
        recordsTotal: docs.length,
        recordsFiltered: docs.length,
        data: docs
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

exports.project_detail = (req, res) => {
  const id = req.params.ProjectId;
  ProjectData.findById(id)
    .populate("report_id")
    .exec()
    .then(doc => {
      if (doc) {
        res.status(200).json(doc);
      } else {
        res
          .status(404)
          .json({ message: "No valid entry found for provided ID" });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};

exports.project_create = (req, res) => {
  const Project = new ProjectData({
    proj_name: req.body.name,
    freq_id: req.body.freq_id,
    svn_url: req.body.url
  });
  Project.save()
    .then(result => {
      res.status(201).json({
        message: "Handling POST requests to /Projects",
        createdProject: result
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

exports.project_report_add = (req, res) => {
  console.log("report body " + req.body);
  const report = new ReportData(req.body);
  report
    .save()
    .then(result => {
      console.log("report body " + result);

      const id = req.params.ProjectId;
      const updateOps = {};
      updateOps["report_id"] = result._id;
      ProjectData.update({ _id: id }, { $set: updateOps })
        .exec()
        .then(result2 => {
          res.status(200).json({
            message: "report added to project",
            url: "http://localhost:3000/api/projects/" + id,
            createdReport: result
          });
        })
        .catch(err => {
          console.log(err);
          res.status(500).json({
            error: err
          });
        });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

exports.project_patch = (req, res) => {
  const id = req.params.ProjectId;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  ProjectData.update({ _id: id }, { $set: updateOps })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "Project updated",
        url: "http://localhost:3000/api/projects/" + id
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

exports.project_delete = (req, res) => {
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
};

exports.project_run = (req, res) => {
  var job = queue
    .create("Run Project", {
      title: req.params.ProjectName
    })
    .searchKeys(["title"])
    .save(function(err) {
      if (err) {
        res.status(500).json({
          error: err
        });
      } else {
        res.status(200).json({ job: job.id });
      }
    });
};

exports.project_generate = (req, res) => {
  var job = queue
    .create("Report Generation", {
      projectName: req.body.ProjectName,
      svnUrl: req.body.SvnUrl
    })
    .searchKeys(["projectName"])
    .save(function(err) {
      if (err) {
        res.status(500).json({
          error: err
        });
      } else {
        res.status(200).json({ job: job.id });
      }
    });
};

exports.project_update = (req, res) => {
  var job = queue
    .create("Project Update", {
      projectName: req.body.ProjectName,
      svnUrl: req.body.SvnUrl,
      projectId: req.body.ProjectId
    })
    .searchKeys(["projectName"])
    .save(function(err) {
      if (err) {
        res.status(500).json({
          error: err
        });
      } else {
        res.status(200).json({ job: job.id });
      }
    });
};

exports.project_job_list = (req, res) => {
  const arr = JSON.parse(req.params.JobIdList);
  let JobIdList = [];
  arr.forEach((id, index) => {
    kue.Job.get(id, (err, job) => {
      JobIdList.push(job);
      if (JobIdList.length === arr.length)
        res.status(200).json({ jobs: JobIdList });
    });
  });
};

exports.project_job = (req, res) => {
  kue.Job.get(req.params.JobId, (err, job) => {
    res.status(200).json({ job: job });
  });
};

queue.process("Project Update", (job, done) => {
  const path =
    "http://cai1-sv00075:8080/blue/rest/organizations/jenkins/pipelines/UpdateProject/runs/";
  const postData = {
    parameters: [
      {
        name: "PROJECT_NAME",
        value: job.data.projectName
      },
      {
        name: "SVN_URL",
        value: job.data.svnUrl
      }
    ]
  };
  const optionsPost = "post";
  const optionsGet = "get";

  const next = (error, result) => {
    if (error) done(error);
    else {
      const link = "http://cai1-sv00075:8080" + result._links.self.href;
      if (result.state === "QUEUED" || result.state === "RUNNING") {
        send_request(link, {}, optionsGet, next);
      } else if (result.state === "FINISHED") {
        if (result.result === "FAILURE")
          done({ error: `JENKINS JOB ${result.id} FAILED` }, result);
        else {
          console.log(result);
          axios
            .get(
              `http://cai1-sv00075:8080/job/UpdateProject/${
                result.id
              }/artifact/reports/test_report.xml`
            )
            .then(function(response) {
              parseString(response.data, function(err, res) {
                console.log(util.inspect(res, false, null));
                update_stats(job.data.projectId, res);
                done(null, result);
              });
            })
            .catch(error => {
              done(error);
            });
        }
      } else {
        done({ error: "undefined state" });
      }
    }
  };
  send_request(path, postData, optionsPost, next);
});

queue.process("Report Generation", (job, done) => {
  const path =
    "http://cai1-sv00075:8080/blue/rest/organizations/jenkins/pipelines/GenerateProject/runs/";
  const postData = {
    parameters: [
      {
        name: "PROJECT_NAME",
        value: job.data.projectName
      },
      {
        name: "SVN_URL",
        value: job.data.svnUrl
      },
      {
        name: "JOB_ID",
        value: job.id
      }
    ]
  };
  const optionsPost = "post";
  const optionsGet = "get";

  const next = (error, result) => {
    if (error) {
      done(error);
    } else {
      const link = "http://cai1-sv00075:8080" + result._links.self.href;
      if (result.state === "QUEUED" || result.state === "RUNNING") {
        send_request(link, {}, optionsGet, next);
      } else if (result.state === "FINISHED") {
        if (result.result === "FAILURE")
          done({ error: `JENKINS JOB ${result.id} FAILED` }, result);
        else done(null, result);
      } else {
        done({ error: "undefined state" });
      }
    }
  };
  send_request(path, postData, optionsPost, next);
});

queue.process("Run Project", (job, done) => {
  done();
});

const send_request = (path, postData, options, next) => {
  axios({
    method: options,
    url: path,
    data: postData
  })
    .then(response => {
      next(null, response.data);
    })
    .catch(error => {
      next(error, null);
    });
};

const update_stats = (projectId, res) => {
  let postData = {
    num:
      res.ProjectType.Statistics[0].TestCasesStatistics[0].NumberTestCases[0],
    num_ok:
      res.ProjectType.Statistics[0].TestCasesStatistics[0].NumberOkTestCases[0],
    num_nok:
      res.ProjectType.Statistics[0].TestCasesStatistics[0]
        .NumberNokTestCases[0],
    num_ok_perc:
      res.ProjectType.Statistics[0].TestCasesStatistics[0].OkPercentage[0],
    num_nok_perc:
      res.ProjectType.Statistics[0].TestCasesStatistics[0].NokPercentage[0],
    grp_num:
      res.ProjectType.Statistics[0].TestGroupStatistics[0].NumberGroups[0],
    grp_num_ok:
      res.ProjectType.Statistics[0].TestGroupStatistics[0]
        .NumberOkTestGroups[0],
    grp_num_nok:
      res.ProjectType.Statistics[0].TestGroupStatistics[0]
        .NumberNokTestGroups[0],
    grp_num_ok_perc:
      res.ProjectType.Statistics[0].TestGroupStatistics[0].OkPercentage[0],
    grp_num_nok_perc:
      res.ProjectType.Statistics[0].TestGroupStatistics[0].NokPercentage[0],
    feat_num:
      res.ProjectType.Statistics[0].FeatureStatistics[0].NumberFeatures[0],
    feat_num_ok:
      res.ProjectType.Statistics[0].FeatureStatistics[0].NumberOkFeatures[0],
    feat_num_nok:
      res.ProjectType.Statistics[0].FeatureStatistics[0].NumberNokFeatures[0],
    feat_num_ok_perc:
      res.ProjectType.Statistics[0].FeatureStatistics[0].OkPercentage[0],
    feat_num_nok_perc:
      res.ProjectType.Statistics[0].FeatureStatistics[0].NokPercentage[0]
  };

  try {
    postData.feat_num_np_perc =
      res.ProjectType.Statistics[0].FeatureStatistics[0].NPPercentage[0];
    postData.feat_num_np =
      res.ProjectType.Statistics[0].FeatureStatistics[0].NumberNPFeatures[0];
    postData.grp_num_np_perc =
      res.ProjectType.Statistics[0].TestGroupStatistics[0].nPPercentage[0];
    postData.grp_num_np =
      res.ProjectType.Statistics[0].TestGroupStatistics[0].NumberNPTestGroups[0];
    postData.num_np_perc =
      res.ProjectType.Statistics[0].TestCasesStatistics[0].NPPercentage[0];
    postData.num_std =
      res.ProjectType.Statistics[0].TestCasesStatistics[0].NumberStdTests[0];
    postData.num_emp_def =
      res.ProjectType.Statistics[0].TestCasesStatistics[0].NumberEmptyDefects[0];
    postData.num_np =
      res.ProjectType.Statistics[0].TestCasesStatistics[0].NumberNPTestCases[0];
  } catch (err) {
    console.log("old xml doesnt contain forms");
  }

  axios
    .post(`http://localhost:3000/api/projects/report/${projectId}`, postData)
    .then(response => {
      console.log("update report succes" + response);
    })
    .catch(error => {
      console.log("update report failed" + error);
    });
};
