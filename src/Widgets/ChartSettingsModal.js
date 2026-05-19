import React, { useEffect, useCallback, useState } from "react";
import "./ChartSettingModal.css";

const ChartSettingModal = ({ widgetId, settings, onChange, onClose }) => {
  const {
    layout = "vertical",
    groupMode = "grouped",
    colorScheme = "nivo",
    showLabels = true,
    showGrid = true,
    showGridX = true,
    showGridY = true,
    barPadding = 0.2,
    animate = true,
    legendPosition = "bottom",
    labelRotation = 0,
    showAxisTop = false,
    showAxisRight = false,
    showAxisBottom = true,
    showAxisLeft = true,
    colorBy = "indexValue",
  } = settings;

  const handleChange = (key, value) => {
    onChange({ [key]: value });
  };
 const [tabs, setTabs] = useState('UI')
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
          className="modal-dialog modal-dialog-centered modal-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content rounded-4 shadow-lg">
            <div className="modal-header bg-primary text-white rounded-top-4">
              <h5 className="modal-title">Chart Settings</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
              ></button>
            </div>

            <div className="modal-body">
              <ul className="nav nav-tabs mb-3" role="tablist">
                <li className="nav-item">
                  <button
                    className="nav-link active"
                    id="ui-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#ui"
                    role="tab"
                    onClick={()=>setTabs('UI')}
                  >
                    UI Settings
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className="nav-link"
                    id="api-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#api"
                    role="tab"
                    onClick={()=>setTabs('API')}
                  >
                    API Settings
                  </button>
                </li>
              </ul>

              <div className="tab-content">
                <div className={`tab-pane fade show ${tabs === "UI" ? "active" : ""}`} id="ui" role="tabpanel">
                  <div className="row g-3">
                    {/* Layout */}
                    <div className="col-md-6">
                      <label className="form-label">Layout</label>
                      <select
                        className="form-select"
                        value={layout}
                        onChange={(e) => handleChange("layout", e.target.value)}
                      >
                        <option value="vertical">Vertical</option>
                        <option value="horizontal">Horizontal</option>
                      </select>
                    </div>

                    {/* Group Mode */}
                    <div className="col-md-6">
                      <label className="form-label">Group Mode</label>
                      <select
                        className="form-select"
                        value={groupMode}
                        onChange={(e) => handleChange("groupMode", e.target.value)}
                      >
                        <option value="grouped">Grouped</option>
                        <option value="stacked">Stacked</option>
                      </select>
                    </div>

                    {/* Color Scheme */}
                    <div className="col-md-6">
                      <label className="form-label">Color Scheme</label>
                      <select
                        className="form-select"
                        value={colorScheme}
                        onChange={(e) => handleChange("colorScheme", e.target.value)}
                      >
                        <option value="nivo">Nivo</option>
                        <option value="category10">Category10</option>
                        <option value="paired">Paired</option>
                        <option value="dark2">Dark2</option>
                      </select>
                    </div>

                    {/* Color By */}
                    <div className="col-md-6">
                      <label className="form-label">Color By</label>
                      <select
                        className="form-select"
                        value={colorBy}
                        onChange={(e) => handleChange("colorBy", e.target.value)}
                      >
                        <option value="indexValue">Index Value</option>
                        <option value="id">ID</option>
                      </select>
                    </div>

                    {/* Bar Padding */}
                    <div className="col-md-6">
                      <label className="form-label">Bar Padding</label>
                      <input
                        type="range"
                        className="form-range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={barPadding}
                        onChange={(e) =>
                          handleChange("barPadding", parseFloat(e.target.value))
                        }
                      />
                    </div>

                    {/* Label Rotation */}
                    <div className="col-md-6">
                      <label className="form-label">Label Rotation</label>
                      <input
                        type="number"
                        className="form-control"
                        min={-90}
                        max={90}
                        value={labelRotation}
                        onChange={(e) =>
                          handleChange("labelRotation", parseInt(e.target.value))
                        }
                      />
                    </div>

                    {/* Legend Position */}
                    <div className="col-md-6">
                      <label className="form-label">Legend Position</label>
                      <select
                        className="form-select"
                        value={legendPosition}
                        onChange={(e) =>
                          handleChange("legendPosition", e.target.value)
                        }
                      >
                        <option value="bottom">Bottom</option>
                        <option value="top">Top</option>
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                      </select>
                    </div>

                    {/* Show/Hide Axis */}
                    {[
                      { key: "showAxisTop", label: "Show Axis Top" },
                      { key: "showAxisRight", label: "Show Axis Right" },
                      { key: "showAxisBottom", label: "Show Axis Bottom" },
                      { key: "showAxisLeft", label: "Show Axis Left" },
                    ].map(({ key, label }) => (
                      <div className="col-md-6 form-check form-switch mt-2" key={key}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`${key}-${widgetId}`}
                          checked={settings[key]}
                          onChange={() => handleChange(key, !settings[key])}
                        />
                        <label
                          className="form-check-label ms-2"
                          htmlFor={`${key}-${widgetId}`}
                        >
                          {label}
                        </label>
                      </div>
                    ))}

                    {/* Show Grid X/Y */}
                    <div className="col-md-6 form-check form-switch mt-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`gridX-${widgetId}`}
                        checked={showGridX}
                        onChange={() => handleChange("showGridX", !showGridX)}
                      />
                      <label
                        className="form-check-label ms-2"
                        htmlFor={`gridX-${widgetId}`}
                      >
                        Show Grid X
                      </label>
                    </div>

                    <div className="col-md-6 form-check form-switch mt-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`gridY-${widgetId}`}
                        checked={showGridY}
                        onChange={() => handleChange("showGridY", !showGridY)}
                      />
                      <label
                        className="form-check-label ms-2"
                        htmlFor={`gridY-${widgetId}`}
                      >
                        Show Grid Y
                      </label>
                    </div>

                    {/* Show Labels & Animation */}
                    <div className="col-md-6 form-check form-switch mt-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`labelSwitch-${widgetId}`}
                        checked={showLabels}
                        onChange={() => handleChange("showLabels", !showLabels)}
                      />
                      <label
                        className="form-check-label ms-2"
                        htmlFor={`labelSwitch-${widgetId}`}
                      >
                        Show Labels
                      </label>
                    </div>

                    <div className="col-md-6 form-check form-switch mt-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`animateSwitch-${widgetId}`}
                        checked={animate}
                        onChange={() => handleChange("animate", !animate)}
                      />
                      <label
                        className="form-check-label ms-2"
                        htmlFor={`animateSwitch-${widgetId}`}
                      >
                        Enable Animation
                      </label>
                    </div>
                  </div>
                </div>

                {/* API Settings */}
                <div className={`tab-pane fade show ${tabs === "API" ? "active" : ""}`} id="api" role="tabpanel">
                  <div className="mb-3">
                    <label className="form-label">API URL</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="https://api.example.com/data"
                      onChange={(e) => handleChange("apiUrl", e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Manual JSON</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      placeholder='[{"x": "2022", "y": 100}, {"x": "2023", "y": 150}]'
                      onChange={(e) => handleChange("manualData", e.target.value)}
                    />
                  </div>
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

export default ChartSettingModal;
