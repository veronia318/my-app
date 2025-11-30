import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar">
      <h1 className="logo-title"><span>Power</span>Stream</h1>
      <div className="nav-links">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/live-readings" className="nav-link">Live Readings</Link>
        <Link to="/rooms" className="nav-link">Rooms</Link>
        <Link to="/login" className="nav-link">Login</Link>
        <Link to="/about" className="nav-link">About</Link>
        <Link to="/services"className="nav-link">Services</Link>
        <Link to="/contact"className="nav-link">Contact</Link>
      </div>
    </nav>
  );
}

export default Navbar;