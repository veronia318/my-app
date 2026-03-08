import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, X, PlusCircle, Pencil, Check } from "lucide-react";
import "../styles/RoomDetails.css";
import API_ENDPOINTS, {
  fetchWithAuth,
  normalizeDevice,
  USE_JSON_SERVER,
} from "../../infrastructure/api/api.config";
import { useAuth } from "../../application/auth/AuthContext";

export default function RoomDetails() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [room, setRoom] = useState(null);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newDeviceData, setNewDeviceData] = useState({ name: "" });

  // ✅ NEW — edit state
  const [editingDeviceId, setEditingDeviceId] = useState(null);
  const [editDeviceData, setEditDeviceData] = useState({ name: "" });

  const fetchRoomAndDevices = useCallback(async () => {
    try {
      const roomResponse = await fetchWithAuth(
        API_ENDPOINTS.ROOM_BY_ID(roomId),
      );
      if (!roomResponse.ok) throw new Error("Room not found");
      const roomData = await roomResponse.json();

      setRoom({
        id: roomData._id || roomData.id,
        name: roomData.name,
        userId: roomData.userId,
        image: roomData.image,
      });

      const devicesResponse = await fetchWithAuth(
        API_ENDPOINTS.DEVICES_BY_ROOM(roomId),
      );
      if (!devicesResponse.ok) throw new Error("Failed to fetch devices");
      const devicesData = await devicesResponse.json();

      const normalizedDevices = devicesData.map(normalizeDevice);
      setDevices(normalizedDevices);
      setLoading(false);
    } catch (err) {
      console.error("Error:", err);
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    fetchRoomAndDevices();
  }, [fetchRoomAndDevices]);

  const handleAddDevice = async (e) => {
    e.preventDefault();

    if (!newDeviceData.name) {
      alert("Please enter device name.");
      return;
    }

    const devicePayload = USE_JSON_SERVER
      ? {
          name: newDeviceData.name,
          roomId: roomId,
          userId: user.id,
          state: "off",
          image: null,
          latestReading: { voltage: 0, current: 0, power: 0 },
          yearlyAverage: 0,
        }
      : {
          name: newDeviceData.name,
          roomId: roomId,
        };

    try {
      const response = await fetchWithAuth(API_ENDPOINTS.DEVICES, {
        method: "POST",
        body: JSON.stringify(devicePayload),
      });

      if (!response.ok) throw new Error("Failed to add device");

      const addedDevice = await response.json();
      const normalizedDevice = normalizeDevice({
        ...addedDevice,
        userId: user.id,
        roomId: roomId,
      });

      setDevices((prev) => [...prev, normalizedDevice]);
      setNewDeviceData({ name: "" });
      setIsAdding(false);
    } catch (err) {
      console.error("Error adding device:", err);
      alert("Failed to add device: " + err.message);
    }
  };

  const removeDevice = async (deviceId) => {
    const deviceToRemove = devices.find((d) => d.id === deviceId);
    if (
      !window.confirm(
        `Are you sure you want to remove "${deviceToRemove.name}"?`,
      )
    )
      return;

    try {
      const response = await fetchWithAuth(
        API_ENDPOINTS.DEVICE_BY_ID(deviceId),
        { method: "DELETE" },
      );
      if (!response.ok) throw new Error("Failed to delete device");
      setDevices((prev) => prev.filter((device) => device.id !== deviceId));
    } catch (err) {
      console.error("Error removing device:", err);
      alert("Failed to remove device: " + err.message);
    }
  };

  // ✅ NEW — open edit form for a specific device
  const handleStartEdit = (e, device) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingDeviceId(device.id);
    setEditDeviceData({ name: device.name });
  };

  // ✅ NEW — save edited device → PUT /devices/:id
  const handleUpdateDevice = async (e, deviceId) => {
    e.preventDefault();

    if (!editDeviceData.name) {
      alert("Device name cannot be empty.");
      return;
    }

    try {
      const response = await fetchWithAuth(
        API_ENDPOINTS.DEVICE_BY_ID(deviceId),
        {
          method: "PUT",
          body: JSON.stringify({
            name: editDeviceData.name,
          }),
        },
      );

      if (!response.ok) throw new Error("Failed to update device");

      const data = await response.json();
      // Backend returns { message, device }
      const updatedDevice = data.device || data;

      setDevices((prev) =>
        prev.map((d) =>
          d.id === deviceId ? normalizeDevice({ ...d, ...updatedDevice }) : d,
        ),
      );

      setEditingDeviceId(null);
    } catch (err) {
      console.error("Error updating device:", err);
      alert("Failed to update device: " + err.message);
    }
  };

  const handleChange = (e) => {
    setNewDeviceData({ ...newDeviceData, [e.target.name]: e.target.value });
  };

  // ✅ NEW — handle edit form input change
  const handleEditChange = (e) => {
    setEditDeviceData({ ...editDeviceData, [e.target.name]: e.target.value });
  };

  if (loading) return <div className="loading">Loading... ⏳</div>;
  if (!room) return <div className="error">Room not found!</div>;

  return (
    <div className="room-details-container">
      <div className="room-details-header">
        <button className="back-btn" onClick={() => navigate("/rooms")}>
          <ArrowLeft size={20} /> Back to Rooms
        </button>
        <h1>{room.name}</h1>
        <button className="add-device-button" onClick={() => setIsAdding(true)}>
          <PlusCircle size={20} /> Add Device
        </button>
      </div>

      {isAdding && (
        <div className="add-device-form-container">
          <form onSubmit={handleAddDevice} className="add-device-form">
            <h3>Add New Device</h3>
            <input
              type="text"
              name="name"
              value={newDeviceData.name}
              onChange={handleChange}
              placeholder="Device Name (e.g., LED Light, Fan)"
              className="add-device-input"
              required
            />
            <div className="form-buttons">
              <button type="submit" className="form-submit-btn">
                Add Device
              </button>
              <button
                type="button"
                className="form-cancel-btn"
                onClick={() => {
                  setIsAdding(false);
                  setNewDeviceData({ name: "" });
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="devices-grid">
        {devices.length === 0 ? (
          <div className="no-devices">
            <p>No devices in this room yet.</p>
            <p>Click "Add Device" to get started!</p>
          </div>
        ) : (
          devices.map((device) => (
            <div key={device.id} className="device-card">
              {/* ✅ NEW — Edit form appears inline on the card */}
              {editingDeviceId === device.id ? (
                <form
                  onSubmit={(e) => handleUpdateDevice(e, device.id)}
                  style={{ padding: "8px" }}
                >
                  <h3 style={{ marginBottom: "10px" }}>Edit Device</h3>
                  <input
                    type="text"
                    name="name"
                    value={editDeviceData.name}
                    onChange={handleEditChange}
                    placeholder="Device Name"
                    className="add-device-input"
                    required
                  />
                  <div className="form-buttons" style={{ marginTop: "10px" }}>
                    <button type="submit" className="form-submit-btn">
                      <Check size={16} /> Save
                    </button>
                    <button
                      type="button"
                      className="form-cancel-btn"
                      onClick={() => setEditingDeviceId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                // ✅ Normal card view
                <>
                  <div className="device-header">
                    <h3>{device.name || "Unknown Device"}</h3>

                    <div style={{ display: "flex", gap: "6px" }}>
                      {/* ✅ NEW — Edit button */}
                      <button
                        className="edit-device-btn"
                        onClick={(e) => handleStartEdit(e, device)}
                        title="Edit device"
                        type="button"
                      >
                        <Pencil size={16} />
                      </button>

                      {/* Delete button */}
                      <button
                        className="remove-device-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeDevice(device.id);
                        }}
                        title="Remove device"
                        type="button"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="device-info">
                    <div className="info-row">
                      <Zap size={18} />
                      <span>Voltage: {device.voltage || 0}V</span>
                    </div>
                    <div className="info-row">
                      <Zap size={18} />
                      <span>Current: {device.current || 0}A</span>
                    </div>
                    <div className="info-row">
                      <Zap size={18} />
                      <span>Power: {device.power || 0}W</span>
                    </div>
                  </div>

                  <div className="device-status-display">
                    <span
                      className={`status-badge ${device.status === "ON" ? "active" : "inactive"}`}
                    >
                      {device.status || "OFF"}
                    </span>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
