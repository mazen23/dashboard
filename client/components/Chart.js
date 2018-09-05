import React from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

class Chart extends React.Component {
  render() {
    const { title, num, numOk, numNok, numNp } = this.props;
    const data = [
      { name: "OK", value: numOk },
      { name: "NOK", value: numNok },
      { name: "NP", value: numNp }
    ];
    const COLORS = ["#00ff00", "#ff0000", "#D3D3D3"];

    return (
      <div>
        <div className="chart_title">
          <h3>
            {num} {title}
          </h3>
        </div>
        <PieChart width={160} height={160}>
          <Pie data={data} innerRadius={40} outerRadius={80} fill="#82ca9d">
            {data.map((entry, index) => (
              <Cell fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </div>
    );
  }
}
export default Chart;
