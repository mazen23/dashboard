const mongoose = require('mongoose');

const projectSchema = mongoose.Schema(
  {
    proj_name: { type: String, required: true },
    updated: { type: Date, default: Date.now() },
    freq_id: { type: Number, min: 0, max: 3, required: true },
    svn_url: { type: String, required: true }
  },
  {
    collection: 'projects', toObject: { virtuals: true } , toJSON: { virtuals: true }
  }
);

projectSchema.virtual('frequency').get(function () {
  const freqs = ['Manual', 'OnCommit', 'Daily', 'Weekly'];
  return freqs[this.freq_id];
});

projectSchema.virtual('url_api').get(function () {
  return 'http://localhost:3000/api/projects/' + this._id;
});

projectSchema.virtual('url').get(function () {
  return 'http://localhost:3000/projects/' + this._id;
});

module.exports = mongoose.model('Project', projectSchema);
