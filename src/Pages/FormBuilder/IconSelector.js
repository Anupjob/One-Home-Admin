import React from "react";
import "../../css/IconSelector.css";

export const iconList = [
  "house", "gear", "check-circle", "exclamation-triangle", "star", 
  "search", "trash", "cloud", "globe", "tools", "zoom-in", "zoom-out",
  "person", "person-fill", "person-circle", "person-check", "person-check-fill", 
  "person-dash", "person-dash-fill", "person-exclamation", "person-plus", 
  "person-plus-fill", "person-x", "person-x-fill", "person-lock", "person-bounding-box", 
  "person-gear", "person-video", "person-video2", "person-video3", "person-lines-fill", 
  "person-rolodex", "person-hearts", "person-vcard", "person-vcard-fill", "person-workspace",
  "bag", "bag-fill", "bag-check", "bag-check-fill", "bag-plus", "bag-plus-fill", 
  "bag-dash", "bag-dash-fill", "bag-x", "bag-x-fill", "bag-heart", "bag-heart-fill", 
  "cart", "cart-plus", "cart-plus-fill", "cash", "cash-coin", "currency-dollar", 
  "currency-exchange", "piggy-bank", "wallet", "wallet2", "coin", "bank", "bank2",
  "calendar", "calendar-plus", "calendar-plus-fill",
  "chat", "chat-fill", "chat-dots", "chat-dots-fill", "chat-left", "chat-left-fill", 
  "chat-left-dots", "chat-left-dots-fill", "chat-right", "chat-right-fill", 
  "chat-right-dots", "chat-right-dots-fill", "chat-square", "chat-square-fill", 
  "chat-square-dots", "chat-square-dots-fill", "chat-text", "chat-text-fill", 
  "envelope", "envelope-fill", "envelope-open", "envelope-open-fill", 
  "envelope-check", "envelope-check-fill", "envelope-dash", "envelope-dash-fill", 
  "envelope-exclamation", "envelope-exclamation-fill", "envelope-heart", 
  "envelope-heart-fill", "envelope-paper", "envelope-paper-fill", "envelope-plus", 
  "envelope-plus-fill", "envelope-slash", "envelope-slash-fill", "envelope-x", 
  "envelope-x-fill", "megaphone", "megaphone-fill",
  "book", "book-fill", "book-half", "bookmarks", "bookmarks-fill", 
  "bookmark", "bookmark-fill", "bookmark-star", "bookmark-star-fill", 
  "bookmark-plus", "bookmark-plus-fill",
  "card-checklist", "card-list", "card-heading", "card-image", 
  "clipboard", "clipboard-fill", "clipboard-check", "clipboard-data", 
  "clipboard-heart", "clipboard-minus", "clipboard-plus", "clipboard-pulse", 
  "clipboard-x", "clipboard2", "clipboard2-check", "clipboard2-data", 
  "clipboard2-fill", "clipboard2-heart", "clipboard2-minus", 
  "clipboard2-plus", "clipboard2-pulse", "clipboard2-x",
  "file", "file-fill", "file-earmark", "file-earmark-fill", "file-plus", "file-plus-fill", 
  "file-minus", "file-minus-fill", "file-check", "file-check-fill", "file-x", "file-x-fill", 
  "file-earmark-plus", "file-earmark-plus-fill", "file-earmark-minus", "file-earmark-minus-fill", 
  "file-earmark-check", "file-earmark-check-fill", "file-earmark-x", "file-earmark-x-fill", 
  "file-text", "file-text-fill", "file-earmark-text", "file-earmark-text-fill", 
  "file-code", "file-code-fill", "file-earmark-code", "file-earmark-code-fill", 
  "file-lock", "file-lock-fill", "file-earmark-lock", "file-earmark-lock-fill", 
  "file-earmark-medical", "file-earmark-medical-fill", "file-arrow-down", 
  "file-arrow-down-fill", "file-earmark-arrow-down", "file-earmark-arrow-down-fill", 
  "file-arrow-up", "file-arrow-up-fill", "file-earmark-arrow-up", "file-earmark-arrow-up-fill",
  "building", "building-add", "building-check", "building-dash", "building-down", 
  "building-exclamation", "building-fill", "building-gear", "building-lock", 
  "building-slash", "building-up", "building-x",
  "database", "server", "hdd", "hdd-fill", "diagram-2", "diagram-2-fill", 
  "diagram-3", "diagram-3-fill", "graph-up", "graph-up-arrow", "graph-down", 
  "graph-down-arrow", "bar-chart", "bar-chart-fill", "bar-chart-line", 
  "bar-chart-line-fill", "pie-chart", "pie-chart-fill",
  "plus", "plus-lg", "plus-circle", "plus-circle-fill", "plus-square", "plus-square-fill", 
  "file-plus", "file-plus-fill", "file-earmark-plus", "file-earmark-plus-fill", 
  "person-plus", "person-plus-fill", "calendar-plus", "calendar-plus-fill", 
  "clipboard-plus", "clipboard-plus-fill", "cart-plus", "cart-plus-fill", 
  "bookmark-plus", "bookmark-plus-fill", "envelope-plus", "envelope-plus-fill",
  "bell", "bell-fill", "bell-slash", "bell-slash-fill",
  "window", "window-dock", "window-sidebar", "window-stack", "window-split",
  "camera", "youtube",
  "share", "share-fill",
  "trophy", "trophy-fill",
  "hammer"
];



export default function IconSelector({ selectedIcon, onSelect }) {
  return (
    <div className="icon-grid">
      {iconList.map((icon) => (
        <div
          key={icon}
          className={`icon-box ${selectedIcon === icon ? "selected" : ""}`}
          onClick={() => onSelect(icon)}
        >
          <i className={`bi bi-${icon}`}></i>
        </div>
      ))}
    </div>
  );
}
