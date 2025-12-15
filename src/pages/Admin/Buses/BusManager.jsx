import React, { useState } from "react";
import { useData } from "../../../context/DataContext";
import { useTableManager } from "../../../hooks/useTableManager";
import PaginationControls from "../../../components/Pagination/PaginationControls";
import { toast } from "react-toastify";
import Swal from "sweetalert2"; // 1. Import SweetAlert
import "./BusManager.css";

const BusManager = () => {
  // 2. Get 'schedules' to validate if bus is in use
  const { buses, addBus, deleteBus, schedules } = useData();

  // Sort by Recent (LIFO)
  const sortedBuses = [...buses].reverse();

  const {
    currentData,
    searchTerm,
    handleSearch,
    currentPage,
    totalPages,
    rowsPerPage,
    handleRowsChange,
    changePage,
  } = useTableManager(sortedBuses, ["name", "busId"]);

  // --- FORM STATE ---
  const initialForm = {
    name: "",
    totalSeats: 24,
    seatType: "AC Seater",
    amenities: [],
  };
  const [newBus, setNewBus] = useState(initialForm);

  const amenityOptions = [
    "AC",
    "Water Bottle",
    "Blanket",
    "Charging Point",
    "WiFi",
    "TV",
  ];
  const typeOptions = ["AC Seater"];

  const handleChange = (e) => {
    setNewBus({ ...newBus, [e.target.name]: e.target.value });
  };

  const handleCheckbox = (e) => {
    const { value, checked } = e.target;
    let updated = [...newBus.amenities];
    if (checked) updated.push(value);
    else updated = updated.filter((item) => item !== value);
    setNewBus({ ...newBus, amenities: updated });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newBus.name) {
      toast.warning("Bus Operator Name is required.");
      return;
    }
    addBus(newBus);
    toast.success("Bus added successfully!");
    setNewBus(initialForm);
  };

  // --- 3. DELETE HANDLER WITH VALIDATION ---
  const handleDelete = (busId) => {
    // A. Safety Check: Is bus used in any schedule?
    const isUsedInSchedule = schedules.some((s) => s.busId === busId);

    if (isUsedInSchedule) {
      Swal.fire({
        icon: "error",
        title: "Cannot Delete Bus",
        text: "This bus is currently assigned to active Schedules. Please remove those schedules first.",
        confirmButtonColor: "#6366f1",
      });
      return;
    }

    // B. Confirmation Dialog
    Swal.fire({
      title: "Delete Bus?",
      text: "This will remove the bus from your fleet permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6366f1",
      confirmButtonText: "Yes, delete it!",
      background: "#fff",
      customClass: {
        popup: "my-swal-popup",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        deleteBus(busId);
        Swal.fire({
          title: "Deleted!",
          text: "The bus has been removed.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  return (
    <div className="bus-manager-container">
      {/* FORM SECTION */}
      <div className="bus-form-card">
        <h3>Add New Bus</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Operator Name</label>
              <input
                type="text"
                name="name"
                value={newBus.name}
                onChange={handleChange}
                placeholder="e.g. Parveen Travels"
              />
            </div>

            <div className="form-group">
              <label>Type</label>
              <select
                name="seatType"
                value={newBus.seatType}
                onChange={handleChange}
              >
                {typeOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Total Seats</label>
              <input
                type="text"
                value="24"
                disabled
                style={{ background: "#f1f5f9", cursor: "not-allowed" }}
              />
              <small style={{ color: "#94a3b8", fontSize: "11px" }}>
                Fixed 24 Seat Layout
              </small>
            </div>
          </div>

          <div className="amenities-group">
            <label
              style={{ fontSize: "13px", fontWeight: "700", color: "#64748b" }}
            >
              AMENITIES
            </label>
            <div className="amenities-grid">
              {amenityOptions.map((opt) => (
                <label key={opt} className="checkbox-label">
                  <input
                    type="checkbox"
                    value={opt}
                    checked={newBus.amenities.includes(opt)}
                    onChange={handleCheckbox}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-save">
            <span className="material-symbols-outlined">add_circle</span>
            Add Bus
          </button>
        </form>
      </div>

      {/* LIST SECTION */}
      <div className="bus-list-section">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "15px",
            alignItems: "center",
          }}
        >
          <h3>Fleet Management</h3>
          <input
            placeholder="Search Operator or ID..."
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

        <div className="bus-list-grid">
          {currentData.length > 0 ? (
            currentData.map((bus) => (
              <div key={bus.busId} className="admin-bus-card">
                <div className="bus-header">
                  <span className="bus-name">{bus.name}</span>
                  <span className="bus-id">{bus.busId}</span>
                </div>

                <span className="bus-type-badge">{bus.seatType}</span>

                <div className="amenities-list">
                  {bus.amenities?.map((am) => (
                    <span key={am} className="amenity-tag">
                      {am}
                    </span>
                  ))}
                </div>

                <div className="bus-footer">
                  <div className="seat-count">
                    <span className="material-symbols-outlined icon">
                      event_seat
                    </span>
                    <span style={{ marginBottom: "10px" }}>
                      {bus.totalSeats} Seats
                    </span>
                  </div>

                  {/* DELETE BUTTON */}
                  <button
                    className="btn-delete-icon"
                    onClick={() => handleDelete(bus.busId)}
                    title="Delete Bus"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p
              style={{
                color: "#888",
                fontStyle: "italic",
                textAlign: "center",
                width: "100%",
              }}
            >
              No buses found matching your search.
            </p>
          )}
        </div>

        {/* PAGINATION UI */}
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

export default BusManager;
