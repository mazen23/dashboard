import React from "react";
import ReactTable from "react-table";
import { Link } from "@reach/router";
import axios from "axios";
import Chart from "./Chart";
import Modal from "./Modal";

class Projects extends React.Component {
  constructor() {
    super();
    this.state = {
      data: [],
      loading: true,
      showModal: false
    };
  }
  componentDidMount() {
    this.setState({ loading: true });
    axios.get("/api/projects").then(response => {
      this.setState({
        data: response.data.data,
        loading: false
      });
    });
  }

  toggleModal = () => this.setState({ showModal: !this.state.showModal });
  render() {
    const { data, loading, showModal } = this.state;
    return (
      <section className="content">
        <div className="content-head left-content">
          <button
            type="button"
            className="btn btn-large"
            onClick={this.toggleModal}
          >
            Add Project
          </button>
        </div>
        <div className="table-responsive">
          <ReactTable
            data={data}
            columns={[
              {
                Header: "Project",
                accessor: "proj_name",
                Cell: row => (
                  <Link
                    to={`/projects/${row.original._id}`}
                    className="project_name"
                  >
                    <span>
                      <span
                        style={{
                          color: "#57d500",
                          transition: "all .3s ease"
                        }}
                      >
                        &#x25cf;&nbsp;&nbsp;
                      </span>
                      {row.value}
                    </span>
                  </Link>
                )
              },
              {
                Header: "Last Update",
                accessor: "updated"
              },
              {
                Header: "Report Status",
                accessor: "status",
                Cell: row => {
                  return row.original.report_id ? (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        backgroundColor: "#dadada",
                        display: "flex"
                      }}
                      title={{${row.original.report_id.num_ok_perc}%}}
                    >
                      <div
                        style={{
                          display: "inline-block",
                          width: `${row.original.report_id.num_ok_perc}%`,
                          height: "100%",
                          backgroundColor: "#1add1a",
                          transition: "all .2s ease-out"
                        }}
                        className="hover_show"
                      >
                        <p className="hover_show_content">
                          {row.original.report_id.num_ok_perc}%
                        </p>
                      </div>
                      <div
                        style={{
                          display: "inline-block",
                          width: `${row.original.report_id.num_nok_perc}%`,
                          height: "100%",
                          backgroundColor: "#dd1a1a",
                          transition: "all .2s ease-out"
                        }}
                        className="hover_show"
                      >
                        <p className="hover_show_content">
                          {row.original.report_id.num_nok_perc}%
                        </p>
                      </div>
                      <div
                        style={{
                          display: "inline-block",
                          width: `${row.original.report_id.num_np_perc}%`,
                          height: "100%",
                          backgroundColor: "#dadada",
                          transition: "all .2s ease-out"
                        }}
                        className="hover_show"
                      >
                        <p className="hover_show_content">
                          {row.original.report_id.num_nok_perc}%
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        backgroundColor: "#dadada",
                        borderRadius: "2px"
                      }}
                    />
                  );
                }
              },
              {
                Header: "Frequency",
                accessor: "freq_id",
                Cell: ({ value }) =>
                  value == 0 ? "Manual" : value == 1 ? "Daily" : "Weekly",
                filterMethod: (filter, row) => {
                  if (filter.value === "all") {
                    return true;
                  } else if (filter.value === "manual") {
                    return row[filter.id] == 0;
                  } else if (filter.value === "daily") {
                    return row[filter.id] == 1;
                  }
                  return row[filter.id] == 2;
                },
                Filter: ({ filter, onChange }) => (
                  <select
                    onChange={event => onChange(event.target.value)}
                    style={{ width: "100%" }}
                    value={filter ? filter.value : "all"}
                  >
                    <option value="all">Show All</option>
                    <option value="manual">Manual</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                )
              },
              {
                Header: "URL",
                accessor: "svn_url"
              }
            ]}
            loading={loading}
            filterable
            className="-striped -highlight"
            SubComponent={row => {
              return row.original.report_id ? (
                <div className="row">
                  <Chart
                    title="Features"
                    num={row.original.report_id.feat_num}
                    numOk={row.original.report_id.feat_num_ok}
                    numNok={row.original.report_id.feat_num_nok}
                    numNp={row.original.report_id.feat_num_np}
                  />
                  <Chart
                    title="Groups"
                    num={row.original.report_id.grp_num}
                    numOk={row.original.report_id.grp_num_ok}
                    numNok={row.original.report_id.grp_num_nok}
                    numNp={row.original.report_id.grp_num_np}
                  />
                  <Chart
                    title="TestCase"
                    num={row.original.report_id.num}
                    numOk={row.original.report_id.num_ok}
                    numNok={row.original.report_id.num_nok}
                    numNp={row.original.report_id.num_np}
                  />
                </div>
              ) : (
                <div className="row">
                  <h2>No Report Exists</h2>
                </div>
              );
            }}
          />
        </div>
        {showModal ? (
          <Modal>
            <form action="/api/projects/" method="post" id="addProjectForm">
              <div>
                <h4>Add Project</h4>
                <button type="button" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div>
                <div>
                  <input
                    type="text"
                    placeholder="Enter project name"
                    name="name"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Enter project url"
                    name="url"
                  />
                </div>

                <div>
                  <div>
                    <select name="freq_id">
                      <option value="0">Manual</option>
                      <option value="1">On Commit</option>
                      <option value="2">Daily</option>
                      <option value="3">Weekly</option>
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <button type="btn" data-dismiss="modal">
                  Close
                </button>
                <button>
                  Sumbit <i />
                </button>
              </div>
            </form>
          </Modal>
        ) : null}
      </section>
    );
  }
}

export default Projects;
