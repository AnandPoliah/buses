import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// --- Contexts ---
import { DataProvider } from "./context/DataContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

// --- Public Pages ---
import HomePage from "./pages/Home/HomePage";
import LoginPage from "./pages/Auth/LoginPage";
import SignupPage from "./pages/Auth/SignUpPage";
import SearchResults from "./pages/SearchResults/SearchResults";
import BusLayout from "./pages/BusLayout/BusLayout";
// src/App.js
import MyBookings from "./pages/MyBookings/MyBookings";

// ... inside <Routes> ...

// --- Admin Components ---
import AdminLayout from "./pages/Admin/AdminLayout";
import AdminDashboard from "./pages/Admin/Dashboard/AdminDashboard";
import RouteManager from "./pages/Admin/Routes/RouteManager"; // <--- 1. Import this
import BusManager from "./pages/Admin/Buses/BusManager";
import ScheduleManager from "./pages/Admin/Schedule/ScheduleManager";
import BookingManager from "./pages/Admin/Bookings/BookingManager";
import Checkout from "./pages/Checkout/Checkout";
import PaymentPage from "./pages/Payment/PaymentPage";
import AIInsights from "./pages/Admin/AIInsight/AIInsight";

// --- Protected Route Component ---
const ProtectedRoute = ({ allowedRoles, children }) => {
  const { isLoggedIn, userRole } = useAuth();

  if (!isLoggedIn) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect to home if user role is not allowed
    return <Navigate to="/" replace />;
  }

  // If all checks pass, render the children or the nested routes (Outlet)
  return children ? children : <Outlet />;
};

function App() {
  return (
    <Router>
      <DataProvider>
        <AuthProvider>
          <div className="app-layout">
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
            />

            <main style={{ minHeight: "80vh" }}>
              <Routes>
                {/* === PUBLIC ROUTES === */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/search-results" element={<SearchResults />} />
                <Route path="/bus/:scheduleId" element={<BusLayout />} />

                {/* === PROTECTED CUSTOMER ROUTES === */}
                <Route element={<ProtectedRoute allowedRoles={["customer", "admin"]} />}>
                  <Route path="/my-bookings" element={<MyBookings />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/payment" element={<PaymentPage />} />
                </Route>

                {/* === ADMIN ROUTES === */}
                {/* 2. Nest routes under AdminLayout within ProtectedRoute */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="routes" element={<RouteManager />} />
                  <Route path="buses" element={<BusManager />} />
                  <Route path="schedules" element={<ScheduleManager />} />
                  <Route path="bookings" element={<BookingManager />} />
                  <Route path="Ai" element={<AIInsights/>}/>
                </Route>
              </Routes>
            </main>
          </div>
        </AuthProvider>
      </DataProvider>
    </Router>
  );
}

export default App;
