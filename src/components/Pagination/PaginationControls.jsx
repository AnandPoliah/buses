import React from "react";

const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
  rowsPerPage,
  onRowsChange,
}) => {
  return (
    <div className="pagination-container">
      {/* Left: Rows Selector */}
      <div className="rows-selector">
        <span>Show:</span>
        <select
          className="pagination-select"
          value={rowsPerPage}
          onChange={onRowsChange}
        >
          <option value="8">8</option>
          <option value="20">20</option>
          <option value="40">40</option>
        </select>
      </div>

      {/* Right: Navigation Buttons */}
      <div className="page-nav-group">
        <button
          className="btn-page"
          onClick={() => onPageChange(-1)}
          disabled={currentPage === 1}
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>

        <span className="page-indicator">
          Page <b>{currentPage}</b> of {totalPages}
        </span>

        <button
          className="btn-page"
          onClick={() => onPageChange(1)}
          disabled={currentPage === totalPages}
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
    </div>
  );
};

export default PaginationControls;
