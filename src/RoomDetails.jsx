import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, Trash2, PlusCircle } from "lucide-react";
import "./RoomDetails.css";

const ROOMS_API = "https://69763da3c0c36a2a99509b94.mockapi.io/rooms";
const DEVICES_API = "https://69763da3c0c36a2a99509b94.mockapi.io/devices";

export default function RoomDetails() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newDeviceData, setNewDeviceData] = useState({
    name: "",
    voltage: "",
    current: "",
    power: "",
    status: "OFF",
  });

  // 🔹 جلب بيانات الغرفة + الأجهزة
  useEffect(() => {
    fetchRoom();
  }, [roomId]);

  const fetchRoom = async () => {
    try {
      const response = await fetch(`${ROOMS_API}/${roomId}`);
      if (!response.ok) throw new Error("Room not found");

      const roomData = await response.json();
      setRoom(roomData);
      setDevices(roomData.devices || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // 🔹 إضافة جهاز جديد
  const handleAddDevice = async (e) => {
    e.preventDefault();

    if (
      !newDeviceData.name ||
      !newDeviceData.voltage ||
      !newDeviceData.current ||
      !newDeviceData.power
    ) {
      alert("Please fill in all device information.");
      return;
    }

    const newDevice = {
      name: newDeviceData.name,
      voltage: parseFloat(newDeviceData.voltage),
      current: parseFloat(newDeviceData.current),
      power: parseFloat(newDeviceData.power),
      status: newDeviceData.status,
      roomId: roomId, // ✅ عشان نعرف الجهاز في أنهي غرفة
    };

    try {
      // ✅ 1. أضف الجهاز في `/devices` الأول
      const deviceResponse = await fetch(DEVICES_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDevice),
      });

      if (!deviceResponse.ok)
        throw new Error("Failed to add device to main list");

      const addedDevice = await deviceResponse.json();

      // ✅ 2. بعدين أضفه للغرفة (مع الـ id اللي MockAPI عمله)
      const updatedDevices = [...devices, { ...addedDevice }];

      const roomResponse = await fetch(`${ROOMS_API}/${roomId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: room.name,
          devices: updatedDevices,
        }),
      });

      if (!roomResponse.ok) throw new Error("Failed to add device to room");

      const updatedRoom = await roomResponse.json();
      setRoom(updatedRoom);
      setDevices(updatedDevices);
      setNewDeviceData({
        name: "",
        voltage: "",
        current: "",
        power: "",
        status: "OFF",
      });
      setIsAdding(false);
      alert("Device added successfully! ✅");
    } catch (err) {
      console.error("Error adding device:", err);
      alert("Failed to add device: " + err.message);
    }
  };

  // 🔹 حذف جهاز
  const removeDevice = async (index) => {
    const deviceToRemove = devices[index];
    console.log("Remove button clicked for device:", deviceToRemove);

    if (
      !window.confirm(
        `Are you sure you want to remove "${deviceToRemove.name}"?`,
      )
    ) {
      console.log("User cancelled removal");
      return;
    }

    try {
      console.log("Starting device removal...");

      // ✅ 1. احذف من `/devices` لو عنده id
      if (deviceToRemove.id) {
        console.log("Deleting from main devices list...");
        const deleteResponse = await fetch(
          `${DEVICES_API}/${deviceToRemove.id}`,
          {
            method: "DELETE",
          },
        );

        if (!deleteResponse.ok) {
          console.warn("Could not delete from main devices list");
        } else {
          console.log("Deleted from main devices list successfully");
        }
      }

      // ✅ 2. احذف من الغرفة
      const updatedDevices = devices.filter((_, i) => i !== index);
      console.log("Updated devices array:", updatedDevices);

      const dataToSend = {
        name: room.name,
        devices: updatedDevices,
      };
      console.log("Sending data to room API:", dataToSend);

      const response = await fetch(`${ROOMS_API}/${roomId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      console.log("Room API Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        throw new Error("Failed to remove device from room");
      }

      const updatedRoom = await response.json();
      console.log("Device removed successfully:", updatedRoom);

      setRoom(updatedRoom);
      setDevices(updatedDevices);
      alert("Device removed successfully! 🗑️");
    } catch (err) {
      console.error("Error removing device:", err);
      alert("Failed to remove device: " + err.message);
    }
  };

  const handleChange = (e) => {
    setNewDeviceData({ ...newDeviceData, [e.target.name]: e.target.value });
  };

  if (loading) {
    return <div className="loading">Loading... ⏳</div>;
  }

  if (!room) {
    return <div className="error">Room not found!</div>;
  }

  return (
    <div className="room-details-container">
      {/* 🔙 Header */}
      <div className="room-details-header">
        <button className="back-btn" onClick={() => navigate("/rooms")}>
          <ArrowLeft size={20} /> Back to Rooms
        </button>
        <h1>{room.name}</h1>
        <button className="add-device-button" onClick={() => setIsAdding(true)}>
          <PlusCircle size={20} /> Add Device
        </button>
      </div>

      {/* 📝 نموذج إضافة جهاز */}
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
              required
            />

            <input
              type="number"
              name="voltage"
              value={newDeviceData.voltage}
              onChange={handleChange}
              placeholder="Voltage (V)"
              step="0.1"
              required
            />

            <input
              type="number"
              name="current"
              value={newDeviceData.current}
              onChange={handleChange}
              placeholder="Current (A)"
              step="0.1"
              required
            />

            <input
              type="number"
              name="power"
              value={newDeviceData.power}
              onChange={handleChange}
              placeholder="Power (W)"
              step="0.1"
              required
            />

            <select
              name="status"
              value={newDeviceData.status}
              onChange={handleChange}
            >
              <option value="OFF">OFF</option>
              <option value="ON">ON</option>
            </select>

            <div className="form-buttons">
              <button type="submit" className="form-submit-btn">
                Add Device
              </button>
              <button
                type="button"
                className="form-cancel-btn"
                onClick={() => {
                  setIsAdding(false);
                  setNewDeviceData({
                    name: "",
                    voltage: "",
                    current: "",
                    power: "",
                    status: "OFF",
                  });
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 🧠 الأجهزة */}
      <div className="devices-grid">
        {devices.length === 0 ? (
          <div className="no-devices">
            <p>No devices in this room yet.</p>
            <p>Click "Add Device" to get started!</p>
          </div>
        ) : (
          devices.map((device, index) => (
            <div key={index} className="device-card">
              <div className="device-header">
                <h3>{device.name}</h3>
                <button
                  className="remove-device-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeDevice(index);
                  }}
                  title="Remove device"
                  type="button"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="device-info">
                <div className="info-row">
                  <Zap size={18} />
                  <span>Voltage: {device.voltage}V</span>
                </div>
                <div className="info-row">
                  <Zap size={18} />
                  <span>Current: {device.current}A</span>
                </div>
                <div className="info-row">
                  <Zap size={18} />
                  <span>Power: {device.power}W</span>
                </div>
              </div>

              <div className="device-status-display">
                <span
                  className={`status-badge ${device.status === "ON" ? "active" : "inactive"}`}
                >
                  {device.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
