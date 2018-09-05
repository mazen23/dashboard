import React from "react";
import { Router, Link } from "@reach/router";
import Projects from "./Projects";
import Project from "./Project";

class App extends React.Component {
  render() {
    return (
      <div className="wrapper">
        <section className="head prim-color">
          <Link to="/" className="title">
            Castle Dashboard
          </Link>
        </section>

        <Router>
          <Projects path="/" />
          <Projects path="/projects" />
          <Project path="/projects/:projectId" />
        </Router>

        <section className="footer">
          <p>
            <strong>Copyright</strong> Valeo - VIS &copy; 2017
          </p>
        </section>
      </div>
    );
  }
}

export default App;
