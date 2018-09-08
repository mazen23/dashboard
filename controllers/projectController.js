const ProjectData = require("../models/project");
const http = require("http");
const kue = require("kue");
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

  job.on("complete", function(result) {
    console.log("Job completed with data ", result);
  });
};

exports.project_generate = (req, res) => {
  var job = queue
    .create("Project Update", {
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

  job.on("complete", function(result) {
    console.log("Job completed with data ", result);
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
  const postData = JSON.stringify({
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
  });
  const optionsPost = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }
  };
  const optionsGet = {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  };

  const next = (error, result) => {
    if (error) done(error);
    else {
      const link = "http://cai1-sv00075:8080" + result._links.self.href;
      if (result.state === "QUEUED" || result.state === "RUNNING") {
        send_request(link, "", optionsGet, next);
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

queue.process("Report Generation", (job, done) => {
  const path =
    "http://cai1-sv00075:8080/blue/rest/organizations/jenkins/pipelines/GenerateProject/runs/";
  const postData = JSON.stringify({
    parameters: [
      {
        name: "PROJECT_NAME",
        value: job.data.projectName
      },
      {
        name: "JOB_ID",
        value: job.id
      },
      {
        name: "SVN_URL",
        value: job.data.svnUrl
      }
    ]
  });
  const optionsPost = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }
  };
  const optionsGet = {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  };

  const next = (error, result) => {
    if (error) done(error);
    else {
      const link = "http://cai1-sv00075:8080" + result._links.self.href;
      if (result.state === "QUEUED" || result.state === "RUNNING") {
        send_request(link, "", optionsGet, next);
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
  console.log("job data", job.data);

  const path =
    "http://cai1-sv00075:8080/blue/rest/organizations/jenkins/pipelines/RunProject/runs/";
  const postData = JSON.stringify({
    parameters: [
      {
        name: "PROJECT_NAME",
        value: job.data.title
      }
    ]
  });
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }
  };
  const request = http.request(path, options, response => {
    console.log("STATUS: " + response.statusCode);
    console.log("HEADERS: " + JSON.stringify(response.headers));

    response.setEncoding("utf8");
    let str = "";
    response.on("data", function(chunk) {
      str += chunk;
    });
    response.on("end", function() {
      console.log(`BODY: ${str}`);

      done();
    });
  });

  request.on("error", e => {
    console.error(`problem with request: ${e}`);

    done(e);
  });

  request.write(postData);

  request.end();
});

const send_request = (path, postData, options, next) => {
  const request = http.request(path, options, response => {
    response.setEncoding("utf8");
    let str = "";
    response.on("data", function(chunk) {
      str += chunk;
    });
    response.on("end", function() {
      next(null, JSON.parse(str));
    });
  });

  request.on("error", e => {
    next(e, null);
  });

  request.write(postData);

  request.end();
};
