const ProjectData = require('../models/project');
const http = require('http');
const querystring = require('querystring');
const kue = require("kue");
const queue = kue.createQueue();

exports.project_list = function (req, res) {
    ProjectData.find().sort({ _id: -1 })
        .exec()
        .then(docs => {
            res.status(200).json({
                "draw": 1,
                "recordsTotal": docs.length,
                "recordsFiltered": docs.length,
                "data": docs
            }
            );
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};

exports.project_detail = function (req, res) {
    const id = req.params.ProjectId;
    ProjectData.findById(id)
        .exec()
        .then(doc => {
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
};

exports.project_create = function (req, res) {
    const Project = new ProjectData({
        proj_name: req.body.name,
        freq_id: req.body.freq_id,
        svn_url: req.body.url
    });
    Project.save()
        .then(result => {
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
};

exports.project_patch = function (req, res) {
    const id = req.params.ProjectId;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    ProjectData.update({ _id: id }, { $set: updateOps })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Project updated',
                url: 'http://localhost:3000/api/projects/' + id
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};

exports.project_delete = function (req, res) {
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
        .create("Report Generation", {
            title: req.params.ProjectName
        })
        .save(function (err) {
            if (err) {
                res.status(500).json({
                    error: err
                });
            } else {
                console.log(job.id);
            }
        });

        job.on('complete', function (result) {
            console.log('Job completed with data ', result);
    
        }).on('failed attempt', function (errorMessage, doneAttempts) {
            console.log('Job failed');
    
        }).on('failed', function (errorMessage) {
            console.log('Job failed');
    
        }).on('progress', function (progress, data) {
            console.log('\r  job #' + job.id + ' ' + progress + '% complete with data ', data);
            
        });
        res.send(200);
};

exports.project_generate = (req, res) => {
    const name = req.params.ProjectName;
    const path = 'http://cai1-sv00075:8080/job/GenerateProject/buildWithParameters';
    const postData = querystring.stringify({
        token: 'dashboardToken',
        PROJECT_NAME: name
    });
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
        }
    };
    const request = http.request(path, options, (response) => {
        console.log('STATUS: ' + response.statusCode);
        console.log('HEADERS: ' + JSON.stringify(response.headers));

        let str = '';
        response.on('data', function (chunk) {
            str += chunk;
        });
        response.on('end', function () {
            res.status(200).json({
                statusbo: "sucess"
            });
        });
    });

    request.on('error', (e) => {
        console.error(`problem with request: ${e}`);
        res.status(500).json({
            error: e
        });
    });

    request.write(postData);

    request.end();
};

queue.process("Report Generation", (job, done) => {
    console.log('job data', job.data);
    // Do your task here

    
    const name = job.data.title;
    const path = 'http://cai1-sv00075:8080/job/GenerateProject/buildWithParameters';
    const postData = querystring.stringify({
        token: 'dashboardToken',
        PROJECT_NAME: name
    });
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
        }
    };
    const request = http.request(path, options, (response) => {
        console.log('STATUS: ' + response.statusCode);
        console.log('HEADERS: ' + JSON.stringify(response.headers));

        let str = '';
        response.on('data', function (chunk) {
            str += chunk;
        });
        response.on('end', function () {
            console.log("hello world " + str);

            done();
        });
    });

    request.on('error', (e) => {
        console.error(`problem with request: ${e}`);
        
        done(e);
    });

    request.write(postData);

    request.end();
});

queue.on('job enqueue', function (id, type) {
    console.log('Job %s got queued of type %s', id, type);

}).on('job complete', function (id, result) {
    kue.Job.get(id, function (err, job) {
        console.log('Job %s got completed ', id);
    });
});