import React, { useEffect, useCallback } from "react";
import "./Banner.css";

const BannerSettingModal = ({ widgetId, settings, onChange, onClose }) => {
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

  const handleChange = (key, value) => {
    onChange({ ...settings, [key]: value });
  };

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "auto";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <>
      <div className="custom-modal-backdrop" />
      <div className="modal d-block custom-modal" onClick={onClose}>
        <div
          className="modal-dialog modal-dialog-centered modal-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content rounded-4 shadow-lg">
            <div className="modal-header bg-primary text-white rounded-top-4">
              <h5 className="modal-title">Banner Settings</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
              ></button>
            </div>

            <div className="modal-body">
              <div className="row g-3">
                {/* Title */}
                <div className="col-8">
                  <label className="form-label">Title</label>
                  <input
                    className="form-control"
                    value={title}
                    onChange={(e) => handleChange("title", e.target.value)}
                  />
                </div>
                <div className="col-4">
                  <label className="form-label">Title Size</label>
                  <input
                    className="form-control"
                    value={titleSize}
                    onChange={(e) => handleChange("titleSize", e.target.value)}
                    placeholder="e.g. 24px"
                  />
                </div>

                {/* Subtitle */}
                <div className="col-8">
                  <label className="form-label">Subtitle</label>
                  <input
                    className="form-control"
                    value={subtitle}
                    onChange={(e) => handleChange("subtitle", e.target.value)}
                  />
                </div>
                <div className="col-4">
                  <label className="form-label">Subtitle Size</label>
                  <input
                    className="form-control"
                    value={subtitleSize}
                    onChange={(e) => handleChange("subtitleSize", e.target.value)}
                    placeholder="e.g. 18px"
                  />
                </div>

                {/* Description */}
                <div className="col-8">
                  <label className="form-label">Description</label>
                  <input
                    className="form-control"
                    value={description}
                    onChange={(e) => handleChange("description", e.target.value)}
                  />
                </div>
                <div className="col-4">
                  <label className="form-label">Description Size</label>
                  <input
                    className="form-control"
                    value={descriptionSize}
                    onChange={(e) => handleChange("descriptionSize", e.target.value)}
                    placeholder="e.g. 14px"
                  />
                </div>

                {/* Alignment */}
                <div className="col-6">
                  <label className="form-label">Text Alignment</label>
                  <select
                    className="form-select"
                    value={alignment}
                    onChange={(e) => handleChange("alignment", e.target.value)}
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>

                {/* Text Color */}
                <div className="col-3">
                  <label className="form-label">Text Color</label>
                  <input
                    type="color"
                    className="form-control form-control-color"
                    value={textColor}
                    onChange={(e) => handleChange("textColor", e.target.value)}
                  />
                </div>

                {/* Overlay Padding */}
                <div className="col-3">
                  <label className="form-label">Overlay Padding</label>
                  <input
                    className="form-control"
                    value={overlayPadding}
                    onChange={(e) => handleChange("overlayPadding", e.target.value)}
                    placeholder="e.g. 20px"
                  />
                </div>

                {/* Background Image */}
                <div className="col-12">
                  <label className="form-label">Background (CSS)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={backgroundImage}
                    onChange={(e) => handleChange("backgroundImage", e.target.value)}
                    placeholder="e.g. linear-gradient(...), url(...)"
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BannerSettingModal;
