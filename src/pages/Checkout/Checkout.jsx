import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import Navbar from "../../components/NavBar/NavBar";
import "./Checkout.css";

const Checkout = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const { schedules, routes, buses } = useData();
  const { currentUser } = useAuth();

  // --- 1. SAFELY EXTRACT DATA ---
  const scheduleId = state?.scheduleId;
  const selectedSeats = state?.selectedSeats || [];
  const totalPrice = state?.totalPrice || 0;

  // --- 2. PASSENGER STATE ---
  const [passengers, setPassengers] = useState(
    selectedSeats.map((seat) => ({
      seatNumber: seat,
      name: "",
      age: "",
      gender: "Male",
    }))
  );

  // --- 3. ERROR STATE ---
  // Stores specific error messages: { 0: { name: "Required", age: "Invalid" } }
  const [errors, setErrors] = useState({});

  // --- 4. REDIRECT IF INVALID ---
  useEffect(() => {
    if (!state || selectedSeats.length === 0) {
      navigate("/");
    }
  }, [state, selectedSeats, navigate]);

  const schedule = schedules.find((s) => s.scheduleId === scheduleId);
  const route = routes.find((r) => r.routeId === schedule?.routeId);
  const bus = buses.find((b) => b.busId === schedule?.busId);

  if (!state || selectedSeats.length === 0) return null;

  // --- HANDLERS ---

  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);

    // Auto-clear error for this field if it exists
    if (errors[index] && errors[index][field]) {
      setErrors((prev) => ({
        ...prev,
        [index]: { ...prev[index], [field]: null },
      }));
    }
  };

  // --- VALIDATION ENGINE ---
  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    passengers.forEach((p, index) => {
      const passengerErrors = {};

      // 1. Name Validation
      if (!p.name || p.name.trim().length === 0) {
        passengerErrors.name = "Name is required";
        isValid = false;
      } else if (p.name.trim().length < 3) {
        passengerErrors.name = "Name too short (min 3 chars)";
        isValid = false;
      }

      // 2. Age Validation
      if (!p.age) {
        passengerErrors.age = "Age is required";
        isValid = false;
      } else if (p.age < 1) {
        passengerErrors.age = "Invalid age";
        isValid = false;
      } else if (p.age > 120) {
        passengerErrors.age = "Max age is 120";
        isValid = false;
      }

      if (Object.keys(passengerErrors).length > 0) {
        newErrors[index] = passengerErrors;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleProceedToPayment = () => {
    // 1. Run Validation
    if (!validateForm()) {
      toast.warning("Please correct the highlighted errors.");
      return;
    }

    // 2. Auth Check
    if (!currentUser) {
      toast.error("You must be logged in to book.");
      navigate("/login");
      return;
    }

    // 3. Prepare Data Object
    const bookingData = {
      scheduleId: scheduleId,
      customerId: currentUser.customerId || currentUser.id || "GUEST",
      customerName: currentUser.name,
      travelOrigin: route?.source || "Unknown",
      travelDestination: route?.destination || "Unknown",
      seatsBooked: selectedSeats,
      totalFare: totalPrice,
      passengerDetails: passengers,
    };

    // 4. Navigate to Payment
    navigate("/payment", { state: { bookingData } });
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <div className="checkout-container">
        <h2 className="page-title">Complete your Booking</h2>

        <div className="checkout-grid">
          {/* --- LEFT: PASSENGER DETAILS --- */}
          <div className="passenger-section">
            <div className="section-header">
              <span className="material-symbols-outlined">groups</span>
              <h3>Passenger Details</h3>
            </div>

            {passengers.map((p, index) => (
              <div key={p.seatNumber} className="passenger-card">
                <div className="seat-badge">Seat {p.seatNumber}</div>

                <div className="form-grid">
                  {/* NAME INPUT */}
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Ravi Kumar"
                      className={errors[index]?.name ? "input-error" : ""}
                      value={p.name}
                      onChange={(e) => {
                        // Regex: Only allow letters and spaces (No numbers/symbols)
                        if (/^[a-zA-Z\s]*$/.test(e.target.value)) {
                          handlePassengerChange(index, "name", e.target.value);
                        }
                      }}
                    />
                    {errors[index]?.name && (
                      <span className="error-text">{errors[index].name}</span>
                    )}
                  </div>

                  {/* AGE INPUT */}
                  <div className="form-group">
                    <label>Age</label>
                    <input
                      type="number"
                      placeholder="Age"
                      className={errors[index]?.age ? "input-error" : ""}
                      value={p.age}
                      min="1"
                      max="120"
                      // Block invalid keys physically
                      onKeyDown={(e) => {
                        if (["e", "E", "+", "-", "."].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) => {
                        // Limit to 3 digits
                        if (e.target.value.length <= 3) {
                          handlePassengerChange(index, "age", e.target.value);
                        }
                      }}
                    />
                    {errors[index]?.age && (
                      <span className="error-text">{errors[index].age}</span>
                    )}
                  </div>

                  {/* GENDER INPUT */}
                  <div className="form-group">
                    <label>Gender</label>
                    <select
                      value={p.gender}
                      onChange={(e) =>
                        handlePassengerChange(index, "gender", e.target.value)
                      }
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}

            <div className="contact-info-card">
              <h4>Contact Information</h4>
              <p>Your ticket will be sent to:</p>
              <div className="info-row">
                <span className="material-symbols-outlined">mail</span>
                <span>{currentUser?.email || "user@example.com"}</span>
              </div>
              <div className="info-row">
                <span className="material-symbols-outlined">call</span>
                <span>{currentUser?.phone || "+91 98765 43210"}</span>
              </div>
            </div>
          </div>

          {/* --- RIGHT: TRIP SUMMARY --- */}
          <div className="summary-section">
            <div className="trip-card">
              <div className="trip-header">
                <h3>Trip Summary</h3>
              </div>

              <div className="route-names">
                <span>{route?.source}</span>
                <span className="arrow">➝</span>
                <span>{route?.destination}</span>
              </div>

              <div className="trip-meta">
                <div className="meta-row">
                  <span className="label">Bus</span>
                  <span className="value">{bus?.name}</span>
                </div>
                <div className="meta-row">
                  <span className="label">Date</span>
                  <span className="value">{schedule?.departureDate}</span>
                </div>
                <div className="meta-row">
                  <span className="label">Time</span>
                  <span className="value">{schedule?.departureTime}</span>
                </div>
                <div className="meta-row">
                  <span className="label">Seats</span>
                  <span className="value">{selectedSeats.join(", ")}</span>
                </div>
              </div>

              <div className="price-breakdown">
                <div className="price-row">
                  <span>Base Fare x {selectedSeats.length}</span>
                  <span>₹{totalPrice}</span>
                </div>
                <div className="price-row">
                  <span>Tax (5%)</span>
                  <span>₹{(totalPrice * 0.05).toFixed(2)}</span>
                </div>
                <div className="price-row total">
                  <span>Total to Pay</span>
                  <span>₹{(totalPrice * 1.05).toFixed(2)}</span>
                </div>
              </div>

              <button className="btn-pay" onClick={handleProceedToPayment}>
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
