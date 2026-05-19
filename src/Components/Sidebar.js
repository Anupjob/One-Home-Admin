import React from "react";
import { useDrag } from "react-dnd";

const widgets = ["Card", "Chart", "Graph", "Table"];

function DraggableWidget({ type }) {
  const [{ isDragging }, dragRef] = useDrag({
    type: "WIDGET",
    item: { type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={dragRef}
      className={`btn btn-outline-primary mb-2 w-100 ${isDragging ? "opacity-50" : ""}`}
    >
       {type}
    </div>
  );
}

export default function Sidebar() {
  return (
    <div className="widget-sidebar border-start shadow-sm">
      <h5 className="mb-3">Widgets</h5>
      {widgets.map((type) => (
        <DraggableWidget key={type} type={type} />
      ))}
    </div>
  );
}
