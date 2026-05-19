import React, { useEffect, useCallback } from "react";
import "./ChartSettingModal.css";

const GraphSettingModal = ({ widgetId, settings, onChange, onClose }) => {
  const {
    curve = "linear",
    enableArea = true,
    areaOpacity = 0.2,
    colorScheme = "nivo",
    colorBy = "id",
    showGridX = true,
    showGridY = true,
    lineWidth = 2,
    pointSize = 10,
    pointBorderWidth = 2,
    enablePoints = true,
    enableSlices = "x",
    useMesh = true,
    animate = true,
    legendPosition = "bottom",
    showAxisTop = false,
    showAxisRight = false,
    showAxisBottom = true,
    showAxisLeft = true,
  } = settings;

  const handleChange = (key, value) => {
    onChange({ [key]: value });
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
          className="modal-dialog modal-dialog-centered modal-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content rounded-4 shadow-lg">
            <div className="modal-header bg-primary text-white rounded-top-4">
              <h5 className="modal-title">Graph Settings</h5>
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
                  >
                    API Settings
                  </button>
                </li>
              </ul>

              <div className="tab-content">
                <div className="tab-pane fade show active" id="ui" role="tabpanel">
                  <div className="row g-3">
                    {/* Curve */}
                    <div className="col-md-6">
                      <label className="form-label">Curve</label>
                      <select
                        className="form-select"
                        value={curve}
                        onChange={(e) => handleChange("curve", e.target.value)}
                      >
                        <option value="linear">Linear</option>
                        <option value="monotoneX">Monotone X</option>
                        <option value="step">Step</option>
                        <option value="natural">Natural</option>
                        <option value="basis">Basis</option>
                        <option value="cardinal">Cardinal</option>
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
                        <option value="id">ID</option>
                        <option value="indexValue">Index Value</option>
                      </select>
                    </div>

                    {/* Line Width */}
                    <div className="col-md-6">
                      <label className="form-label">Line Width</label>
                      <input
                        type="number"
                        className="form-control"
                        min={1}
                        max={10}
                        value={lineWidth}
                        onChange={(e) => handleChange("lineWidth", parseInt(e.target.value))}
                      />
                    </div>

                    {/* Point Size */}
                    <div className="col-md-6">
                      <label className="form-label">Point Size</label>
                      <input
                        type="number"
                        className="form-control"
                        min={0}
                        max={20}
                        value={pointSize}
                        onChange={(e) => handleChange("pointSize", parseInt(e.target.value))}
                      />
                    </div>

                    {/* Point Border Width */}
                    <div className="col-md-6">
                      <label className="form-label">Point Border Width</label>
                      <input
                        type="number"
                        className="form-control"
                        min={0}
                        max={10}
                        value={pointBorderWidth}
                        onChange={(e) => handleChange("pointBorderWidth", parseInt(e.target.value))}
                      />
                    </div>

                    {/* Area Opacity */}
                    <div className="col-md-6">
                      <label className="form-label">Area Opacity</label>
                      <input
                        type="range"
                        className="form-range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={areaOpacity}
                        onChange={(e) => handleChange("areaOpacity", parseFloat(e.target.value))}
                      />
                    </div>

                    {/* Enable Area */}
                    <div className="col-md-6 form-check form-switch mt-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`enableArea-${widgetId}`}
                        checked={enableArea}
                        onChange={() => handleChange("enableArea", !enableArea)}
                      />
                      <label className="form-check-label ms-2" htmlFor={`enableArea-${widgetId}`}>
                        Enable Area
                      </label>
                    </div>

                    {/* Grid toggles */}
                    {["X", "Y"].map((axis) => (
                      <div className="col-md-6 form-check form-switch mt-2" key={axis}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`grid${axis}-${widgetId}`}
                          checked={settings[`showGrid${axis}`]}
                          onChange={() => handleChange(`showGrid${axis}`, !settings[`showGrid${axis}`])}
                        />
                        <label className="form-check-label ms-2" htmlFor={`grid${axis}-${widgetId}`}>
                          Show Grid {axis}
                        </label>
                      </div>
                    ))}

                    {/* Axis toggles */}
                    {["Top", "Right", "Bottom", "Left"].map((side) => {
                      const key = `showAxis${side}`;
                      return (
                        <div className="col-md-6 form-check form-switch mt-2" key={key}>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`${key}-${widgetId}`}
                            checked={settings[key]}
                            onChange={() => handleChange(key, !settings[key])}
                          />
                          <label className="form-check-label ms-2" htmlFor={`${key}-${widgetId}`}>
                            Show Axis {side}
                          </label>
                        </div>
                      );
                    })}

                    {/* Enable Points */}
                    <div className="col-md-6 form-check form-switch mt-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`enablePoints-${widgetId}`}
                        checked={enablePoints}
                        onChange={() => handleChange("enablePoints", !enablePoints)}
                      />
                      <label className="form-check-label ms-2" htmlFor={`enablePoints-${widgetId}`}>
                        Enable Points
                      </label>
                    </div>

                    {/* Use Mesh */}
                    <div className="col-md-6 form-check form-switch mt-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`useMesh-${widgetId}`}
                        checked={useMesh}
                        onChange={() => handleChange("useMesh", !useMesh)}
                      />
                      <label className="form-check-label ms-2" htmlFor={`useMesh-${widgetId}`}>
                        Use Mesh
                      </label>
                    </div>

                    {/* Enable Animation */}
                    <div className="col-md-6 form-check form-switch mt-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`animateSwitch-${widgetId}`}
                        checked={animate}
                        onChange={() => handleChange("animate", !animate)}
                      />
                      <label className="form-check-label ms-2" htmlFor={`animateSwitch-${widgetId}`}>
                        Enable Animation
                      </label>
                    </div>
                  </div>
                </div>

                {/* API Tab */}
                <div className="tab-pane fade" id="api" role="tabpanel">
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
                      placeholder='[{"x": "Jan", "y": 100}, {"x": "Feb", "y": 150}]'
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

export default GraphSettingModal;
