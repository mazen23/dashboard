import React from "react";
import axios from "axios";
import Chart from "./Chart";

class Project extends React.Component {
  state = {
    data: [],
    loading: true
  };
  componentDidMount() {
    this.setState({ loading: true });
    axios.get(`/api/projects/${this.props.projectId}`).then(response => {
      console.log(response.data);
      this.setState({
        data: response.data,
        loading: false
      });
    });
  }

  runProject = e => {
    axios
      .post(`/api/projects/run/${this.state.data.proj_name}`, {})
      .then(response => {
        console.log(response);
      })
      .catch(error => {
        console.log(error);
      });
  };

  generateProject = e => {
    axios
      .post(`/api/projects/generate/${this.state.data.proj_name}`, {})
      .then(response => {
        console.log(response);
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
      </section>
    );
  }
}

export default Project;
