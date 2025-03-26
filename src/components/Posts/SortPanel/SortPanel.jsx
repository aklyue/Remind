import React from "react";
import c from "./SortPanel.module.scss";

function SortPanel({sortBy, setSortBy}) {
  return (
    <div className={c.sidebarSort}>
      <h3>Сортировка</h3>
      <button
        className={`${c.sortButton} ${sortBy === "newest" ? c.active : ""}`}
        onClick={() => setSortBy("newest")}
      >
        Новые
      </button>
      <button
        className={`${c.sortButton} ${sortBy === "oldest" ? c.active : ""}`}
        onClick={() => setSortBy("oldest")}
      >
        Старые
      </button>
      <button
        className={`${c.sortButton} ${sortBy === "likes" ? c.active : ""}`}
        onClick={() => setSortBy("likes")}
      >
        По лайкам
      </button>
    </div>
  );
}

export default SortPanel;
