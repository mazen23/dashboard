import React from "react";
import ReactTable from "react-table";
import { Link } from "@reach/router";
import axios from "axios";
import Chart from "./Chart";

class Projects extends React.Component {
  constructor() {
    super();
    this.state = {
      data: [],
      loading: true
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
  render() {
    const { data, loading } = this.state;
    return (
      <section className="content">
        <div className="content-head left-content">
          <button
            type="button"
            className="btn btn-large"
            data-toggle="modal"
            data-target="#addProjectModal"
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
                Header: "Tests Status",
                accessor: "status",
                Cell: row => {
                  return row.original.report_id ? (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        backgroundColor: "#dadada",
                        borderRadius: "2px"
                      }}
                    >
                      <div
                        style={{
                          display: "inline-block",
                          width: `${row.original.report_id.num_ok_perc}%`,
                          height: "100%",
                          backgroundColor: "#00ff00",
                          borderRadius: "2px",
                          transition: "all .2s ease-out"
                        }}
                      />
                      <div
                        style={{
                          display: "inline-block",
                          width: `${row.original.report_id.num_nok_perc}%`,
                          height: "100%",
                          backgroundColor: "#ff0000",
                          borderRadius: "2px",
                          transition: "all .2s ease-out"
                        }}
                      />
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
      </section>
    );
  }
}

export default Projects;
