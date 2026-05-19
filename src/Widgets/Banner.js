import React from "react";
import "./Banner.css";

export function Banner({ settings = {} }) {
  const {
    title = "Tech Innovation Summit",
    subtitle = "August 25, 2025",
    description = "Discover the latest in AI, Cloud, and Robotics at our global event.",
    titleSize = "24px",
    subtitleSize = "18px",
    descriptionSize = "14px",
    alignment = "center",
    backgroundImage = "linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0)), url('https://www.iiflonehome.com/assets/images/Hero.png')",
    textColor = "#FFFFFF",
    overlayPadding = "20px"
  } = settings;

  return (
    <div className="banner-widget">
      <div
        className="banner-background"
        style={{
          background: backgroundImage,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className="banner-overlay"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: alignment,
            textAlign: alignment,
            color: textColor,
            padding: overlayPadding,
            height: "100%",
            width: "100%",
          }}
        >
          <h2 style={{ fontSize: titleSize }}>{title}</h2>
          <h4 style={{ fontSize: subtitleSize }}>{subtitle}</h4>
          <p style={{ fontSize: descriptionSize }}>{description}</p>
        </div>
      </div>
    </div>
  );
}
