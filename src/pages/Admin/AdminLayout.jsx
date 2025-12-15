import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./AdminLayout.css";

// ❌ REMOVE THIS IMPORT: Do not import specific pages here
// import AdminDashboard from "./Dashboard/AdminDashboard";

const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="admin-container">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <span className="material-symbols-outlined">shield_person</span>
          AdminPanel
        </div>

        <ul className="sidebar-menu">
          <li>
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
            >
              <span className="material-symbols-outlined">dashboard</span>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/routes"
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
            >
              <span className="material-symbols-outlined">map</span>
              Routes
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/buses"
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
            >
              <span className="material-symbols-outlined">directions_bus</span>
              Buses
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/schedules"
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
            >
              <span className="material-symbols-outlined">calendar_month</span>
              Schedules
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/bookings"
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
            >
              <span className="material-symbols-outlined">receipt_long</span>
              Bookings
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/Ai"
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
            >
              <span className="material-symbols-outlined">robot</span>
              AI summary
            </NavLink>
          </li>
        </ul>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-content">
        <header className="admin-header">
          <h1>Admin Control Center</h1>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </header>

        {/* ✅ THE FIX: Use Outlet here! */}
        {/* This allows React Router to render Dashboard, Routes, or Buses here depending on the URL */}
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
