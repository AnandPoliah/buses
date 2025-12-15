import React, { useState } from "react";
import { useData } from "../../../context/DataContext";
import { useTableManager } from "../../../hooks/useTableManager";
import PaginationControls from "../../../components/Pagination/PaginationControls";
import { toast } from "react-toastify";
import "./RouteManager.css";
import Swal from "sweetalert2";

const RouteManager = () => {
  const { routes, addRoute, deleteRoute, schedules } = useData();

  // Sort by Recent (LIFO)
  const sortedRoutes = [...routes].reverse();

  const {
    currentData,
    searchTerm,
    handleSearch,
    currentPage,
    totalPages,
    rowsPerPage,
    handleRowsChange,
    changePage,
  } = useTableManager(sortedRoutes, ["source", "destination"]);

  const [newRoute, setNewRoute] = useState({
    source: "",
    destination: "",
    distance: "",
    duration: "",
    baseFare: "",
  });

  const handleChange = (e) => {
    setNewRoute({ ...newRoute, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. Basic Empty Check
    if (
      !newRoute.source ||
      !newRoute.destination ||
      !newRoute.baseFare ||
      !newRoute.duration
    ) {
      toast.warning("Please fill in all fields.");
      return;
    }

    // --- 2. TIME FORMAT VALIDATION (NEW) ---
    // Regex: Matches "8h", "8h 30m", "12h 05m"
    // Explain: ^\d+h means starts with digits+h. ( \d+m)? means optionally space+digits+m at the end.
    const timePattern = /^\d+h( \d+m)?$/;

    if (!timePattern.test(newRoute.duration)) {
      toast.error("Invalid Duration format! Use '8h' or '8h 30m'.");
      return;
    }

    addRoute(newRoute);
    toast.success("Route added successfully!");

    setNewRoute({
      source: "",
      destination: "",
      distance: "",
      duration: "",
      baseFare: "",
    });
  };

  const handleDelete = (id) => {
    const isUsedInSchedule = schedules.some((s) => s.routeId === id);

    if (isUsedInSchedule) {
      Swal.fire({
        icon: "error",
        title: "Cannot Delete Route",
        text: "This route is currently being used by active Bus Schedules. You must delete those schedules first.",
        confirmButtonColor: "#6366f1",
      });
      return;
    }

    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6366f1",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      background: "#fff",
      customClass: {
        popup: "my-swal-popup",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        deleteRoute(id);
        Swal.fire({
          title: "Deleted!",
          text: "The route has been removed.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  return (
    <div className="route-manager-container">
      {/* FORM SECTION */}
      <div className="route-form-card">
        <h3>Add New Route</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Source City</label>
              <input
                type="text"
                name="source"
                value={newRoute.source}
                onChange={handleChange}
                placeholder="e.g. Chennai"
              />
            </div>
            <div className="form-group">
              <label>Destination City</label>
              <input
                type="text"
                name="destination"
                value={newRoute.destination}
                onChange={handleChange}
                placeholder="e.g. Madurai"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Distance (km)</label>
              <input
                type="number"
                name="distance"
                value={newRoute.distance}
                onChange={handleChange}
                placeholder="e.g. 450"
              />
            </div>
            <div className="form-group">
              <label>Duration</label>
              <input
                type="text"
                name="duration"
                value={newRoute.duration}
                onChange={handleChange}
                placeholder="e.g. 7h 30m"
              />
              <small style={{ color: "#64748b", fontSize: "11px" }}>
              </small>
            </div>
            <div className="form-group">
              <label>Base Fare (₹)</label>
              <input
                type="number"
                name="baseFare"
                value={newRoute.baseFare}
                onChange={handleChange}
                placeholder="e.g. 800"
              />
            </div>
          </div>

          <button type="submit" className="btn-save-route">
            <span className="material-symbols-outlined">add_circle</span>
            Save Route
          </button>
        </form>
      </div>

      {/* LIST SECTION */}
      <div className="route-list-section">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "15px",
            alignItems: "center",
          }}
        >
          <h3>Routes List</h3>
          <input
            placeholder="Search City..."
            value={searchTerm}
            onChange={handleSearch}
            style={{
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              width: "250px",
            }}
          />
        </div>

        <div className="routes-grid">
          {currentData.length > 0 ? (
            currentData.map((route) => (
              <div key={route.routeId} className="admin-route-card">
                <div className="route-card-header">
                  <div className="route-locations">
                    <span className="city">{route.source}</span>
                    <span className="material-symbols-outlined arrow">
                      arrow_forward
                    </span>
                    <span className="city">{route.destination}</span>
                  </div>
                  <span className="fare-badge">₹{route.baseFare}</span>
                </div>

                <div className="route-details">
                  <span>
                    <span className="material-symbols-outlined icon">
                      schedule
                    </span>
                    {route.duration || "N/A"}
                  </span>
                  <span>
                    <span className="material-symbols-outlined icon">
                      straighten
                    </span>
                    {route.distance ? `${route.distance} km` : "N/A"}
                  </span>
                </div>

                <div className="route-footer">
                  <span className="route-id">ID: {route.routeId}</span>
                  <button
                    className="btn-delete-icon"
                    onClick={() => handleDelete(route.routeId)}
                    title="Delete Route"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: "#888", fontStyle: "italic" }}>
              No routes found matching your search.
            </p>
          )}
        </div>

        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={changePage}
          rowsPerPage={rowsPerPage}
          onRowsChange={handleRowsChange}
        />
      </div>
    </div>
  );
};

export default RouteManager;
