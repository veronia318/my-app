import React, { useState, useEffect } from "react";
import API_ENDPOINTS, {
  fetchWithAuth,
} from "../../infrastructure/api/api.config";
import "../styles/Scheduling.css";

export default function Scheduling() {
  const [devices, setDevices] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    deviceId: "",
    action: "off",
    time: "",
    repeat: "daily",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchDevices();
    fetchSchedules();
  }, []);

  const fetchDevices = async () => {
    try {
      const res = await fetchWithAuth(API_ENDPOINTS.DEVICES);
      if (!res.ok) return;
      const data = await res.json();
      const allDevices = Array.isArray(data)
        ? data.flatMap((item) => (item.devices ? item.devices : [item]))
        : [];
      setDevices(allDevices);
    } catch (err) {
      console.error("Error fetching devices:", err);
    }
  };

  const fetchSchedules = async () => {
    try {
      const res = await fetchWithAuth(API_ENDPOINTS.SCHEDULES);
      if (!res.ok) return;
      const data = await res.json();
      setSchedules(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching schedules:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.deviceId || !formData.time) {
      setMessage({ type: "error", text: "Please select a device and time." });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetchWithAuth(API_ENDPOINTS.SCHEDULES, {
        method: "POST",
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Schedule created successfully!" });
        setFormData({ deviceId: "", action: "off", time: "", repeat: "daily" });
        fetchSchedules();
      } else {
        const err = await res.json();
        setMessage({
          type: "error",
          text: err.message || "Failed to create schedule.",
        });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Server error." });
    } finally {
      setSubmitting(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetchWithAuth(API_ENDPOINTS.SCHEDULE_DELETE(id), {
        method: "DELETE",
      });
      if (res.ok) fetchSchedules();
    } catch (err) {
      console.error("Error deleting schedule:", err);
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await fetchWithAuth(API_ENDPOINTS.SCHEDULE_TOGGLE(id), {
        method: "PATCH",
      });
      if (res.ok) fetchSchedules();
    } catch (err) {
      console.error("Error toggling schedule:", err);
    }
  };

  const getDeviceName = (deviceId) => {
    const device = devices.find(
      (d) => (d._id || d.id) === (deviceId?._id || deviceId?.id || deviceId),
    );
    return device ? device.name : "Unknown Device";
  };

  return (
    <div className="scheduling-container">
      <h1 className="scheduling-title">⏱ Device Scheduling</h1>
      <p className="scheduling-subtitle">
        Set timers to automatically turn your devices on or off.
      </p>

      {/* ── Create Schedule Form ── */}
      <div className="schedule-form-card">
        <h2>New Schedule</h2>

        <div className="form-grid">
          <div className="form-group">
            <label>Device</label>
            <select
              value={formData.deviceId}
              onChange={(e) =>
                setFormData({ ...formData, deviceId: e.target.value })
              }
            >
              <option value="">Select a device</option>
              {devices.map((d) => (
                <option key={d._id || d.id} value={d._id || d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Action</label>
            <select
              value={formData.action}
              onChange={(e) =>
                setFormData({ ...formData, action: e.target.value })
              }
            >
              <option value="on">Turn ON</option>
              <option value="off">Turn OFF</option>
            </select>
          </div>

          <div className="form-group">
            <label>Time</label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) =>
                setFormData({ ...formData, time: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Repeat</label>
            <select
              value={formData.repeat}
              onChange={(e) =>
                setFormData({ ...formData, repeat: e.target.value })
              }
            >
              <option value="daily">Daily</option>
              <option value="once">Once</option>
            </select>
          </div>
        </div>

        {message && (
          <p className={`schedule-message ${message.type}`}>{message.text}</p>
        )}

        <button
          className="schedule-submit-btn"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Saving..." : "＋ Add Schedule"}
        </button>
      </div>

      {/* ── Existing Schedules ── */}
      <div className="schedules-list">
        <h2>Your Schedules</h2>

        {loading ? (
          <p className="schedules-empty">Loading...</p>
        ) : schedules.length === 0 ? (
          <p className="schedules-empty">No schedules yet. Add one above!</p>
        ) : (
          schedules.map((s) => (
            <div
              key={s._id}
              className={`schedule-item ${!s.isActive ? "inactive" : ""}`}
            >
              <div className="schedule-info">
                <span className="schedule-device">
                  💡 {getDeviceName(s.deviceId)}
                </span>
                <span
                  className={`schedule-action ${s.action === "on" ? "on" : "off"}`}
                >
                  {s.action === "on" ? "Turn ON" : "Turn OFF"}
                </span>
                <span className="schedule-time">🕐 {s.time}</span>
                <span className="schedule-repeat">
                  🔁 {s.repeat === "daily" ? "Daily" : "Once"}
                </span>
              </div>

              <div className="schedule-actions">
                <button
                  className={`toggle-btn ${s.isActive ? "active" : "paused"}`}
                  onClick={() => handleToggle(s._id)}
                  title={s.isActive ? "Pause" : "Resume"}
                >
                  {s.isActive ? "⏸" : "▶"}
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(s._id)}
                  title="Delete"
                >
                  🗑
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
