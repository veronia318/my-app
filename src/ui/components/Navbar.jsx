import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../application/auth/AuthContext";
import { LogOut, User } from "lucide-react";

// ── Logout Modal ──────────────────────────────────────────────
const LogoutModal = ({ onConfirm, onCancel }) => (
  <div className="modal-overlay" onClick={onCancel}>
    <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
      <div className="logout-modal__icon">
        <LogOut size={28} color="var(--color-danger)" />
      </div>
      <h3 className="logout-modal__title">Logout Account?</h3>
      <p className="logout-modal__text">
        Are you sure you want to logout your account?
      </p>
      <div className="logout-modal__buttons">
        <button className="logout-modal__cancel" onClick={onCancel}>
          Cancel
        </button>
        <button className="logout-modal__confirm" onClick={onConfirm}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  </div>
);

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    logout();
    navigate("/login");
  };
  return (
    <>
      <nav className="navbar">
        <h1 className="logo-title">
          <span>Energy</span>Saver
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
              <Link to="/scheduling" className="nav-link">
                Scheduling
              </Link>
              <Link to="/ai-analysis" className="nav-link">
                AI Analysis
              </Link>
              <Link to="/profile" className="user-section">
                <User size={18} />
                <span className="welcome-text">
                  Welcome,{" "}
                  <strong>{user?.name || user?.firstname || "User"}</strong>
                </span>
              </Link>
              <button
                className="logout-btn"
                onClick={() => setShowLogoutModal(true)}
              >
                <LogOut size={18} /> Logout
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

      {showLogoutModal && (
        <LogoutModal
          onConfirm={handleLogoutConfirm}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}
    </>
  );
}

export default Navbar;
