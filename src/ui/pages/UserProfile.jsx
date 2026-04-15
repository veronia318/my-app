import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../application/auth/AuthContext";
import { User, Mail, Lock, Trash2, Save } from "lucide-react";
import API_ENDPOINTS, {
  fetchWithAuth,
} from "../../infrastructure/api/api.config";
import "../styles/UserProfile.css";

export default function UserProfile() {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
    setSuccess("");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (
      formData.name === user.name &&
      formData.email === user.email &&
      !formData.password
    ) {
      setError("No changes made.");
      setLoading(false);
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      setLoading(false);
      return;
    }

    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await fetchWithAuth(API_ENDPOINTS.UPDATE_USER, {
        method: "PUT",
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      // const updatedUser = {
      //   ...user,
      //   name: data.user.name,
      //   email: data.user.email,
      // };

      const updatedUser = {
        ...user,
        id: data.user._id || user.id,
        name: data.user.name,
        email: data.user.email,
        image: data.user.image,
      };
      login(updatedUser, localStorage.getItem("authToken"));

      setSuccess(data.message);
      setShowPopup(true);
      setIsEditing(false);

      setFormData({
        ...formData,
        password: "",
        confirmPassword: "",
      });

      setLoading(false);

      setTimeout(() => {
        setShowPopup(false);
      }, 2000);
    } catch (err) {
      console.error("Update error:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  // ✅ UPDATED DELETE (no alert)
  const handleDelete = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");

      const response = await fetch(API_ENDPOINTS.DELETE_USER, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Delete failed");
      }

      localStorage.clear();
      logout();
      navigate("/login");
    } catch (err) {
      console.error("❌ Delete error:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <User size={48} />
          <h1>My Profile</h1>
          <p>Manage your account settings</p>
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleUpdate} className="profile-form">
          <div className="form-group">
            <label>
              <User size={18} /> Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />
          </div>

          <div className="form-group">
            <label>
              <Mail size={18} /> Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />
          </div>

          {isEditing && (
            <>
              <div className="form-group">
                <label>
                  <Lock size={18} /> New Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>
                  <Lock size={18} /> Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          <div className="form-actions">
            {!isEditing ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={loading}
                >
                  <Save size={18} />
                  {loading ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: user?.name || "",
                      email: user?.email || "",
                      password: "",
                      confirmPassword: "",
                    });
                    setError("");
                  }}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </form>

        {/* ✅ SUCCESS POPUP */}
        {showPopup && (
          <div className="popup-success">✅ Profile updated successfully!</div>
        )}

        {/* ✅ DELETE BUTTON */}
        <div className="danger-zone">
          <h3>⚠️ Danger Zone</h3>
          <button
            className="btn btn-danger"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 size={18} /> Delete Account
          </button>
        </div>
      </div>

      {/* ✅ MODAL */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 style={{ color: "white" }}>⚠️ Delete Account</h2>
            <p style={{ color: "white" }}>
              This will permanently delete your account and all your data.
              <br />
              <strong style={{ color: "white" }}>
                This action cannot be undone!
              </strong>
            </p>

            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
                disabled={loading}
              >
                Cancel
              </button>

              <button
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
