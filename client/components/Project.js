import React from "react";
import axios from "axios";
import Chart from "./Chart";

class Project extends React.Component {
  state = {
    data: [],
    loading: true,
    jobs: []
  };
  componentDidMount() {
    this.setState({ loading: true });
    axios.get(`/api/projects/${this.props.projectId}`).then(response => {
      this.setState(
        {
          data: response.data,
          loading: false
        },
        this.updateJobs(response.data.proj_name)
      );
    });
  }

  updateJobs = name => {
    axios
      .get(`/kue-ui/job/search?q=${name}`, {
        headers: {
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8"
        }
      })
      .then(response => {
        axios
          .get(`/api/projects/jobs/[${response.data.toString()}]`)
          .then(resp => {
            console.log(resp);
            this.setState({ jobs: resp.data.jobs });
          });
      });
  };

  runProject = e => {
    axios
      .post(`/api/projects/run/${this.state.data.proj_name}`, {})
      .then(response => {
        console.log(response);
        this.updateJobs(this.state.data.proj_name);
      })
      .catch(error => {
        console.log(error);
      });
  };

  generateProject = e => {
    axios
      .post("/api/projects/generate", {
        ProjectName: this.state.data.proj_name,
        SvnUrl: this.state.data.svn_url
      })
      .then(response => {
        console.log(response);
        this.updateJobs(this.state.data.proj_name);
      })
      .catch(error => {
        console.log(error);
      });
  };

  render() {
    return this.state.loading ? (
      <section className="content">
        <div className="content-head">
          <h1 className="prim-color">LOADING ...</h1>
        </div>
      </section>
    ) : (
      <section className="content">
        <div className="content-head">
          <h1 className="prim-color">{this.state.data.proj_name}</h1>
          <div className="btn-holder">
            <button
              type="button"
              className="btn btn-large"
              onClick={this.generateProject}
            >
              Generate
            </button>
            <button
              type="button"
              className="btn btn-large btn-default"
              onClick={this.runProject}
            >
              Run
            </button>
          </div>
        </div>
        <div className="project-desc">
          <div>
            <div>Last Update : {this.state.data.updated}</div>
            <div>URL : {this.state.data.url}</div>
            <div>Frequency : {this.state.data.frequency}</div>
          </div>
          {this.state.data.report_id ? (
            <div className="row">
              <Chart
                title="Features"
                num={this.state.data.report_id.feat_num}
                numOk={this.state.data.report_id.feat_num_ok}
                numNok={this.state.data.report_id.feat_num_nok}
                numNp={this.state.data.report_id.feat_num_np}
              />
              <Chart
                title="Groups"
                num={this.state.data.report_id.grp_num}
                numOk={this.state.data.report_id.grp_num_ok}
                numNok={this.state.data.report_id.grp_num_nok}
                numNp={this.state.data.report_id.grp_num_np}
              />
              <Chart
                title="TestCase"
                num={this.state.data.report_id.num}
                numOk={this.state.data.report_id.num_ok}
                numNok={this.state.data.report_id.num_nok}
                numNp={this.state.data.report_id.num_np}
              />
            </div>
          ) : (
            <div className="row">
              <h2>No Report Exists</h2>
            </div>
          )}
        </div>
        <div className="desc-content">
          {this.state.jobs.map((job, index) => {
            return (
              <div className="job-content">
                <table className="meta">
                  <th>
                    <td>Title:</td>
                    <td>Type:</td>
                    <td>Type:</td>
                  </th>
                  <tr>
                    <td>
                      {job.state === "complete" ? (
                        <a
                          target="_blank"
                          href={`http://cai1-sv00075/castle/vis/vls/dashboard/${
                            this.state.data.proj_name
                          }/${job.id}/dashboard.html`}
                        >
                          complete
                        </a>
                      ) : job.state === "active" ? (
                        <span>active</span>
                      ) : job.state === "inactive" ? (
                        <span>inactive</span>
                      ) : (
                        <span>failed</span>
                      )}
                    </td>
                    <td>{job.type}</td>
                    <td>↻</td>
                  </tr>
                </table>
              </div>
            );
          })}
        </div>
      </section>
    );
  }
}

export default Project;
