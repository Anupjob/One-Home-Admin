import React, { useEffect, useCallback, useState } from "react";
import "./ChartSettingModal.css";
import getApiCall from "../Services/getApiCall";

const TableSettingModal = ({ widgetId, settings, onChange, onClose }) => {
  const {
    showHeader = true,
    striped = true,
    bordered = true,
    hover = true,
    condensed = false,
    showPagination = false,
    colorTheme = "light",
    visibleColumns = ["name", "age", "country"],
  } = settings;

  const handleChange = (key, value) => onChange({ [key]: value });
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

  const allColumns = ["name", "age", "country"];
const handleAPIChange=async(e)=>{
     let response = await getApiCall(e.target.value);
                 if (response.meta.status) {
                  console.log('response?.data?.projects::::',response?.data)
                  handleChange("manualData",response?.data)
                 }
}
  return (
    <>
      <div className="custom-modal-backdrop" />
      <div className="modal d-block custom-modal" onClick={onClose}>
        <div className="modal-dialog modal-dialog-centered modal-xl" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content rounded-4 shadow-lg">
            <div className="modal-header bg-primary text-white rounded-top-4">
              <h5 className="modal-title">Table Settings</h5>
              <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
            </div>

            <div className="modal-body">
              <ul className="nav nav-tabs mb-3" role="tablist">
                <li className="nav-item">
                  <button className="nav-link active" id="ui-tab" data-bs-toggle="tab" data-bs-target="#ui" role="tab" onClick={()=>setTabs('UI')}>
                    UI Settings
                  </button>
                </li>
                <li className="nav-item">
                  <button className="nav-link" id="api-tab" data-bs-toggle="tab" data-bs-target="#api" role="tab" onClick={()=>setTabs('API')}>
                    API Settings
                  </button>
                </li>
              </ul>

              <div className="tab-content">
                
               <div className={`tab-pane fade show ${tabs === "UI" ? "active" : ""}`} id="ui" role="tabpanel">

                  <div className="row g-3">
                    {[
                      ["Show Header", "showHeader"],
                      ["Striped Rows", "striped"],
                      ["Bordered", "bordered"],
                      ["Hover Highlight", "hover"],
                      ["Condensed", "condensed"],
                      ["Enable Pagination", "showPagination"],
                    ].map(([label, key]) => (
                      <div className="col-md-6 form-check form-switch mt-2" key={key}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`${key}-${widgetId}`}
                          checked={settings[key]}
                          onChange={() => handleChange(key, !settings[key])}
                        />
                        <label className="form-check-label ms-2" htmlFor={`${key}-${widgetId}`}>
                          {label}
                        </label>
                      </div>
                    ))}

                    {/* Color Theme */}
                    <div className="col-md-6">
                      <label className="form-label">Color Theme</label>
                      <select
                        className="form-select"
                        value={colorTheme}
                        onChange={(e) => handleChange("colorTheme", e.target.value)}
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                      </select>
                    </div>

                    {/* Visible Columns */}
                    <div className="col-12">
                      <label className="form-label">Visible Columns</label>
                      {allColumns.map((col) => (
                        <div className="form-check form-check-inline" key={col}>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`${col}-col-${widgetId}`}
                            checked={visibleColumns.includes(col)}
                            onChange={(e) => {
                              const newCols = e.target.checked
                                ? [...visibleColumns, col]
                                : visibleColumns.filter((c) => c !== col);
                              handleChange("visibleColumns", newCols);
                            }}
                          />
                          <label className="form-check-label" htmlFor={`${col}-col-${widgetId}`}>
                            {col}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* API Tab */}
               <div className={`tab-pane fade show ${tabs === "API" ? "active" : ""}`} role="tabpanel">
                  <div className="mb-3">
                    <label className="form-label">API URL</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="https://api.example.com/data"
                      onChange={handleAPIChange}
                      // onChange={(e) => handleChange("apiUrl", e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Manual JSON</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      placeholder='[{"name": "John", "age": 30, "country": "USA"}]'
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

export default TableSettingModal;