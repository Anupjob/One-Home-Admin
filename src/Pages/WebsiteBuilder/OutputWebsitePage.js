import React from "react";
import GridLayout from "react-grid-layout";
// import "bootstrap/dist/css/bootstrap.min.css";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from "recharts";
import { widgets } from "./widgetsData";
import { EnhancedTable } from "../../Widgets/Table";
import { Chart } from "../../Widgets/Chart";

export default function OutputWebsitePage() {
  const renderWidget = (widget) => {
    const { type, settings } = widget;

    switch (type) {
      case "barChart":
        return (
          <div style={{ background: settings?.style?.backgroundColor, padding: "10px" }}>
            <BarChart width={300} height={200} data={settings.manualData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" stroke={settings?.style?.textColor} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill={settings?.style?.barColor} />
            </BarChart>
          </div>

        //  <Chart settings={settings}/>
        );

      case "table":
        return (
          <div style={{ background: settings?.style?.backgroundColor, padding: "10px" }}>
            <table className="table table-striped table-bordered">
              <thead style={{ background: settings?.style?.headerColor, color: "#fff" }}>
                <tr>
                  {Object.keys(settings.manualData[0]).map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {settings.manualData.map((row, idx) => (
                  <tr key={idx}>
                    {Object.values(row).map((val, i) => (
                      <td key={i}>{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        // <EnhancedTable settings={settings}/>
        );

      case "card":
        return (
          <div style={{
            background: settings.style.backgroundColor,
            color: settings.style.textColor,
            padding: "20px",
            fontSize: settings.style.fontSize,
            textAlign: "center",
            borderRadius: "8px"
          }}>
            <h4>{settings.title}</h4>
            <h2>{settings.value}</h2>
          </div>
        );

      case "lineChart":
        return (
          <div style={{ background: settings.style.backgroundColor, padding: "10px" }}>
            <LineChart width={300} height={200} data={settings.manualData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke={settings.style.lineColor} />
            </LineChart>
          </div>
        );

      default:
        return <div>Unknown widget</div>;
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <GridLayout
        className="layout"
        layout={widgets}
        cols={12}
        rowHeight={50}
        width={1200}
        isDraggable={true}
        isResizable={true}
      >
        {widgets.map((widget) => (
          <div key={widget.i} style={{ border: "1px solid #ddd", borderRadius: "6px" }}>
            {renderWidget(widget)}
          </div>
        ))}
      </GridLayout>
    </div>
  );
}
