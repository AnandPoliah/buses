import React, { useMemo, useState } from "react";
import { useData } from "../../../context/DataContext";
import { useTableManager } from "../../../hooks/useTableManager";
import PaginationControls from "../../../components/Pagination/PaginationControls";
import Swal from "sweetalert2"; // 1. Import SweetAlert
import "./BookingManager.css";

const BookingManager = () => {
  const { bookings, cancelBooking, schedules, routes, buses } = useData();
  const [expandedRow, setExpandedRow] = useState(null);

  // --- 1. AGGREGATE DATA ---
  const tripSummaries = useMemo(() => {
    const groups = {};
    bookings.forEach((b) => {
      if (!groups[b.scheduleId]) groups[b.scheduleId] = [];
      groups[b.scheduleId].push(b);
    });

    return Object.keys(groups).map((scheduleId) => {
      const tripBookings = groups[scheduleId];
      const schedule = schedules.find((s) => s.scheduleId === scheduleId);
      const route = schedule
        ? routes.find((r) => r.routeId === schedule.routeId)
        : null;
      const bus = schedule
        ? buses.find((b) => b.busId === schedule.busId)
        : null;

      const totalSeats = bus ? bus.totalSeats : 0;
      const seatsOccupied = tripBookings.reduce(
        (acc, b) => acc + (b.status !== "Cancelled" ? b.seatsBooked.length : 0),
        0
      );
      const revenue = tripBookings.reduce(
        (acc, b) => acc + (b.status !== "Cancelled" ? b.totalFare : 0),
        0
      );

      return {
        id: scheduleId,
        routeStr: route
          ? `${route.source} ➝ ${route.destination}`
          : "Unknown Route",
        date: schedule ? schedule.departureDate : "N/A",
        time: schedule ? schedule.departureTime : "N/A",
        busName: bus ? bus.name : "Unknown Bus",
        occupancy: `${seatsOccupied}/${totalSeats}`,
        revenue: revenue,
        bookingsList: tripBookings,
      };
    });
  }, [bookings, schedules, routes, buses]);

  const {
    currentData,
    searchTerm,
    handleSearch,
    currentPage,
    totalPages,
    rowsPerPage,
    handleRowsChange,
    changePage,
  } = useTableManager(tripSummaries, ["routeStr", "busName", "date"]);

  const toggleRow = (id) => setExpandedRow(expandedRow === id ? null : id);

  // --- 2. HANDLE CANCEL WITH CONFIRMATION ---
  const handleCancel = (bookingId) => {
    Swal.fire({
      title: "Cancel Booking?",
      text: "Are you sure you want to cancel this booking? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444", // Red for danger action
      cancelButtonColor: "#6366f1", // Blue for keep
      confirmButtonText: "Yes, Cancel it!",
      cancelButtonText: "No, Keep it",
      background: "#fff",
      customClass: {
        popup: "my-swal-popup",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        // Perform the actual cancellation
        cancelBooking(bookingId);

        // Show Success Feedback
        Swal.fire({
          title: "Cancelled!",
          text: "The booking has been cancelled successfully.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  return (
    <div className="booking-manager">
      <div className="bm-header">
        <div className="header-title">
          <h3>Trip Manifests</h3>
          <span className="badge-count">
            {tripSummaries.length} Active Trips
          </span>
        </div>
        <div className="search-box">
          <span className="material-symbols-outlined search-icon">search</span>
          <input
            placeholder="Search Route, Bus, or Date..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="master-table">
          <thead>
            <tr>
              <th style={{ width: "50px" }}></th>
              <th style={{ width: "15%" }}>Date & Time</th>
              <th style={{ width: "20%" }}>Route</th>
              <th style={{ width: "20%" }}>Bus Operator</th>
              <th style={{ width: "15%" }}>Occupancy</th>
              <th style={{ width: "15%" }}>Revenue</th>
              <th style={{ width: "10%" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((trip) => (
              <React.Fragment key={trip.id}>
                {/* MASTER ROW */}
                <tr
                  className={`master-row ${
                    expandedRow === trip.id ? "expanded" : ""
                  }`}
                  onClick={() => toggleRow(trip.id)}
                >
                  <td className="expand-cell">
                    <span className="material-symbols-outlined chevron">
                      {expandedRow === trip.id ? "expand_less" : "expand_more"}
                    </span>
                  </td>
                  <td>
                    <div className="fw-bold">{trip.date}</div>
                    <div className="sub-text">{trip.time}</div>
                  </td>
                  <td className="route-text">{trip.routeStr}</td>
                  <td>{trip.busName}</td>
                  <td>
                    <span className="occupancy-badge">
                      {trip.occupancy} Seats
                    </span>
                  </td>
                  <td className="revenue-text">
                    ₹{trip.revenue.toLocaleString()}
                  </td>
                  <td>
                    <span className="status-dot active"></span> Active
                  </td>
                </tr>

                {/* DETAIL ROW */}
                {expandedRow === trip.id && (
                  <tr className="detail-row">
                    <td colSpan="7">
                      <div className="nested-table-wrapper">
                        <table className="nested-table">
                          <colgroup>
                            <col style={{ width: "18%" }} />
                            <col style={{ width: "22%" }} />
                            <col style={{ width: "10%" }} />
                            <col style={{ width: "15%" }} />
                            <col style={{ width: "10%" }} />
                            <col style={{ width: "12%" }} />
                            <col style={{ width: "13%" }} />
                          </colgroup>
                          <thead>
                            <tr>
                              <th>Booking ID</th>
                              <th>Passenger Name</th>
                              <th>Seat</th>
                              <th>Age/Gender</th>
                              <th>Fare</th>
                              <th>Status</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {trip.bookingsList.map((b) => (
                              <React.Fragment key={b.bookingId}>
                                {b.passengerDetails &&
                                b.passengerDetails.length > 0 ? (
                                  b.passengerDetails.map((p, pIdx) => (
                                    <tr
                                      key={`${b.bookingId}-${pIdx}`}
                                      className="passenger-row"
                                    >
                                      <td className="mono-text">
                                        {pIdx === 0 ? (
                                          b.bookingId
                                        ) : (
                                          <span className="dim-line">|</span>
                                        )}
                                      </td>
                                      <td className="p-name">{p.name}</td>
                                      <td>
                                        <span className="seat-chip">
                                          {p.seatNumber}
                                        </span>
                                      </td>
                                      <td>
                                        {p.age}, {p.gender}
                                      </td>
                                      <td>
                                        {pIdx === 0 ? `₹${b.totalFare}` : ""}
                                      </td>
                                      <td>
                                        {pIdx === 0 && (
                                          <span
                                            className={`status-pill ${b.status.toLowerCase()}`}
                                          >
                                            {b.status}
                                          </span>
                                        )}
                                      </td>
                                      <td>
                                        {pIdx === 0 && (
                                          // --- 3. UPDATED BUTTON ---
                                          <button
                                            className="btn-cancel-tiny"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleCancel(b.bookingId);
                                            }}
                                            disabled={b.status === "Cancelled"}
                                          >
                                            {b.status === "Cancelled"
                                              ? "Cancelled"
                                              : "Cancel"}
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr className="legacy-row">
                                    <td className="mono-text">{b.bookingId}</td>
                                    <td colSpan="6" className="legacy-text">
                                      Legacy Data • Seats:{" "}
                                      {b.seatsBooked.join(", ")}
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {currentData.length === 0 && (
          <div className="no-results">No trips found matching filters.</div>
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
  );
};

export default BookingManager;
