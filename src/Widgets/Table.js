import React, { useState, useEffect, useMemo } from "react";
import { Table } from "react-bootstrap";

const defaultData = [
  { name: "John Doe", age: 30, country: "USA" },
  { name: "Jane Smith", age: 25, country: "Canada" },
  { name: "Bob Lee", age: 35, country: "UK" },
];

export const EnhancedTable = ({ settings = {} }) => {
  const {
    showHeader = true,
    striped = true,
    bordered = true,
    hover = true,
    condensed = false,
    showPagination = false,
    colorTheme = "light",
    visibleColumns = ["name", "age", "country"],
    manualData = defaultData, // may be array OR JSON string OR object
  } = settings;

  const [data, setData] = useState([]);

  // Normalize manualData into an array of objects
  useEffect(() => {
    let parsed = [];

    if (manualData == null) {
      parsed = [];
    } else if (Array.isArray(manualData)) {
      parsed = manualData;
    } else if (typeof manualData === "string") {
      // try parsing JSON string
      try {
        const maybe = JSON.parse(manualData);
        if (Array.isArray(maybe)) parsed = maybe;
        else if (maybe && Array.isArray(maybe.data)) parsed = maybe.data;
        else if (maybe && Array.isArray(maybe.rows)) parsed = maybe.rows;
        else if (maybe && typeof maybe === "object") parsed = [maybe];
        else parsed = [];
      } catch (err) {
        console.warn("EnhancedTable: manualData is a string but not valid JSON. Using empty dataset.", err);
        parsed = [];
      }
    } else if (typeof manualData === "object") {
      // object but not array
      if (Array.isArray(manualData.data)) parsed = manualData.data;
      else if (Array.isArray(manualData.rows)) parsed = manualData.rows;
      else parsed = [manualData];
    } else {
      parsed = [];
    }

    setData(parsed);
  }, [manualData]);

  // Build column list (union of all keys across rows), then filter by visibleColumns if provided
  const columns = useMemo(() => {
    if (!data || data.length === 0) {
      // return visibleColumns as fallback (so headers still show)
      return Array.isArray(visibleColumns) && visibleColumns.length > 0 ? visibleColumns : [];
    }

    const unionKeys = Array.from(new Set(data.flatMap((r) => Object.keys(r || {}))));
    // if (Array.isArray(visibleColumns) && visibleColumns.length > 0) {
    //   return unionKeys.filter((k) => visibleColumns.includes(k));
    // }
    return unionKeys;
  }, [data, visibleColumns]);
  console.log('columns:::::',columns, data)

  return (
    <div
      className="widget-card"
      style={{
        background: "#fff",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        height: "100%",
        padding: 16,
      }}
    >
      <Table
        striped={striped}
        bordered={bordered}
        hover={hover}
        size={condensed ? "sm" : undefined}
        variant={colorTheme === "dark" ? "dark" : undefined}
      >
        {showHeader && (
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>{col.charAt(0).toUpperCase() + col.slice(1)}</th>
              ))}
            </tr>
          </thead>
        )}

        <tbody>
          {data && data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((col) => (
                  <td key={col}>{row?.[col] ?? ""}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={Math.max(columns.length, 1)} style={{ textAlign: "center", padding: 20 }}>
                No data
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};
