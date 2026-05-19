// Tooltip.js
import { createPortal } from "react-dom";
import React, { useEffect } from "react";

export default function Tooltip({ text, position }) {
  useEffect(() => {
    // Cleanup tooltip styles if needed later
    return () => {};
  }, []);

  if (!text || !position) return null;

  return createPortal(
    <>
      <div
        className="custom-tooltip fancy-left-tooltip"
        style={{
          top: position.top  + "px",
          left: position.left - 20 + "px"
        }}
      >
        {text}
      </div>

      <style>
        {`
          .fancy-left-tooltip {
            position: absolute;
            z-index: 9999;
            background: #ef5713;
            color: #ffffff;
            padding: 8px 12px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            font-size: 12px;
            font-weight: 500;
            white-space: nowrap;
            pointer-events: none;
            transition: opacity 0.2s ease-in-out;
            opacity: 1;
          }

          .fancy-left-tooltip::before {
            content: "";
            position: absolute;
            left: -6px;
            top: 50%;
            transform: translateY(-50%);
            border-width: 6px 6px 6px 0;
            border-style: solid;
            border-color: transparent #ef5713 transparent transparent;
          }
        `}
      </style>
    </>,
    document.body
  );
}
