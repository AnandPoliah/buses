import React, { useMemo, useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useData } from "../../context/DataContext";
import Navbar from "../../components/NavBar/NavBar";
import "./SearchResults.css";
import { useTableManager } from "../../hooks/useTableManager";
import PaginationControls from "../../components/Pagination/PaginationControls";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // --- 1. REF FOR CLICK OUTSIDE ---
  const searchBarRef = useRef(null);

  const { schedules, routes, buses, bookings } = useData();

  // URL Params
  const fromCity = searchParams.get("from") || "";
  const toCity = searchParams.get("to") || "";
  const dateParam = searchParams.get("date") || "";

  // Local State
  const [sourceInput, setSourceInput] = useState(fromCity);
  const [destInput, setDestInput] = useState(toCity);
  const [dateInput, setDateInput] = useState(dateParam);

  const [showSourceSuggestions, setShowSourceSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);

  // Sync with URL
  useEffect(() => {
    setSourceInput(fromCity);
    setDestInput(toCity);
    setDateInput(dateParam);
  }, [fromCity, toCity, dateParam]);

  // --- 2. CLICK OUTSIDE LISTENER ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If click is NOT inside the search bar, close suggestions
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target)
      ) {
        setShowSourceSuggestions(false);
        setShowDestSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // --- AUTOCOMPLETE LOGIC ---
  const allCities = useMemo(() => {
    const cities = new Set();
    routes.forEach((r) => {
      cities.add(r.source);
      cities.add(r.destination);
    });
    return Array.from(cities).sort();
  }, [routes]);

  const filteredSources = allCities.filter((city) =>
    city.toLowerCase().includes(sourceInput.toLowerCase())
  );
  const filteredDestinations = allCities.filter((city) =>
    city.toLowerCase().includes(destInput.toLowerCase())
  );

  const handleModifySearch = () => {
    if (!sourceInput || !destInput || !dateInput) {
      alert("Please fill in all fields");
      return;
    }
    navigate(
      `/search-results?from=${sourceInput}&to=${destInput}&date=${dateInput}`
    );
    setShowSourceSuggestions(false);
    setShowDestSuggestions(false);
  };

  const normalize = (text) =>
    text ? text.toLowerCase().replace(/\s+/g, "") : "";

  const getAmenityIcon = (amenity) => {
    const map = {
      "Water Bottle": "water_drop",
      "Charging Point": "battery_charging_full",
      Blanket: "bed",
      TV: "tv",
      WiFi: "wifi",
    };
    return map[amenity] || "check_circle";
  };

  // --- FILTER ENGINE ---
  const filteredBuses = useMemo(() => {
    if (!fromCity || !toCity || !dateParam) return [];

    const searchSource = normalize(fromCity);
    const searchDest = normalize(toCity);

    return schedules
      .filter((schedule) => {
        const route = routes.find((r) => r.routeId === schedule.routeId);
        if (!route) return false;
        const routeSource = normalize(route.source);
        const routeDest = normalize(route.destination);
        return (
          routeSource.includes(searchSource) &&
          routeDest.includes(searchDest) &&
          schedule.departureDate === dateParam
        );
      })
      .map((schedule) => {
        const route = routes.find((r) => r.routeId === schedule.routeId);
        const busDetails = buses.find((b) => b.busId === schedule.busId);
        const totalSeats = busDetails?.totalSeats || 24;
        const tripBookings = bookings.filter(
          (b) =>
            b.scheduleId === schedule.scheduleId && b.status !== "Cancelled"
        );
        const seatsTaken = tripBookings.reduce((total, booking) => {
          return total + (booking.seatsBooked ? booking.seatsBooked.length : 0);
        }, 0);
        return {
          ...schedule,
          ...route,
          ...busDetails,
          seatsAvailable: Math.max(0, totalSeats - seatsTaken),
        };
      });
  }, [schedules, routes, buses, bookings, fromCity, toCity, dateParam]);

  const {
    currentData,
    searchTerm,
    handleSearch,
    currentPage,
    totalPages,
    rowsPerPage,
    handleRowsChange,
    changePage,
  } = useTableManager(filteredBuses, ["name", "seatType"]);

  const handleSelectBus = (scheduleId) => {
    navigate(`/bus/${scheduleId}`);
  };

  const calculatePrice = (baseFare, multiplier) =>
    Math.round(baseFare * (multiplier || 1));

  return (
    <div className="page-wrapper">
      <Navbar />

      <div className="results-container">
        {/* --- ATTACH REF HERE --- */}
        <div className="results-header-bar" ref={searchBarRef}>
          {/* SOURCE */}
          <div className="modify-group">
            <label>From</label>
            <div className="input-rel">
              <span className="material-symbols-outlined input-icon">
                directions_bus
              </span>
              <input
                type="text"
                value={sourceInput}
                onChange={(e) => {
                  setSourceInput(e.target.value);
                  setShowSourceSuggestions(true);
                  setShowDestSuggestions(false);
                }}
                onFocus={() => setShowSourceSuggestions(true)}
                placeholder="Source"
              />
              {showSourceSuggestions && filteredSources.length > 0 && (
                <ul className="mini-suggestions">
                  {filteredSources.map((city) => (
                    <li
                      key={city}
                      onClick={() => {
                        setSourceInput(city);
                        setShowSourceSuggestions(false);
                      }}
                    >
                      {city}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <span className="material-symbols-outlined swap-arrow">
            arrow_forward
          </span>

          {/* DESTINATION */}
          <div className="modify-group">
            <label>To</label>
            <div className="input-rel">
              <span className="material-symbols-outlined input-icon">
                location_on
              </span>
              <input
                type="text"
                value={destInput}
                onChange={(e) => {
                  setDestInput(e.target.value);
                  setShowDestSuggestions(true);
                  setShowSourceSuggestions(false);
                }}
                onFocus={() => setShowDestSuggestions(true)}
                placeholder="Destination"
              />
              {showDestSuggestions && filteredDestinations.length > 0 && (
                <ul className="mini-suggestions">
                  {filteredDestinations.map((city) => (
                    <li
                      key={city}
                      onClick={() => {
                        setDestInput(city);
                        setShowDestSuggestions(false);
                      }}
                    >
                      {city}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* DATE - FIXED CLICKABILITY */}
          <div className="modify-group">
            <label>Date</label>
            <div className="input-rel">
              <input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                // This forces the calendar to open on click
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                style={{ cursor: "pointer" }}
              />
            </div>
          </div>

          <button className="btn-modify" onClick={handleModifySearch}>
            Modify Search
          </button>
        </div>

        {/* --- SUMMARY INFO & FILTER --- */}
        <div className="results-meta-row">
          <p className="found-count">{filteredBuses.length} Buses found</p>

          <div className="sort-controls">
            {/* CORRECTED FILTER WRAPPER */}
            <div className="filter-wrapper">
              <span className="material-symbols-outlined filter-icon">
                search
              </span>
              <input
                type="text"
                placeholder="Filter Operator..."
                value={searchTerm}
                onChange={handleSearch}
                className="operator-filter"
              />
            </div>
          </div>
        </div>

        {/* --- BUS LIST --- */}
        <div className="bus-list">
          {currentData.length > 0 ? (
            currentData.map((bus) => (
              <div key={bus.scheduleId} className="bus-card">
                <div className="bus-col-info">
                  <h3 className="bus-operator">
                    {bus.name || `Bus ${bus.busId}`}
                  </h3>
                  <div className="bus-badges">
                    <span className="badge-type">{bus.seatType}</span>
                    <span className="badge-rating">★ 4.8</span>
                  </div>
                  <div className="amenities-row">
                    {bus.amenities?.map((item, index) => (
                      <div key={index} className="amenity-item" title={item}>
                        <span className="material-symbols-outlined icon-tiny">
                          {getAmenityIcon(item)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bus-col-schedule">
                  <div className="time-group start">
                    <span className="time-big">{bus.departureTime}</span>
                    <span className="city-small">{fromCity}</span>
                  </div>
                  <div className="duration-visual">
                    <span className="duration-label">{bus.duration}</span>
                    <div className="line-graphic">
                      <div className="dot"></div>
                      <div className="line"></div>
                      <div className="dot"></div>
                    </div>
                  </div>
                  <div className="time-group end">
                    <span className="time-big">{bus.arrivalTime}</span>
                    <span className="city-small">{toCity}</span>
                  </div>
                </div>

                <div className="bus-col-price">
                  <div className="price-container">
                    <span className="price-label">Starts from</span>
                    <div className="price-value">
                      <span className="currency">₹</span>
                      {calculatePrice(bus.baseFare, bus.fareMultiplier)}
                    </div>
                  </div>

                  <button
                    className="btn-select-seat"
                    onClick={() => handleSelectBus(bus.scheduleId)}
                    disabled={bus.seatsAvailable === 0}
                  >
                    {bus.seatsAvailable === 0 ? "Sold Out" : "View Seats"}
                  </button>

                  <div className="seats-left">
                    {bus.seatsAvailable} Seats Left
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results-state">
              <h3>No buses found for this route/date.</h3>
            </div>
          )}
        </div>

        {filteredBuses.length > 0 && (
          <div className="pagination-wrapper">
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={changePage}
              rowsPerPage={rowsPerPage}
              onRowsChange={handleRowsChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
