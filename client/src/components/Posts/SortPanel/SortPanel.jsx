import React from "react";
import c from "./SortPanel.module.scss";

function SortPanel({sortBy, setSortBy}) {
  return (
    <div className={c.sidebarSort}>
      <h3>Sort</h3>
      <button
        className={`${c.sortButton} ${sortBy === "newest" ? c.active : ""}`}
        onClick={() => setSortBy("newest")}
      >
        New
      </button>
      <button
        className={`${c.sortButton} ${sortBy === "oldest" ? c.active : ""}`}
        onClick={() => setSortBy("oldest")}
      >
        Old
      </button>
      <button
        className={`${c.sortButton} ${sortBy === "likes" ? c.active : ""}`}
        onClick={() => setSortBy("likes")}
      >
        By likes
      </button>
    </div>
  );
}

export default SortPanel;
