const mongoose = require('mongoose');

const projectSchema = mongoose.Schema(
  {
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
  },
  { collection: 'projects' }
);

module.exports = mongoose.model('Project', projectSchema);
