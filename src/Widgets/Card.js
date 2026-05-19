import React from "react";
import "./Card.css";

export function Card({ settings = {} }) {
  const {
    title = "Card Title",
    subtitle = "Card Subtitle",
    description = "This is the card description.",
    titleSize = "20px",
    subtitleSize = "16px",
    descriptionSize = "14px",
    alignment = "center",
    backgroundColor = "#ffffff",
    textColor = "#000000",
    overlayTop = "0px",
    overlayLeft = "0px",
  } = settings;

  return (
    <div className="card-widget" style={{ backgroundColor, color: textColor }}>
      <div className="card-background">
        <div
          className="card-overlay"
          style={{
            top: overlayTop,
            left: overlayLeft,
            textAlign: alignment,
          }}
        >
          {title && (
            <h4 className="card-title" style={{ fontSize: titleSize }}>
              {title}
            </h4>
          )}
          {subtitle && (
            <h6 className="card-subtitle" style={{ fontSize: subtitleSize }}>
              {subtitle}
            </h6>
          )}
          {description && (
            <p className="card-description" style={{ fontSize: descriptionSize }}>
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
