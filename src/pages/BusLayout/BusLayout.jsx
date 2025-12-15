import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import Navbar from "../../components/NavBar/NavBar";
import "./BusLayout.css";

const BusLayout = () => {
  const { scheduleId } = useParams();
  const navigate = useNavigate();

  // 1. Get Data
  const { schedules, routes, bookings, buses } = useData();
  const { currentUser: user } = useAuth(); // Correctly grab user

  // 2. Local State
  const [selectedSeats, setSelectedSeats] = useState([]);

  // 3. Find Details
  const schedule = useMemo(
    () => schedules.find((s) => s.scheduleId === scheduleId),
    [schedules, scheduleId]
  );
  const route = useMemo(
    () => routes.find((r) => r.routeId === schedule?.routeId),
    [routes, schedule]
  );
  const bus = useMemo(
    () => buses.find((b) => b.busId === schedule?.busId),
    [buses, schedule]
  );

  // 4. Calculate Booked Seats
  const bookedSeats = useMemo(() => {
    if (!schedule) return [];
    return bookings
      .filter((b) => b.scheduleId === scheduleId && b.status !== "Cancelled")
      .flatMap((b) => b.seatsBooked);
  }, [bookings, scheduleId]);

  // 5. Handle Seat Click
  const toggleSeat = (seatId) => {
    if (bookedSeats.includes(seatId)) {
      toast.info("Seat already booked.");
      return;
    }

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatId));
    } else {
      if (selectedSeats.length >= 6) {
        toast.warning("Max 6 seats allowed.");
        return;
      }
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  // 6. Proceed to Checkout
  const handleProceed = () => {
    if (!user) {
      toast.error("Please login to proceed.");
      navigate("/login");
      return;
    }
    if (selectedSeats.length === 0) return;

    // Calculate dynamic price
    const pricePerSeat = Math.round(route.baseFare * schedule.fareMultiplier);
    const totalPrice = pricePerSeat * selectedSeats.length;

    navigate("/checkout", {
      state: {
        scheduleId,
        selectedSeats,
        totalPrice,
      },
    });
  };

  if (!schedule || !route || !bus)
    return <div className="loading-msg">Loading trip details...</div>;

  const ticketPrice = Math.round(route.baseFare * schedule.fareMultiplier);

  // 7. Render Logic: 8 Rows, Columns A,B (Left) and C (Right)
  const renderGrid = () => {
    const rows = 8;
    let grid = [];

    for (let i = 1; i <= rows; i++) {
      // Seat A
      const seatA = `${i}A`;
      grid.push(renderSeat(seatA));

      // Seat B
      const seatB = `${i}B`;
      grid.push(renderSeat(seatB));

      // Aisle (Empty Div)
      grid.push(
        <div key={`aisle-${i}`} className="aisle-space">
          {i}
        </div>
      );

      // Seat C
      const seatC = `${i}C`;
      grid.push(renderSeat(seatC));
    }
    return grid;
  };

  const renderSeat = (seatId) => {
    const isBooked = bookedSeats.includes(seatId);
    const isSelected = selectedSeats.includes(seatId);

    return (
      <button
        key={seatId}
        className={`seat ${
          isBooked ? "booked" : isSelected ? "selected" : "available"
        }`}
        onClick={() => toggleSeat(seatId)}
        disabled={isBooked}
      >
        {seatId}
      </button>
    );
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <div className="layout-container">
        {/* LEFT: Bus UI */}
        <div className="bus-visual-section">
          <div className="section-header">
            <h2>Select Seats</h2>
            <div className="legend">
              <span>
                <span className="dot available"></span> Available
              </span>
              <span>
                <span className="dot selected"></span> Selected
              </span>
              <span>
                <span className="dot booked"></span> Booked
              </span>
            </div>
          </div>

          <div className="bus-chassis">
            <div className="driver-cabin">

              <small>Driver</small>
            </div>

            {/* 2+1 Layout Grid */}
            <div className="seats-grid-2-1">
              <div className="col-label">A</div>
              <div className="col-label">B</div>
              <div className="col-label"></div>
              <div className="col-label">C</div>

              {renderGrid()}
            </div>
          </div>
        </div>

        {/* RIGHT: Summary */}
        <div className="booking-sidebar">
          <div className="booking-summary">
            <h3>Trip Summary</h3>

            <div className="route-info">
              <span className="city">{route.source}</span>
              <span className="material-symbols-outlined arrow">
                arrow_forward
              </span>
              <span className="city">{route.destination}</span>
            </div>

            <div className="meta-info">
              <p>
                <strong>Operator:</strong> {bus.name}
              </p>
              <p>
                <strong>Type:</strong> {bus.seatType}
              </p>
              <p>
                <strong>Date:</strong> {schedule.departureDate} at{" "}
                {schedule.departureTime}
              </p>
            </div>

            <div className="divider"></div>

            <div className="selected-seats-box">
              <p className="label">Selected Seats ({selectedSeats.length})</p>
              <div className="tags">
                {selectedSeats.length > 0 ? (
                  selectedSeats.map((s) => (
                    <span key={s} className="seat-tag">
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="placeholder">No seats selected</span>
                )}
              </div>
            </div>

            <div className="price-section">
              <div className="row">
                <span>Price</span>
                <span>
                  ₹{ticketPrice} x {selectedSeats.length}
                </span>
              </div>
              <div className="row total">
                <span>Total</span>
                <span>₹{ticketPrice * selectedSeats.length}</span>
              </div>
            </div>

            <button
              className="btn-checkout"
              disabled={selectedSeats.length === 0}
              onClick={handleProceed}
            >
              Proceed to Book
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusLayout;
