// Components/WidgetPalette.js
import React from "react";
import { useDrag } from "react-dnd";
import { FaChartBar, FaTable, FaTh, FaCreditCard } from "react-icons/fa";
import "../css/WidgetPalette.css";

const widgetList = [
  { type: "Card", icon: <i className="bi bi-credit-card-2-front" />, name: "Card" },
  { type: "Chart", icon: <i className="bi bi-bar-chart-line" />, name: "Bar" },
  { type: "Graph", icon: <i className="bi-graph-up" />, name: "Line " },
  { type: "Table", icon: <i className="bi bi-table" />, name: "Table" },
  { type: "Banner", icon: <i className="bi bi-image-alt" />, name: "Banner" },
];

export default function WidgetPalette() {
  return (
    <div className="widget-palette-container">
      {widgetList.map((widget) => (
        <DraggableWidget key={widget.type} {...widget} />
      ))}
    </div>
  );
}

function DraggableWidget({ type, icon, name }) {
  const [{ isDragging }, dragRef] = useDrag({
    type: "WIDGET",
    item: { type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div ref={dragRef} className="widget-icon-wrapper" title={name}>
      <div className="widget-icon">{icon}</div>
      <div className="widget-label">{name}</div>
    </div>
  );
}
