import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../application/auth/AuthContext";
import { LogOut, User } from "lucide-react";

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      navigate("/login");
    }
  };

  return (
    <nav className="navbar">
      <h1 className="logo-title">
        <span>Power</span>Stream
      </h1>

      <div className="nav-links">
        {isAuthenticated ? (
          <>
            <Link to="/" className="nav-link">
              Home
            </Link>
            <Link to="/live-readings" className="nav-link">
              Live Readings
            </Link>
            <Link to="/rooms" className="nav-link">
              Rooms
            </Link>

            <Link to="/profile" className="user-section">
              <User size={18} />
              <span className="welcome-text">
                Welcome,{" "}
                <strong>{user?.name || user?.firstname || "User"}</strong>
              </span>
            </Link>

            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={18} />
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link login-link">
              Login
            </Link>
            <Link to="/register" className="nav-link register-link">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
