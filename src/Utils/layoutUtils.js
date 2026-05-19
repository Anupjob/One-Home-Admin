export function isOverlapping(layout, newItem) {
  return layout.some((item) => {
    return !(
      item.x + item.w <= newItem.x ||
      newItem.x + newItem.w <= item.x ||
      item.y + item.h <= newItem.y ||
      newItem.y + newItem.h <= item.y
    );
  });
}

export function getNewWidgetLayout(layout, type) {
  const widgetSizeMap = {
    Card: { w: 2, h: 4 },
    Chart: { w: 6, h: 6 },
    Graph: { w: 6, h: 6 },
    Table: { w: 4, h: 7 },
    Banner: { w: 12, h: 4 }, 
  };

  // Use defined size or fallback to default
  const { w, h } = widgetSizeMap[type] || { w: 4, h: 4 }; // ✅ Default = 4×4

  // Try all x and y positions to find a non-overlapping spot
  for (let y = 0; y < 100; y++) {
    for (let x = 0; x <= 12 - w; x++) {
      const newItem = { x, y, w, h };
      if (!isOverlapping(layout, newItem)) {
        return newItem;
      }
    }
  }

  // fallback if no space found
  return {
    x: 0,
    y: getNextAvailableY(layout),
    w,
    h,
  };
}

function getNextAvailableY(layout) {
  if (layout.length === 0) return 0;
  return Math.max(...layout.map((item) => item.y + item.h));
}
