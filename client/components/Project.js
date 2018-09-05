import React from "react";

class Project extends React.Component {

    render() {
        return (
            <section className="content">
                <div className="content-head">
                    <h1 className="prim-color">...</h1>
                </div>
                <div className="left-content">
                    <button type="button" className="btn btn-default generateButton" data-request="/api/projects/generate/{{project.proj_name}}">
                        Generate
                    </button>
                    <button type="button" className="btn btn-default runButton" data-request="/api/projects/run/{{project.proj_name}}">
                        Run
                    </button>
                </div>
            </section>
        );
    }
}

export default Project;
