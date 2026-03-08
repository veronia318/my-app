import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../application/auth/AuthContext";
import { User, Mail, Lock, Trash2, Save } from "lucide-react";
import API_ENDPOINTS, {
  fetchWithAuth,
} from "../../infrastructure/api/api.config";
import "../styles/UserProfile.css";

export default function UserProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  // Handle profile update
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validate password confirmation
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

      // Add password only if user entered a new one
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

      // Update user data in localStorage
      const updatedUser = {
        ...user,
        name: data.user.name,
        email: data.user.email,
      };

      localStorage.setItem("userData", JSON.stringify(updatedUser));

      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      setFormData({
        ...formData,
        password: "",
        confirmPassword: "",
      });

      setLoading(false);

      // Reload page after 2 seconds to refresh context
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error("Update error:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Handle account deletion
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "⚠️ Are you sure you want to delete your account?\n\nThis will permanently delete:\n- Your account\n- All your rooms\n- All your devices\n- All your readings\n\nThis action CANNOT be undone!",
    );

    if (!confirmDelete) return;

    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No authentication token found. Please login again.");
      }

      const response = await fetch(API_ENDPOINTS.DELETE_USER, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const contentType = response.headers.get("content-type");
      let data = null;

      if (contentType && contentType.includes("application/json")) {
        const text = await response.text();
        if (text) {
          data = JSON.parse(text);
        }
      }

      if (!response.ok) {
        throw new Error(data?.message || `Server error: ${response.status}`);
      }

      alert("Account deleted successfully!");
      localStorage.clear();
      logout();
      navigate("/login");
    } catch (err) {
      console.error("❌ Delete error:", err);
      alert("Failed to delete account: " + err.message);
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

        {success && <div className="alert alert-success">✅ {success}</div>}

        <form onSubmit={handleUpdate} className="profile-form">
          <div className="form-group">
            <label htmlFor="name">
              <User size={18} /> Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">
              <Mail size={18} /> Email
            </label>
            <input
              type="email"
              id="email"
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
                <label htmlFor="password">
                  <Lock size={18} /> New Password (Optional)
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Leave blank to keep current password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">
                  <Lock size={18} /> Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
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
                    setSuccess("");
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </form>

        <div className="danger-zone">
          <h3>⚠️ Danger Zone</h3>
          <p>Once you delete your account, there is no going back.</p>
          <button
            className="btn btn-danger"
            onClick={handleDelete}
            disabled={loading}
          >
            <Trash2 size={18} />
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
