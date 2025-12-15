import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./NavBar.css";

const Navbar = () => {
  const { currentUser: user, logout } = useAuth();
  const navigate = useNavigate();

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    const body = document.body;
    body.classList.toggle("dark-mode", isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  const handleThemeToggle = () => {
    setIsDarkMode((prev) => !prev);
  };

  const getDisplayName = () => {
    if (!user) return "";
    return user.name || "User";
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* --- 1. Logo (LEFT) --- */}
        <Link to="/" className="navbar-logo">
          <span className="material-symbols-outlined logo-icon">
            departure_board
          </span>
          <span className="logo-text">BusBooker</span>
        </Link>

        {/* --- 2. Main Navigation (CENTER) --- */}
        <ul className="nav-menu">
          <li>
            <Link to="/" className="nav-link">
              Home
            </Link>
          </li>
          {/* Note: Removed 'Tickets' link as search is primary action */}
          <li>
            <Link to="/my-bookings" className="nav-link">
              My Bookings
            </Link>
          </li>
          <li>
            <Link to="/contact" className="nav-link">
              Contact
            </Link>
          </li>
        </ul>

        {/* --- 3. Actions (RIGHT) --- */}
        <div className="nav-actions">
          {/* Theme Toggle is now part of the action group */}
          <button
            className="theme-toggle-btn"
            onClick={handleThemeToggle}
            title="Toggle Dark Mode"
          >
            {isDarkMode ? (
              <span className="material-symbols-outlined">light_mode</span>
            ) : (
              <span className="material-symbols-outlined">dark_mode</span>
            )}
          </button>

          {user ? (
            <div className="auth-group">
              <span className="user-greeting">
                <span className="material-symbols-outlined user-icon">
                  person
                </span>
                {getDisplayName()}
              </span>

              <button onClick={handleLogout} className="btn-auth logout">
                <span className="material-symbols-outlined">logout</span>
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login">
              {/* CTA Button is now primary visually */}
              <button className="btn-auth login">
                <span className="material-symbols-outlined">lock_open</span>
                Sign In
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
