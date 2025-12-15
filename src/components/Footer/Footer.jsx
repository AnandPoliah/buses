import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Column 2: Quick Links */}
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about">About Us</Link>
            </li>
            <li>
              <Link to="/search-results">Book Tickets</Link>
            </li>
            <li>
              <Link to="/login">Login / Register</Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Support & Legal */}
        <div className="footer-section">
          <h4>Support & Legal</h4>
          <ul className="footer-links">
            <li>
              <a href="#">FAQ & Help Center</a>
            </li>
            <li>
              <a href="/assets/terms.pdf" target="_blank">
                Terms & Conditions
              </a>
            </li>
            <li>
              <a href="#">Privacy Policy</a>
            </li>
            <li>
              <a href="#">Contact Support</a>
            </li>
          </ul>
        </div>

        {/* Column 4: Contact Information */}
        <div className="footer-section footer-contact-info">
          <h4>Contact Details</h4>
          <p>
            <span className="material-symbols-outlined contact-icon">
              location_on
            </span>
            Inthu Enga Area, <br /> Coimbatore, TN, IN
          </p>
          <p>
            <span className="material-symbols-outlined contact-icon">call</span>
            +91 619 - 619 - 619
          </p>
          <p>
            <span className="material-symbols-outlined contact-icon">mail</span>
            busbooking@bus.com
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} BusBooker Inc. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
