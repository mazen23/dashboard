const mongoose = require('mongoose');

const reportSchema = mongoose.Schema(
    {
        num_of_Tests: { type: Number, required: true },
        num_passed: { type: Number, required: true },
        num_failed: { type: Number, required: true },
        num_std: { type: Number, required: true },
        coverage: { type: Number, required: true },
        sw_version: { type: Number, required: true },
        project_id: { type: mongoose.Schema.Types.ObjectId, ref: 'project' }
    },
    {
        collection: 'reports', toObject: { virtuals: true }, toJSON: { virtuals: true }
    }
);

reportSchema.virtual('url').get(function () {
    return 'http://localhost:3000/api/reports/' + this._id;
});

reportSchema.virtual('project_url').get(function () {
    return 'http://localhost:3000/api/projects/' + this.project_id;
});

module.exports = mongoose.model('Report', reportSchema);
