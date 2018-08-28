var ProjectData = require('../models/project');

exports.project_list = function (req, res) {
    ProjectData.find()
        .exec()
        .then(docs => {
            res.status(200).json(docs);
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
    const ProjectData = new ProjectData({
        proj_name: req.body.name,
        freq_id: req.body.freq_id,
        svn_url: req.body.url
    });
    ProjectData.save()
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