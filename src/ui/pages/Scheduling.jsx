import React, { useState, useEffect } from "react";
import API_ENDPOINTS, {
  fetchWithAuth,
} from "../../infrastructure/api/api.config";
import "../styles/Scheduling.css";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Scheduling() {
  const [devices, setDevices] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    deviceId: "",
    action: "off",
    time: "",
    repeatType: "once",
    days: [],
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

  const handleDayToggle = (day) => {
    setFormData((prev) => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day],
    }));
  };

  const handleSubmit = async () => {
    if (!formData.deviceId || !formData.time) {
      setMessage({ type: "error", text: "Please select a device and time." });
      return;
    }
    if (formData.repeatType === "custom" && formData.days.length === 0) {
      setMessage({ type: "error", text: "Please select at least one day." });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        deviceId: formData.deviceId,
        action: formData.action,
        time: formData.time,
        repeatType: formData.repeatType,
        days: formData.repeatType === "custom" ? formData.days : [],
      };

      const res = await fetchWithAuth(API_ENDPOINTS.SCHEDULES, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Schedule created successfully!" });
        setFormData({
          deviceId: "",
          action: "off",
          time: "",
          repeatType: "once",
          days: [],
        });
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
      const res = await fetchWithAuth(API_ENDPOINTS.SCHEDULE_BY_ID(id), {
        method: "DELETE",
      });
      if (res.ok) fetchSchedules();
    } catch (err) {
      console.error("Error deleting schedule:", err);
    }
  };

  const handleToggleEnabled = async (schedule) => {
    try {
      const res = await fetchWithAuth(
        API_ENDPOINTS.SCHEDULE_BY_ID(schedule._id),
        {
          method: "PUT",
          body: JSON.stringify({ enabled: !schedule.enabled }),
        },
      );
      if (res.ok) fetchSchedules();
    } catch (err) {
      console.error("Error updating schedule:", err);
    }
  };

  const getDeviceName = (deviceId) => {
    const id = deviceId?._id || deviceId?.id || deviceId;
    const device = devices.find((d) => (d._id || d.id) === id);
    return device ? device.name : "Unknown Device";
  };

  const formatRepeat = (s) => {
    if (s.repeatType === "daily") return "Daily";
    if (s.repeatType === "once") return "Once";
    if (s.repeatType === "custom" && s.days?.length) return s.days.join(", ");
    return "Once";
  };

  return (
    <div className="scheduling-container">
      <h1 className="scheduling-title">⏱ Device Scheduling</h1>
      <p className="scheduling-subtitle">
        Set timers to automatically turn your devices on or off.
      </p>

      {/* ── Form ── */}
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
              value={formData.repeatType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  repeatType: e.target.value,
                  days: [],
                })
              }
            >
              <option value="once">Once</option>
              <option value="daily">Daily</option>
              <option value="custom">Custom Days</option>
            </select>
          </div>
        </div>

        {/* Custom days selector */}
        {formData.repeatType === "custom" && (
          <div className="days-selector">
            {DAYS.map((day) => (
              <button
                key={day}
                className={`day-btn ${formData.days.includes(day) ? "selected" : ""}`}
                onClick={() => handleDayToggle(day)}
                type="button"
              >
                {day}
              </button>
            ))}
          </div>
        )}

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

      {/* ── List ── */}
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
              className={`schedule-item ${!s.enabled ? "inactive" : ""}`}
            >
              <div className="schedule-info">
                <span className="schedule-device">
                  💡 {getDeviceName(s.deviceId)}
                </span>
                <span className={`schedule-action ${s.action}`}>
                  {s.action === "on" ? "Turn ON" : "Turn OFF"}
                </span>
                <span className="schedule-time">🕐 {s.time}</span>
                <span className="schedule-repeat">🔁 {formatRepeat(s)}</span>
              </div>

              <div className="schedule-actions">
                <button
                  className={`toggle-btn ${s.enabled ? "active" : "paused"}`}
                  onClick={() => handleToggleEnabled(s)}
                  title={s.enabled ? "Pause" : "Resume"}
                >
                  {s.enabled ? "⏸" : "▶"}
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
