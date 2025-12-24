import React, { useState, useRef, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../../context/DataContext";
import Navbar from "../../components/NavBar/NavBar";
import Footer from "../../components/Footer/Footer";
import "./HomePage.css";

const HomePage = () => {
  const navigate = useNavigate();
  const searchBarRef = useRef(null);
  const dateInputRef = useRef(null);

  const { routes } = useData();

  // State
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [showSourceSuggestions, setShowSourceSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const [errors, setErrors] = useState({
    source: false,
    destination: false,
    date: false,
  });

  // --- 1. MEMOIZE CITIES ---
  const allCities = useMemo(() => {
    const cities = new Set();
    routes.forEach((r) => {
      cities.add(r.source);
      cities.add(r.destination);
    });
    return Array.from(cities).sort();
  }, [routes]);

  // --- 2. FILTERS ---
  const filteredSources = allCities.filter((city) =>
    city.toLowerCase().includes(source.toLowerCase())
  );

  const filteredDestinations = allCities.filter((city) =>
    city.toLowerCase().includes(destination.toLowerCase())
  );

  // --- 3. HANDLERS ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target)
      ) {
        setShowSourceSuggestions(false);
        setShowDestSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const newErrors = {
      source: !source,
      destination: !destination,
      date: !date,
    };

    if (newErrors.source || newErrors.destination || newErrors.date) {
      setErrors(newErrors);
      return;
    }
    navigate(`/search-results?from=${source}&to=${destination}&date=${date}`);
  };

  const handleInputChange = (setter, field, value) => {
    setter(value);
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: false }));
    }
  };

  // --- FIX IS HERE ---
  const openDatePicker = (e) => {
    // Allows clicking anywhere on the container (including the input) to open the picker
    if (dateInputRef.current && dateInputRef.current.showPicker) {
      dateInputRef.current.showPicker();
    } else if (dateInputRef.current) {
      dateInputRef.current.focus(); // Fallback for older browsers
    }
  };

  return (
    <div className="homepage-container">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title animate-title">
            Travel Comfortably, <br />
            <span className="highlight-text">Arrive Styling.</span>
          </h1>
          <p className="hero-subtitle animate-subtitle">
            Seamless bus booking across the nation. Experience premium travel at
            standard rates.
          </p>

          {/* SEARCH CARD */}
          <div className="search-card animate-up">
            <form
              onSubmit={handleSearch}
              className="search-form"
              ref={searchBarRef}
            >
              {/* SOURCE INPUT */}
              <div className="search-group">
                <label className="search-label">From</label>
                <div
                  className={`input-container ${errors.source ? "error" : ""}`}
                >
                  <span className="material-symbols-outlined home-input-icon">
                    trip_origin
                  </span>
                  <input
                    type="text"
                    placeholder="Source City"
                    value={source}
                    onChange={(e) => {
                      handleInputChange(setSource, "source", e.target.value);
                      setShowSourceSuggestions(true);
                      setShowDestSuggestions(false);
                    }}
                    onFocus={() => setShowSourceSuggestions(true)}
                    className="search-input"
                  />
                  {showSourceSuggestions && filteredSources.length > 0 && (
                    <ul className="suggestions-list">
                      {filteredSources.map((city) => (
                        <li
                          key={city}
                          onClick={() => {
                            setSource(city);
                            setShowSourceSuggestions(false);
                            setErrors((prev) => ({ ...prev, source: false }));
                          }}
                        >
                          {city}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* DESTINATION INPUT */}
              <div className="search-group">
                <label className="search-label">To</label>
                <div
                  className={`input-container ${
                    errors.destination ? "error" : ""
                  }`}
                >
                  <span className="material-symbols-outlined home-input-icon">
                    location_on
                  </span>
                  <input
                    type="text"
                    placeholder="Destination City"
                    value={destination}
                    onChange={(e) => {
                      handleInputChange(
                        setDestination,
                        "destination",
                        e.target.value
                      );
                      setShowDestSuggestions(true);
                      setShowSourceSuggestions(false);
                    }}
                    onFocus={() => setShowDestSuggestions(true)}
                    className="search-input"
                  />
                  {showDestSuggestions && filteredDestinations.length > 0 && (
                    <ul className="suggestions-list">
                      {filteredDestinations.map((city) => (
                        <li
                          key={city}
                          onClick={() => {
                            setDestination(city);
                            setShowDestSuggestions(false);
                            setErrors((prev) => ({
                              ...prev,
                              destination: false,
                            }));
                          }}
                        >
                          {city}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* DATE INPUT */}
              <div className="search-group">
                <label className="search-label">Journey Date</label>
                <div
                  className={`input-container ${errors.date ? "error" : ""}`}
                  onClick={openDatePicker}
                  style={{ cursor: "pointer" }}
                >
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={date}
                    onChange={(e) =>
                      handleInputChange(setDate, "date", e.target.value)
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className="search-input"
                  />
                </div>
              </div>

              {/* SEARCH BUTTON */}
              <button type="submit" className="search-btn">
                Search Buses
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="features-section">
        <div className="features-container">
          <div className="feature-card">
            <span className="material-symbols-outlined feature-icon">
              verified_user
            </span>
            <h3>Safe & Secure</h3>
            <p>Verified bus operators and sanitized buses for your safety.</p>
          </div>
          <div className="feature-card">
            <span className="material-symbols-outlined feature-icon">
              payments
            </span>
            <h3>Best Prices</h3>
            <p>Unbeatable rates and exclusive deals on every booking.</p>
          </div>
          <div className="feature-card">
            <span className="material-symbols-outlined feature-icon">
              support_agent
            </span>
            <h3>24/7 Support</h3>
            <p>We are here to help you every step of the journey.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
