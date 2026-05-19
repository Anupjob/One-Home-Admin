import React, { useState } from "react";
import "./ReusableAccordion.css";

export default function ReusableAccordion({
  title,
  children,
  actions,
  isOpen,
  onToggle,
  defaultExpanded = false,
}) {
  const [open, setOpen] = useState(defaultExpanded);
  const handleClicked = () => {
    // if (onToggle&&!isOpen) {
      onToggle();
    // }
  };

  return (
    <div className="custom-accordion mb-3">
      <div
        className="accordion-header d-flex justify-content-between align-items-center"
        style={{ cursor: "pointer", padding: "0.7rem 1rem", backgroundColor: "#fff" }}
          onClick={handleClicked}
      >
        {/* Left: Title */}
        <div>
        <span
  className="d-inline-flex align-items-center justify-content-center"
  style={{
    width: "28px",
    height: "28px",
    cursor: "pointer"
  }}
>
  <i className={`bi ${isOpen ? "bi-dash-square" : "bi-plus-square"} text-muted`} style={{ fontSize: "12px", paddingRight:'10px', paddingLeft:'5px' }}/>
</span>

        <span style={{ fontWeight: 500 }}>{title}</span>
</div>
        <div className="d-flex align-items-center">
          {/* Middle: Actions */}
          {actions && <div className="accordion-actions me-2">{actions}</div>}

          {/* Right: Open/Close Icon */}
          
        </div>
      </div>

      {isOpen && <div className="accordion-body p-3">{children}</div>}
    </div>
  );
}
