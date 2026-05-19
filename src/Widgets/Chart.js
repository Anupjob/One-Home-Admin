import React, {useState, useEffect} from "react";
import { ResponsiveBar } from "@nivo/bar";

const defaultData = [
    { country: "USA", hotdog: 60, burger: 80, kebab: 45 },
    { country: "Germany", hotdog: 70, burger: 60, kebab: 50 },
    { country: "India", hotdog: 40, burger: 30, kebab: 90 },
  ];

export const Chart = ({ settings = {} }) => {
  const {
    layout = "vertical",
    groupMode = "grouped",
    colorScheme = "category10",
    showLabels = true,
    manualData = defaultData
  } = settings;
console.log('chart settings:::::',settings)

  const [data, setData] = useState([]);
  const [keys, setKeys] = useState(["hotdog", "burger", "kebab"]);
  
    // Normalize manualData into an array of objects
useEffect(() => {
  let parsed = [];

  if (manualData == null) {
    parsed = [];
  } else if (Array.isArray(manualData)) {
    parsed = manualData;
  } else if (typeof manualData === "string") {
    try {
      const maybe = JSON.parse(manualData);
      if (Array.isArray(maybe)) parsed = maybe;
      else if (maybe && Array.isArray(maybe.data)) parsed = maybe.data;
      else if (maybe && Array.isArray(maybe.rows)) parsed = maybe.rows;
      else if (maybe && typeof maybe === "object") parsed = [maybe];
    } catch (err) {
      console.warn("EnhancedTable: manualData is invalid JSON. Using empty dataset.", err);
    }
  } else if (typeof manualData === "object") {
    if (Array.isArray(manualData.data)) parsed = manualData.data;
    else if (Array.isArray(manualData.rows)) parsed = manualData.rows;
    else parsed = [manualData];
  }

  const unionKeys = Array.from(
    new Set(parsed.flatMap((r) => Object.keys(r || {})))
  )

  setKeys(unionKeys);
  setData(parsed);
}, [manualData]);

console.log('data:::::chart::::', data, keys)
  return (
    <div
      className="widget-card"
      style={{
        background: "#fff",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        height: "100%",
      }}
    >
      <div style={{ height: "100%" }}>
        <ResponsiveBar
          data={data}
          keys={keys?.filter((_,ind)=>ind!==0)}
          indexBy={keys[0]}
          layout={layout}
          groupMode={groupMode}
          margin={{ top: 40, right: 20, bottom: 50, left: 60 }}
          padding={0.3}
          colors={{ scheme: colorScheme }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          enableLabel={showLabels}
        />
      </div>
    </div>
  );
};
