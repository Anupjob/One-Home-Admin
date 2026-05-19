import { Card } from "./Card";
import { Chart } from "./Chart";
import { Graph } from "./Graph";
import { EnhancedTable } from "./Table";
import { Banner } from "./Banner";

import ChartSettingModal from "./ChartSettingsModal";
import GraphSettingModal from "./GraphSettingModal";
import TableSettingModal from "./TableSettingModal";
import BannerSettingModal from "./BannerSettingModal";
import CardSettingModal from "./CardSettingModal";

// Import CSS strings manually or via ?inline if using Vite or a similar bundler
import cardCss from "./Card.css?inline";
import chartCss from "./ChartSettingModal.css?inline";
import graphCss from "./GraphSettingModal.css?inline";
// import tableCss from "./Table.css";
import bannerCss from "./Banner.css?inline";

const tableCss = `
  .table-widget {
    width: 100%;
    border-collapse: collapse;
    font-family: Arial, sans-serif;
  }

  .table-widget th,
  .table-widget td {
    border: 1px solid #dee2e6;
    padding: 8px 12px;
    text-align: left;
  }

  .table-widget th {
    background-color: #f8f9fa;
    font-weight: bold;
  }

  .table-widget tbody tr:nth-child(even) {
    background-color: #f2f2f2;
  }

  .table-widget tbody tr:hover {
    background-color: #e9ecef;
  }

  /* Responsive table */
  @media (max-width: 768px) {
    .table-widget {
      font-size: 14px;
    }
    .table-widget th,
    .table-widget td {
      padding: 6px 8px;
    }
  }
`;

export const widgetMap = {
  Card: {
    component: Card,
    settingsModal: CardSettingModal,
    export: (settings = {}) => {
      const {
        title = "Card Title",
        subtitle = "Card Subtitle",
        description = "This is the card description.",
        titleSize = "20px",
        subtitleSize = "16px",
        descriptionSize = "14px",
        alignment = "center",
        backgroundColor = "#ffffff",
        backgroundImage = "", // ✅ new
        textColor = "#000000",
        overlayTop = "20px",
        overlayLeft = "20px",
      } = settings;

      return `
        <div class="card-widget" style="color: ${textColor};">
          <div class="card-background" style="
            ${backgroundImage
              ? `background: ${backgroundImage}; background-size: cover; background-position: center;`
              : `background-color: ${backgroundColor};`}
          ">
            <div class="card-overlay" style="top: ${overlayTop}; left: ${overlayLeft}; text-align: ${alignment}; position: relative;">
              ${
                title
                  ? `<h4 class="card-title" style="font-size: ${titleSize};">${title}</h4>`
                  : ""
              }
              ${
                subtitle
                  ? `<h6 class="card-subtitle" style="font-size: ${subtitleSize};">${subtitle}</h6>`
                  : ""
              }
              ${
                description
                  ? `<p class="card-description" style="font-size: ${descriptionSize};">${description}</p>`
                  : ""
              }
            </div>
          </div>
        </div>
      `;
    },
    css: cardCss,
  },
  Chart: {
    component: Chart,
    settingsModal: ChartSettingModal,
    export: (settings) => {
  let jsonData = settings.manualData;

  // Safely parse JSON
  try {
    if (typeof jsonData === "string") {
      jsonData = JSON.parse(jsonData);
    }
  } catch (error) {
    console.error("Invalid JSON in manualData:", error);
    jsonData = [];
  }

  if (!Array.isArray(jsonData) || jsonData.length === 0) {
    return `<div class="chart-widget">No Data Available</div>`;
  }

  // Get keys dynamically (first key for labels, second for values)
  const keys = Object.keys(jsonData[0]);
  const labelKey = keys[0];
  const valueKey = keys[1];

  const maxValue = Math.max(...jsonData.map(item => Number(item[valueKey]) || 0));

  // Build chart HTML
  let chartHTML = `<div class="bar-chart-widget">`;
  jsonData.forEach(item => {
    const value = Number(item[valueKey]) || 0;
    const percentage = maxValue ? (value / maxValue) * 100 : 0;

    chartHTML += `
      <div class="bar-row">
        <span class="bar-label">${item[labelKey]}</span>
        <div class="bar-container">
          <div class="bar" style="width: ${percentage}%;">
            <span class="bar-value">${value}</span>
          </div>
        </div>
      </div>
    `;
  });
  chartHTML += `</div>`;

  return chartHTML;
},
css: `
  .bar-chart-widget {
    width: 100%;
    font-family: Arial, sans-serif;
    padding: 10px;
  }
  .bar-row {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
  }
  .bar-label {
    flex: 0 0 100px;
    font-weight: bold;
    font-size: 14px;
  }
  .bar-container {
    flex: 1;
    background-color: #f1f1f1;
    border-radius: 4px;
    overflow: hidden;
    height: 24px;
    position: relative;
  }
  .bar {
    height: 100%;
    background-color: #4CAF50;
    text-align: right;
    padding-right: 5px;
    box-sizing: border-box;
    color: white;
    font-size: 12px;
    line-height: 24px;
    transition: width 0.4s ease;
  }
  .bar-value {
    position: absolute;
    right: 8px;
    top: 0;
    height: 100%;
    display: flex;
    align-items: center;
  }
`

  },
  Graph: {
    component: Graph,
    settingsModal: GraphSettingModal,
    export: (settings) => `
      <div class="graph-widget">
        <strong>Graph Placeholder</strong>
      </div>
    `,
    css: graphCss,
  },
  Table: {
    component: EnhancedTable,
    settingsModal: TableSettingModal,
 export: (settings) => {
  let jsonData = settings.manualData;

  // Parse stringified JSON safely
  try {
    if (typeof jsonData === "string") {
      jsonData = JSON.parse(jsonData);
    }
  } catch (error) {
    console.error("Invalid JSON in manualData:", error);
    jsonData = [];
  }
console.log('jsonData::::::',jsonData)
  // Ensure it's always an array
  if (!Array.isArray(jsonData)) {
    console.error("manualData must be an array");
    jsonData = [];
  }

  // Extract table columns from object keys
  const columns = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];

  // Build HTML table
  let tableHTML = `<table class="table-widget">`;

  // Table header
  tableHTML += `<thead><tr>`;
  columns.forEach(col => {
    tableHTML += `<th>${col}</th>`;
  });
  tableHTML += `</tr></thead>`;

  // Table body
  tableHTML += `<tbody>`;
  jsonData.forEach(row => {
    tableHTML += `<tr>`;
    columns.forEach(col => {
      tableHTML += `<td>${row[col] ?? ""}</td>`;
    });
    tableHTML += `</tr>`;
  });
  tableHTML += `</tbody></table>`;

  console.log("Export Table Data::::::", tableHTML);

  return tableHTML;
},
css: tableCss,
  },
Banner: {
  component: Banner,
  settingsModal: BannerSettingModal,
  export: (settings = {}) => {
    const {
      title = "Tech Innovation Summit",
      subtitle = "August 25, 2025",
      description = "Discover the latest in AI, Cloud, and Robotics at our global event.",
      titleSize = "24px",
      subtitleSize = "18px",
      descriptionSize = "14px",
      alignment = "center",
      backgroundImage = "linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0)), url('https://www.iiflonehome.com/assets/images/Hero.png')",
      textColor = "#ffffff",
      overlayPadding = "20px"
    } = settings;

    return `
      <div class="banner-widget">
        <div class="banner-background" style="
          background: ${backgroundImage};
          background-size: cover;
          background-position: center;
        ">
          <div class="banner-overlay" style="
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: ${alignment};
            text-align: ${alignment};
            color: ${textColor};
            padding: ${overlayPadding};
            height: 100%;
            width: 100%;
          ">
            <h2 style="font-size: ${titleSize};">${title}</h2>
            <h4 style="font-size: ${subtitleSize};">${subtitle}</h4>
            <p style="font-size: ${descriptionSize};">${description}</p>
          </div>
        </div>
      </div>
    `;
  },
  css: bannerCss,
},

};
