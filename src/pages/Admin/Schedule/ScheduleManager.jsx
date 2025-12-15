import React, { useState, useMemo } from "react";
import { useData } from "../../../context/DataContext";
import { useTableManager } from "../../../hooks/useTableManager";
import PaginationControls from "../../../components/Pagination/PaginationControls";
import { toast } from "react-toastify";
import Swal from "sweetalert2"; // Import SweetAlert2
import "./ScheduleManager.css";

// HELPER: Auto-Calculate Arrival Time
const calculateArrival = (depTime, durationStr) => {
  if (!depTime || !durationStr) return "";

  let [hours, minutes] = depTime.split(":").map(Number);
  const durHours = parseInt(durationStr.match(/(\d+)h/)?.[1] || 0);
  const durMins = parseInt(durationStr.match(/(\d+)m/)?.[1] || 0);

  const totalMins = minutes + durMins;
  const extraHours = Math.floor(totalMins / 60);
  const finalMins = totalMins % 60;
  let finalHours = (hours + durHours + extraHours) % 24;

  return `${String(finalHours).padStart(2, "0")}:${String(finalMins).padStart(
    2,
    "0"
  )}`;
};

const ScheduleManager = () => {
  // 1. Get 'bookings' to validate deletion safety
  const { schedules, routes, buses, bookings, addSchedule, deleteSchedule } =
    useData();

  // --- LOCAL FILTERS & STATE ---
  const [filterRoute, setFilterRoute] = useState("all");
  const [filterBus, setFilterBus] = useState("all");
  const [expandedBusId, setExpandedBusId] = useState(null);

  const toggleAccordion = (busId) => {
    setExpandedBusId((currentId) => (currentId === busId ? null : busId));
  };

  // --- DATA PROCESSING ---
  const groupedSchedules = useMemo(() => {
    // 1. REVERSE Schedules for LIFO (Most recent first)
    const sortedDetails = [...schedules].reverse();

    const groups = sortedDetails.reduce((acc, schedule) => {
      const routeMatch =
        filterRoute === "all" || schedule.routeId === filterRoute;
      const busMatch = filterBus === "all" || schedule.busId === filterBus;

      if (!routeMatch || !busMatch) return acc;

      const busId = schedule.busId;
      if (!acc[busId]) {
        acc[busId] = {
          busDetails: buses.find((b) => b.busId === busId),
          schedules: [],
        };
      }

      const route = routes.find((r) => r.routeId === schedule.routeId); // Lookup Route
      acc[busId].schedules.push({ ...schedule, route });
      return acc;
    }, {});

    // 2. Return groups (already effectively sorted by recent insertion due to reduce order)
    return Object.values(groups);
  }, [schedules, routes, buses, filterRoute, filterBus]);

  // --- PAGINATION ---
  const {
    currentData: currentBusGroups,
    currentPage,
    totalPages,
    rowsPerPage,
    handleRowsChange,
    changePage,
  } = useTableManager(groupedSchedules, []);

  // --- FORM STATE ---
  const [isBulk, setIsBulk] = useState(false);
  const [repeatDays, setRepeatDays] = useState(1);
  const [form, setForm] = useState({
    routeId: "",
    busId: "",
    departureDate: "",
    departureTime: "",
    fareMultiplier: 1.0,
  });

  const selectedRoute = routes.find((r) => r.routeId === form.routeId);
  const calculatedArrival = useMemo(() => {
    if (selectedRoute && form.departureTime) {
      return calculateArrival(form.departureTime, selectedRoute.duration);
    }
    return "Auto-Calc";
  }, [form.departureTime, selectedRoute]);

  // --- HANDLERS ---

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !form.routeId ||
      !form.busId ||
      !form.departureDate ||
      !form.departureTime
    ) {
      toast.warning("Missing Fields");
      return;
    }

    let count = 0;
    const baseDate = new Date(form.departureDate);

    for (let i = 0; i < (isBulk ? repeatDays : 1); i++) {
      const currentDate = new Date(baseDate);
      currentDate.setDate(baseDate.getDate() + i);
      const dateStr = currentDate.toISOString().split("T")[0];

      addSchedule({
        ...form,
        departureDate: dateStr,
        arrivalTime: calculatedArrival,
        status: "Active",
      });
      count++;
    }

    toast.success(`${count} Schedule(s) Published!`);
    setForm({ ...form, departureDate: "" });
  };

  // --- NEW: DELETE HANDLER WITH CONFIRMATION ---
  const handleDelete = (id) => {
    // 1. Safety Check: Are there active bookings?
    const hasActiveBookings = bookings.some(
      (b) => b.scheduleId === id && b.status !== "Cancelled"
    );

    if (hasActiveBookings) {
      Swal.fire({
        icon: "error",
        title: "Cannot Delete Schedule",
        text: "Passengers have already booked tickets for this trip. Please cancel their bookings first.",
        confirmButtonColor: "#6366f1",
      });
      return;
    }

    // 2. SweetAlert Confirmation
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
        deleteSchedule(id);
        Swal.fire({
          title: "Deleted!",
          text: "The schedule has been removed.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  return (
    <div className="schedule-container">
      {/* FORM SECTION */}
      <div className="schedule-form-card">
        <div className="form-header-row">
          <h3>Schedule Operations</h3>
          <label className="bulk-toggle">
            <input
              type="checkbox"
              checked={isBulk}
              onChange={(e) => setIsBulk(e.target.checked)}
            />
            Repeat Daily?
          </label>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Form Inputs (Route, Bus) */}
          <div className="form-row">
            <div className="form-group">
              <label>Route</label>
              <select
                name="routeId"
                value={form.routeId}
                onChange={(e) => setForm({ ...form, routeId: e.target.value })}
              >
                <option value="">Select Route</option>
                {routes.map((r) => (
                  <option key={r.routeId} value={r.routeId}>
                    {r.source} - {r.destination} ({r.duration})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Bus</label>
              <select
                name="busId"
                value={form.busId}
                onChange={(e) => setForm({ ...form, busId: e.target.value })}
              >
                <option value="">Select Bus</option>
                {buses.map((b) => (
                  <option key={b.busId} value={b.busId}>
                    {b.name} ({b.seatType})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Form Inputs (Date, Time, Multiplier) */}
          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                value={form.departureDate}
                onChange={(e) =>
                  setForm({ ...form, departureDate: e.target.value })
                }
              />
            </div>

            {isBulk && (
              <div className="form-group small">
                <label>Days</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={repeatDays}
                  onChange={(e) => setRepeatDays(Number(e.target.value))}
                />
              </div>
            )}

            <div className="form-group">
              <label>Dep. Time</label>
              <input
                type="time"
                value={form.departureTime}
                onChange={(e) =>
                  setForm({ ...form, departureTime: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Arr. Time</label>
              <input
                type="text"
                value={calculatedArrival}
                disabled
                className="disabled-input"
              />
            </div>

            <div className="form-group small">
              <label>Fare (x)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="10"
                value={form.fareMultiplier}
                onChange={(e) =>
                  setForm({
                    ...form,
                    fareMultiplier: parseFloat(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <button type="submit" className="btn-save-route">
            {isBulk ? `Generate ${repeatDays} Schedules` : "Publish Schedule"}
          </button>
        </form>
      </div>

      {/* LIST SECTION */}
      <div>
        <div className="list-header">
          <h3>Bus Schedules ({groupedSchedules.length} Unique Buses)</h3>
          <div className="filters">
            <select
              className="pagination-select"
              onChange={(e) => setFilterRoute(e.target.value)}
            >
              <option value="all">All Routes</option>
              {routes.map((r) => (
                <option key={r.routeId} value={r.routeId}>
                  {r.source}-{r.destination}
                </option>
              ))}
            </select>
            <select
              className="pagination-select"
              onChange={(e) => setFilterBus(e.target.value)}
            >
              <option value="all">All Buses</option>
              {buses.map((b) => (
                <option key={b.busId} value={b.busId}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Accordion List */}
        <div className="accordion-container">
          {currentBusGroups.map((group) => {
            const busId = group.busDetails?.busId;
            const isExpanded = expandedBusId === busId;

            return (
              <div
                key={busId || "unknown-bus"}
                className={`accordion-item ${isExpanded ? "expanded" : ""}`}
              >
                <div
                  className="accordion-header"
                  onClick={() => toggleAccordion(busId)}
                >
                  <div className="header-info">
                    <h4>
                      {group.busDetails?.name || "Bus Details Missing"} (
                      {group.busDetails?.seatType || "N/A"})
                    </h4>
                    <span className="schedule-count-badge">
                      {group.schedules.length} Trips
                    </span>
                  </div>
                  <span className="material-symbols-outlined accordion-icon">
                    {isExpanded ? "expand_less" : "expand_more"}
                  </span>
                </div>

                {isExpanded && (
                  <div className="accordion-content">
                    <div className="schedule-table-wrapper">
                      <table className="schedule-table">
                        <thead>
                          <tr>
                            <th>Route</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Fare (x)</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.schedules.map((s) => (
                            <tr key={s.scheduleId}>
                              <td data-label="Route" className="route-cell">
                                {s.route
                                  ? `${s.route.source} ➝ ${s.route.destination}`
                                  : "Unknown"}
                              </td>
                              <td data-label="Date">{s.departureDate}</td>
                              <td data-label="Time">
                                {s.departureTime} -{" "}
                                <span className="arr-time">
                                  {s.arrivalTime}
                                </span>
                              </td>
                              <td
                                data-label="Fare"
                                style={{ fontWeight: "bold" }}
                              >
                                {s.fareMultiplier}x
                              </td>
                              <td data-label="Status">
                                <span
                                  className={`table-status-badge status-${s.status.toLowerCase()}`}
                                >
                                  {s.status}
                                </span>
                              </td>
                              <td data-label="Actions">
                                {/* DELETE BUTTON USING NEW HANDLER */}
                                <button
                                  className="btn-delete-sched-inline"
                                  onClick={(e) => {
                                    e.stopPropagation(); // Stop accordion toggle
                                    handleDelete(s.scheduleId); // Trigger SweetAlert
                                  }}
                                  title="Cancel Schedule"
                                >
                                  <span className="material-symbols-outlined">
                                    delete
                                  </span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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

export default ScheduleManager;
