import React from "react";
import { useData } from "../../../context/DataContext";
import { Link } from "react-router-dom";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { bookings, buses, routes, schedules, users } = useData();

  // --- 1. Calculate Stats ---
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalFare || 0), 0);
  const totalBookings = bookings.length;
  const activeBuses = buses.length;
  const activeRoutes = routes.length;
  const totalUsers = users?.length || 0;

  // 2. Get 5 most recent bookings
  const recentBookings = [...bookings].reverse().slice(0, 5);

  // --- 3. Calculate Route Performance (NEW LOGIC) ---
  const routeBookingCounts = schedules.reduce((acc, schedule) => {
    // Find the corresponding route
    const route = routes.find((r) => r.routeId === schedule.routeId);
    if (!route) return acc;

    const routeKey = `${route.source} ➝ ${route.destination}`;

    // Count total seats booked on this route
    const bookingsOnRoute = bookings.filter(
      (b) => b.scheduleId === schedule.scheduleId
    );
    const seatsBooked = bookingsOnRoute.reduce(
      (sum, b) => sum + (b.seatsBooked?.length || 0),
      0
    );

    // Aggregate data
    if (!acc[routeKey]) {
      acc[routeKey] = {
        bookings: 0,
        revenue: 0,
        totalSeats: 0,
        schedulesCount: 0,
      };
    }

    acc[routeKey].bookings += bookingsOnRoute.length;
    acc[routeKey].revenue += bookingsOnRoute.reduce(
      (sum, b) => sum + b.totalFare,
      0
    );
    acc[routeKey].schedulesCount += 1;
    acc[routeKey].totalSeats += schedule.busCapacity; // Assuming schedule stores bus capacity

    return acc;
  }, {});

  // Sort routes by revenue (descending) and take top 3
  const topRoutes = Object.entries(routeBookingCounts)
    .sort(([, a], [, b]) => b.revenue - a.revenue)
    .slice(0, 3);

  // --- 4. Helper for Status Badge Class ---
  const getStatusClass = (status) => {
    switch (status) {
      case "Confirmed":
        return "status-confirmed";
      case "Pending":
        return "status-pending";
      case "Cancelled":
        return "status-cancelled";
      default:
        return "status-default";
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>
          <span className="material-symbols-outlined header-icon">
            waving_hand
          </span>
          Welcome back, Admin!
        </h1>
      </div>

      {/* STATS CARDS (Top Row - Unchanged) */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="material-symbols-outlined stat-icon revenue-icon">
            trending_up
          </span>
          <span className="stat-label">Total Transaction</span>
          <span className="stat-value text-success">
            ₹{totalRevenue.toLocaleString()}
          </span>
        </div>

        <div className="stat-card">
          <span className="material-symbols-outlined stat-icon bookings-icon">
            sell
          </span>
          <span className="stat-label">Total Bookings</span>
          <span className="stat-value">{totalBookings}</span>
        </div>

        <div className="stat-card">
          <span className="material-symbols-outlined stat-icon buses-icon">
            departure_board
          </span>
          <span className="stat-label">Active Buses</span>
          <span className="stat-value">{activeBuses}</span>
        </div>

        <div className="stat-card">
          <span className="material-symbols-outlined stat-icon routes-icon">
            alt_route
          </span>
          <span className="stat-label">Active Routes</span>
          <span className="stat-value">{activeRoutes}</span>
        </div>

        <div className="stat-card">
          <span className="material-symbols-outlined stat-icon users-icon">
            group
          </span>
          <span className="stat-label">Total Users</span>
          <span className="stat-value">{totalUsers}</span>
        </div>
      </div>

      {/* PERFORMANCE & RECENT ACTIVITY LAYOUT (Updated) */}
      <div className="dashboard-content-layout">
        {/* NEW LEFT SECTION: PERFORMANCE OVERVIEW */}
        <div className="performance-overview">
          <div className="performance-card top-routes-card">
            <h2>
              <span className="material-symbols-outlined card-header-icon">
                emoji_events
              </span>
              Top Performing Routes
            </h2>
            {topRoutes.length > 0 ? (
              <ul className="top-routes-list">
                {topRoutes.map(([routeKey, data], index) => (
                  <li key={routeKey}>
                    <span className="route-name">
                      <span className="rank-badge">{index + 1}</span>
                      {routeKey}
                    </span>
                    <span className="route-metric">
                      Revenue:{" "}
                      <span className="text-success-bold">
                        ₹{data.revenue.toLocaleString()}
                      </span>
                    </span>
                    <span className="route-metric">
                      Bookings: {data.bookings}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-data">No route performance data available.</p>
            )}
          </div>

          <div className="performance-card inventory-card">
            <h2>
              <span className="material-symbols-outlined card-header-icon">
                calendar_month
              </span>
              Schedules & Inventory
            </h2>
            <div className="inventory-stats">
              <div className="inventory-item">
                <span className="inventory-label">Total Schedules</span>
                <span className="inventory-value schedules-count">
                  {schedules.length}
                </span>
              </div>
              <div className="inventory-item">
                <span className="inventory-label">Total Bus Fleet</span>
                <span className="inventory-value buses-count">
                  {activeBuses}
                </span>
              </div>
              <div className="inventory-item">
                <span className="inventory-label">Available Routes</span>
                <span className="inventory-value routes-count">
                  {activeRoutes}
                </span>
              </div>
            </div>
            <Link to="/admin/schedules" className="btn-view-all-schedules">
              Manage All Schedules
              <span className="material-symbols-outlined">chevron_right</span>
            </Link>
          </div>
        </div>{" "}
        {/* END performance-overview */}
        {/* RECENT ACTIVITY TABLE (Right Section - Unchanged) */}
        <div className="recent-section">
          <h2>Recent Bookings ({recentBookings.length} total)</h2>
          {recentBookings.length > 0 ? (
            <table className="admin-table recent-bookings-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer ID</th>
                  <th>Route</th>
                  <th>Fare</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr key={booking.bookingId}>
                    <td className="booking-id-cell">{booking.bookingId}</td>
                    <td>{booking.customerId}</td>
                    <td>
                      {booking.travelOrigin} ➝ {booking.travelDestination}
                    </td>
                    <td className="fare-cell">₹{booking.totalFare}</td>
                    <td>
                      <span
                        className={`status-badge ${getStatusClass(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-bookings-message">
              <span className="material-symbols-outlined">info</span>
              No bookings found yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
