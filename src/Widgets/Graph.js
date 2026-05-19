import React from "react";
import { ResponsiveLine } from "@nivo/line";

export const Graph = ({ settings = {} }) => {
  const {
    curve = "linear",
    enableArea = true,
    areaOpacity = 0.2,
    colorScheme = "nivo",
    showGridX = true,
    showGridY = true,
    lineWidth = 2,
    pointSize = 10,
    pointBorderWidth = 2,
    enablePoints = true,
    enableSlices = "x",
    useMesh = true,
    showLegends = true,
    xAxisLegend = "Month",
    yAxisLegend = "Sales",
    xAxisEnabled = true,
    yAxisEnabled = true,
    smooth = false,
  } = settings;

  const data = [
    {
      id: "Sales",
      data: [
        { x: "Jan", y: 40 },
        { x: "Feb", y: 55 },
        { x: "Mar", y: 60 },
        { x: "Apr", y: 80 },
        { x: "May", y: 50 },
      ],
    },
    {
      id: "Expenses",
      data: [
        { x: "Jan", y: 20 },
        { x: "Feb", y: 35 },
        { x: "Mar", y: 30 },
        { x: "Apr", y: 60 },
        { x: "May", y: 40 },
      ],
    },
  ];

  return (
    <div
      className="widget-card"
      style={{
        background: "#fff",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        height: "100%",
      }}
    >
      <div style={{ height: "100%" }}>
        <ResponsiveLine
          data={data}
          margin={{ top: 40, right: showLegends ? 130 : 60, bottom: 50, left: 60 }}
          xScale={{ type: "point" }}
          yScale={{
            type: "linear",
            stacked: false,
            min: "auto",
            max: "auto",
          }}
          curve={curve}
          colors={{ scheme: colorScheme }}
          enableArea={enableArea}
          areaOpacity={areaOpacity}
          enableGridX={showGridX}
          enableGridY={showGridY}
          lineWidth={lineWidth}
          pointSize={pointSize}
          enablePoints={enablePoints}
          pointColor={{ theme: "background" }}
          pointBorderWidth={pointBorderWidth}
          pointBorderColor={{ from: "serieColor" }}
          useMesh={useMesh}
          enableSlices={enableSlices}
          axisBottom={
            xAxisEnabled
              ? {
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: xAxisLegend,
                  legendOffset: 36,
                  legendPosition: "middle",
                }
              : null
          }
          axisLeft={
            yAxisEnabled
              ? {
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: yAxisLegend,
                  legendOffset: -40,
                  legendPosition: "middle",
                }
              : null
          }
          legends={
            showLegends
              ? [
                  {
                    anchor: "top-right",
                    direction: "column",
                    justify: false,
                    translateX: 100,
                    translateY: 0,
                    itemsSpacing: 4,
                    itemDirection: "left-to-right",
                    itemWidth: 80,
                    itemHeight: 20,
                    itemOpacity: 0.75,
                    symbolSize: 12,
                    symbolShape: "circle",
                  },
                ]
              : []
          }
        />
      </div>
    </div>
  );
};
