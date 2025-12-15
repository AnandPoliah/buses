import React from "react";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import Navbar from "../../components/NavBar/NavBar";
import "./MyBookings.css";

const MyBookings = () => {
  const { bookings, schedules, routes, cancelBooking } = useData();
  const { currentUser } = useAuth();

  // 1. FILTER: Show only THIS user's bookings
  const myBookings = bookings.filter(
    (b) => b.customerId === (currentUser?.customerId || currentUser?.id)
  );

  // 2. HELPER: Join Data to get Route Name & Date
  const getTripInfo = (scheduleId) => {
    const schedule = schedules.find((s) => s.scheduleId === scheduleId);
    const route = schedule
      ? routes.find((r) => r.routeId === schedule.routeId)
      : null;
    return {
      date: schedule?.departureDate || "N/A",
      time: schedule?.departureTime || "N/A",
      source: route?.source || "Unknown",
      dest: route?.destination || "Unknown",
    };
  };

  const handleCancel = (id) => {
    if (window.confirm("Are you sure you want to cancel this ticket?")) {
      cancelBooking(id);
      toast.info("Booking cancelled.");
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <div className="my-bookings-container">
        <h2>My Bookings</h2>

        {myBookings.length === 0 ? (
          <div className="empty-state">
            <p>You haven't booked any trips yet.</p>
          </div>
        ) : (
          <table className="user-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Route</th>
                <th>Date & Time</th>
                <th>Seats</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {myBookings.map((booking) => {
                const info = getTripInfo(booking.scheduleId);
                const isCancelled = booking.status === "Cancelled";

                return (
                  <tr
                    key={booking.bookingId}
                    className={isCancelled ? "faded-row" : ""}
                  >
                    <td className="mono">{booking.bookingId}</td>
                    <td>
                      <span className="route-text">
                        {info.source} ➝ {info.dest}
                      </span>
                    </td>
                    <td>
                      <div>{info.date}</div>
                      <small>{info.time}</small>
                    </td>
                    <td>{booking.seatsBooked.join(", ")}</td>
                    <td style={{ fontWeight: "bold" }}>₹{booking.totalFare}</td>
                    <td>
                      <span
                        className={`status-badge ${booking.status.toLowerCase()}`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-user-cancel"
                        onClick={() => handleCancel(booking.bookingId)}
                        disabled={isCancelled}
                      >
                        {isCancelled ? "Cancelled" : "Cancel Ticket"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
