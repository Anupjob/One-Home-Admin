import React, { useState } from "react";
import { useDrop } from "react-dnd";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "../css/WebsiteBuilder.css";
import WidgetPalette from "./WidgetPalette";
import { getNewWidgetLayout, isOverlapping } from "../Utils/layoutUtils";
import { widgetMap } from "../Widgets/WidgetMap";

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function Dashboard({
  layout, 
  setLayout,
  widgets,
  setWidgets,
  mode,
  setMode,
  settingsWidgetId,
  setSettingsWidgetId,
  pageFor
}) {
console.log('layout::::::',layout, widgets)
  const [{ isOver }, dropRef] = useDrop({
    accept: "WIDGET",
    drop: (item) => {
      if (mode !== "edit") return;
      const newLayoutItem = getNewWidgetLayout(layout, item.type);
      const id = Date.now().toString();
      const layoutItem = { ...newLayoutItem, i: id };
      const widgetItem = { id, type: item.type, settings: {} };
      if (!isOverlapping(layout, layoutItem)) {
        setLayout((prev) => [...prev, layoutItem]);
        setWidgets((prev) => [...prev, widgetItem]);
      }
    },
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  });

  const handleDeleteWidget = (id) => {
    setWidgets((prev) => prev.filter((w) => w.id !== id));
    setLayout((prev) => prev.filter((l) => l.i !== id));
  };

  const handleWidgetSettingsChange = (id, newSettings) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, settings: { ...w.settings, ...newSettings } } : w))
    );
  };

const generateExport = () => {
  let widgetCss = "";
  const usedTypes = new Set(layout.map((l) => widgets.find((w) => w.id === l.i)?.type));
  usedTypes.forEach((type) => {
    const def = widgetMap[type];
    if (def?.css) {
      widgetCss += `\n/* ${type} styles */\n${def.css}\n`;
    }
  });

  const css = `
body {
  font-family: sans-serif;
  padding: 20px;
  background: #f9f9f9;
}
.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-rows: 30px;
}
${widgetCss}
`;

  const js = `console.log("Dashboard Loaded");`;

  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Dashboard Preview</title>
  <style>${css}</style>
</head>
<body>
  <div class="grid">
`;

  layout.forEach((l) => {
    const widget = widgets.find((w) => w.id === l.i);
    if (!widget) return;
    const WidgetDef = widgetMap[widget.type];
    const settings = widget.settings || {};
    const content = WidgetDef?.export
      ? WidgetDef.export(settings)
      : `<div><strong>${widget.type}</strong></div>`;
console.log('WidgetDef:::::::',WidgetDef, settings, content)
    html += `
    <div class="widget" style="grid-column: span ${l.w}; grid-row: span ${l.h}; background-color: ${
      settings.backgroundColor || "#fff"
    };">
      ${content}
    </div>
`;
  });

  html += `
  </div>
  <script>${js}</script>
</body>
</html>
`;

  const previewWindow = window.open("", "_blank", "noopener,noreferrer");
  previewWindow.document.open();
  previewWindow.document.write(html);
  previewWindow.document.close();
};

  return (
    <div className="dashboard-container d-flex">
      {pageFor !== "webPreview"&&
      <div className="mode-toggle-fancy">
        <input
          type="checkbox"
          id="mode-switch"
          checked={mode === "preview"}
          onChange={() => setMode(mode === "edit" ? "preview" : "edit")}
        />
        <label htmlFor="mode-switch" title={mode === "edit" ? "Preview" : "Edit"}>
          <i className={`bi ${mode === "edit" ? "bi-eye" : "bi-pencil-square"} toggle-icon`}></i>
        </label>
      </div>
}

      {mode === "preview" && (
        <div onClick={generateExport} className={`mode-toggle-fancy ${pageFor !== "webPreview"&&'download-dashboard'}`}>
          <label><i className="bi bi-download toggle-icon"></i> </label>
        </div>
      )}

      <div className={`grid-area flex-grow-1 ${mode === "preview" ? "no-grid" : ""}`} ref={dropRef}>
        <div style={{ minHeight: "100%", paddingBottom: "200px" }}>
          <ResponsiveGridLayout
            className="layout"
            layouts={{ lg: layout, md: layout, sm: layout }}
            breakpoints={{ lg: 1200, md: 996, sm: 768 }}
            cols={{ lg: 12, md: 6, sm: 4 }}
            rowHeight={30}
            margin={[0, 0]}
            isResizable={mode === "edit"}
            isDraggable={mode === "edit"}
            onLayoutChange={(currentLayout, allLayouts) => {
              setLayout(allLayouts.lg || currentLayout);
            }}
            compactType={null}
            preventCollision={true}
          >
            {widgets.map((w) => {
              const WidgetDef = widgetMap[w.type];
              const WidgetComponent = WidgetDef?.component;
              const widgetSettings = w.settings || {};
              return (
                <div
                  key={w.id}
                  data-grid={layout.find((l) => l.i === w.id)}
                  className="widget-wrapper"
                >
                  {mode === "edit" && (
                    <div className="widget-toolbar">
                      {WidgetDef?.settingsModal && (
                        <button
                          className="setting-widget-btn"
                          onClick={() => setSettingsWidgetId(w.id)}
                          title="Widget Settings"
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <i className="bi bi-gear-fill"></i>
                        </button>
                      )}
                      <button
                        className="delete-widget-btn"
                        onClick={() => handleDeleteWidget(w.id)}
                        title="Delete Widget"
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <i className="bi bi-x-circle"></i>
                      </button>
                    </div>
                  )}
                  {WidgetComponent && <WidgetComponent settings={widgetSettings} />}
                </div>
              );
            })}
          </ResponsiveGridLayout>
        </div>
      </div>

      {mode === "edit" && <WidgetPalette />}

      {settingsWidgetId && (() => {
        const currentWidget = widgets.find((w) => w.id === settingsWidgetId);
        if (!currentWidget) return null;
        const WidgetDef = widgetMap[currentWidget.type];
        const SettingsModal = WidgetDef?.settingsModal;
        if (!SettingsModal) return null;
        return (
          <SettingsModal
            widgetId={settingsWidgetId}
            settings={currentWidget.settings || {}}
            onChange={(newSettings) => handleWidgetSettingsChange(settingsWidgetId, newSettings)}
            onClose={() => setSettingsWidgetId(null)}
          />
        );
      })()}
    </div>
  );
}
