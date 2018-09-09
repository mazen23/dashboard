import React from "react";
import axios from "axios";
import Chart from "./Chart";
import prettyMs from "pretty-ms";
import datetime from "node-datetime";

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
        this.startPolling(response.data.proj_name)
      );
    });
  }

  startPolling = projName => {
    this.updateJobs(projName);
    this.timer = setInterval(() => this.updateJobs(projName), 1000);
  };

  componentWillUnmount() {
    this.timer = null;
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
            this.setState({ jobs: resp.data.jobs });
          });
      });
  };

  runProject = e => {
    axios
      .post(`/api/projects/run/${this.state.data.proj_name}`, {})
      .then(response => {
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
        this.updateJobs(this.state.data.proj_name);
      })
      .catch(error => {
        console.log(error);
      });
  };

  updateProject = e => {
    axios
      .post("/api/projects/update", {
        ProjectName: this.state.data.proj_name,
        SvnUrl: this.state.data.svn_url,
        ProjectId: this.state.data._id
      })
      .then(response => {
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
          <div>
            <h1 className="prim-color text-uppercase title_link">
              {this.state.data.proj_name}
            </h1>
            {this.state.data.report_id ? (
              <a
                target="_blank"
                href={`http://cai1-sv00075/castle/vis/vls/dashboard/${
                  this.state.data.proj_name
                }/original/dashboard.html`}
              >
                <i class="fas fa-link text-sucess fa-2x" />
              </a>
            ) : null}
          </div>
          <div class="btn-group" role="group" aria-label="Basic example">
            <button
              type="button"
              class="btn btn-success"
              onClick={this.updateProject}
            >
              Update
            </button>
            <button
              type="button"
              class="btn btn-success"
              onClick={this.generateProject}
            >
              Generate
            </button>
            <button
              type="button"
              class="btn btn-success"
              onClick={this.runProject}
            >
              Run
            </button>
          </div>
        </div>

        {this.state.data.report_id ? (
          <div className="project-desc">
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
          </div>
        ) : null}
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="thead-light">
              <tr>
                <th scope="col" className="fit">
                  status
                </th>
                <th scope="col">RUN</th>
                <th scope="col">TYPE</th>
                <th scope="col">COMPLETED</th>
                <th scope="col">DURATION</th>
                <th scope="col" className="fit" />
              </tr>
            </thead>
            <tbody>
              {this.state.jobs.map((job, index) => {
                console.log(job);
                return (
                  <tr>
                    <th scope="row" className="fit">
                      {job.state === "complete" ? (
                        <i class="fas fa-check-circle text-success fa-2x" />
                      ) : job.state === "active" ? (
                        <i class="fas fa-spinner fa-pulse fa-2x fa-fw  text-info" />
                      ) : job.state === "inactive" ? (
                        <i class="fas fa-minus-circle text-secondary fa-2x" />
                      ) : (
                        <i class="fas fa-times-circle text-danger fa-2x" />
                      )}
                    </th>
                    <td>{job.id}</td>
                    <td>{job.type}</td>
                    <td>{new Date(+job.updated_at).toDateString}</td>
                    <td>
                      {job.state === "complete"
                        ? prettyMs(+job.duration)
                        : "..."}
                    </td>
                    <td className="fit">
                      {job.state === "complete" ? (
                        <a
                          target="_blank"
                          href={`http://cai1-sv00075/castle/vis/vls/dashboard/${
                            this.state.data.proj_name
                          }/${
                            job.type === "Project Update" ? "original" : job.id
                          }/dashboard.html`}
                        >
                          <i class="fas fa-file-alt text-primary fa-2x" />
                        </a>
                      ) : (
                        <i class="fas fa-file-alt text-muted fa-2x" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    );
  }
}

export default Project;
