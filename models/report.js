const mongoose = require("mongoose");

const reportSchema = mongoose.Schema(
  {
    num: { type: Number, required: true },
    num_ok: { type: Number, required: true },
    num_nok: { type: Number, required: true },
    num_np: { type: Number, required: true },
    num_ok_perc: { type: Number, required: true },
    num_nok_perc: { type: Number, required: true },
    num_np_perc: { type: Number, required: true },
    num_std: { type: Number, required: true },
    num_emp_def: { type: Number, required: true },
    grp_num: { type: Number, required: true },
    grp_num_ok: { type: Number, required: true },
    grp_num_nok: { type: Number, required: true },
    grp_num_np: { type: Number, required: true },
    grp_num_ok_perc: { type: Number, required: true },
    grp_num_nok_perc: { type: Number, required: true },
    grp_num_np_perc: { type: Number, required: true },
    feat_num: { type: Number, required: true },
    feat_num_ok: { type: Number, required: true },
    feat_num_nok: { type: Number, required: true },
    feat_num_np: { type: Number, required: true },
    feat_num_ok_perc: { type: Number, required: true },
    feat_num_nok_perc: { type: Number, required: true },
    feat_num_np_perc: { type: Number, required: true }
  },

  {
    collection: "reports",
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  }
);

reportSchema.virtual("url_api").get(function() {
  return "http://localhost:3000/api/reports/" + this._id;
});

module.exports = mongoose.model("Report", reportSchema);
