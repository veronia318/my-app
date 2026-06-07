import React, { useState, useEffect } from "react";
import { Bolt, Zap, Home, PowerOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/Homepage.css";
import { useAuth } from "../../application/auth/AuthContext";
import API_ENDPOINTS, {
  fetchWithAuth,
  normalizeDevice,
  USE_JSON_SERVER,
} from "../../infrastructure/api/api.config";

const HomeWidget = ({ title, value, unit, icon, color }) => (
  <div className="home-widget" style={{ borderLeftColor: color }}>
    <div className="widget-header">
      <div className="widget-icon" style={{ color }}>
        {icon}
      </div>
      <h3 className="widget-title">{title}</h3>
    </div>
    <p className="widget-value" style={{ color }}>
      {value}
    </p>
    <p className="widget-unit">{unit}</p>
  </div>
);

// ── Device Status Card ──────────────────────────────────────────────────────
const DeviceStatusCard = ({ device, onClick }) => {
  // Placeholder logic until backend AI is ready
  const isAbnormal =
    (device.status === "ON" && parseFloat(device.power) > 70) ||
    (device.status === "ON" && parseFloat(device.voltage) < 200);

  const statusLabel = isAbnormal ? "Abnormal" : "Normal";
  const statusColor = isAbnormal ? "#e53935" : "#32CD32";
  const statusBg = isAbnormal ? "rgba(229,57,53,0.12)" : "rgba(50,205,50,0.10)";

  return (
    <div
      className="device-status-card"
      onClick={() => onClick(device.id)}
      style={{ borderLeftColor: statusColor, cursor: "pointer" }}
    >
      <div className="device-status-card__top">
        <span className="device-status-card__name">💡 {device.name}</span>
        <span
          className="device-status-card__badge"
          style={{ color: statusColor, background: statusBg }}
        >
          {statusLabel}
        </span>
      </div>
      <p className="device-status-card__hint">
        Tap to view AI recommendations →
      </p>
    </div>
  );
};

export default function HomePage() {
  const [devices, setDevices] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [togglingAll, setTogglingAll] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchUserDevices();
      const interval = setInterval(fetchUserDevices, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUserDevices = async () => {
    try {
      const devicesResponse = await fetchWithAuth(API_ENDPOINTS.DEVICES);
      if (!devicesResponse.ok) throw new Error("Failed to fetch devices");

      const devicesData = await devicesResponse.json();

      const allDevices = USE_JSON_SERVER
        ? Array.isArray(devicesData)
          ? devicesData
          : []
        : Array.isArray(devicesData)
          ? devicesData.flatMap((item) =>
              item.devices ? item.devices : [item],
            )
          : [];

      const devicesWithReadings = await Promise.all(
        allDevices.map(async (device) => {
          try {
            const deviceId = device._id || device.id;
            const readingResponse = await fetchWithAuth(
              API_ENDPOINTS.DEVICE_WITH_LATEST_READING(deviceId),
            );
            if (readingResponse.ok) {
              const deviceWithReading = await readingResponse.json();
              return {
                ...device,
                latestReading:
                  deviceWithReading.latestReading || device.latestReading,
              };
            }
            return device;
          } catch {
            return device;
          }
        }),
      );

      const normalizedDevices = devicesWithReadings.map(normalizeDevice);

      const roomsResponse = await fetchWithAuth(API_ENDPOINTS.ROOMS);
      if (roomsResponse.ok) {
        const roomsData = await roomsResponse.json();
        setRooms(Array.isArray(roomsData) ? roomsData : []);
      }

      setDevices(normalizedDevices);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching devices:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleToggleAll = async (newStatus) => {
    if (togglingAll) return;
    setTogglingAll(true);
    try {
      if (newStatus === "OFF") {
        await fetchWithAuth(API_ENDPOINTS.ALL_DEVICES_OFF, { method: "PUT" });
      } else {
        await Promise.all(
          devices.map((device) =>
            fetchWithAuth(API_ENDPOINTS.DEVICE_STATE(device.id), {
              method: "PUT",
              body: JSON.stringify({ state: "on" }),
            }),
          ),
        );
      }
      await fetchUserDevices();
    } catch (err) {
      console.error("Error toggling all devices:", err);
    } finally {
      setTogglingAll(false);
    }
  };

  const handleDeviceCardClick = (deviceId) => {
    navigate(`/ai-analysis?deviceId=${deviceId}`);
  };

  const calculateStats = () => {
    if (!devices.length)
      return { totalPower: 0, activeDevices: 0, totalDevices: 0 };

    const activeDevices = devices.filter((d) => d.status === "ON").length;
    const totalPower = devices
      .filter((d) => d.status === "ON")
      .reduce((sum, device) => sum + (parseFloat(device.power) || 0), 0);

    return {
      totalPower: totalPower.toFixed(1),
      activeDevices,
      totalDevices: devices.length,
    };
  };

  const stats = calculateStats();

  const statsWidgets = [
    {
      title: "Total Power Consumption",
      value: loading ? "..." : stats.totalPower,
      unit: "Watts",
      icon: <Bolt size={32} />,
      color: "#FFD700",
    },
    {
      title: "Active Devices",
      value: loading ? "..." : stats.activeDevices,
      unit: `of ${stats.totalDevices} devices`,
      icon: <Zap size={32} />,
      color: "#32CD32",
    },
    {
      title: "Total Rooms",
      value: loading ? "..." : rooms.length,
      unit: rooms.length === 1 ? "room" : "rooms",
      icon: <Home size={32} />,
      color: "#00BFFF",
    },
  ];

  if (error) {
    return (
      <div className="home-container">
        <div className="error-message">
          <h2>⚠️ Error Loading Data</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <h1 className="main-title">Smart Home Overview</h1>
      <p className="subtitle">
        {loading
          ? "Loading your home's status..."
          : `Welcome back${user ? ", " + (user.name || user.firstname || "User") : ""}! Quick glance at your home's status.`}
      </p>

      {/* ── Stats Widgets ── */}
      <div className="widgets-grid">
        {statsWidgets.map((stat, index) => (
          <HomeWidget key={index} {...stat} />
        ))}
      </div>

      {/* ── Quick Actions ── */}
      {devices.length > 0 && (
        <div className="quick-actions-section">
          <h2 className="quick-actions-title">⚡ Quick Actions</h2>
          <div className="quick-actions-buttons">
            <button
              className="quick-action-btn all-off-btn"
              onClick={() => handleToggleAll("OFF")}
              disabled={togglingAll}
            >
              <PowerOff size={18} />
              {togglingAll ? "..." : "All Off"}
            </button>
          </div>
        </div>
      )}

      {/* ── Device AI Status ── */}
      {!loading && devices.length > 0 && (
        <div className="device-status-section">
          <h2 className="device-status-title">🤖 AI Device Status</h2>
          <p className="device-status-subtitle">
            Tap a device to view AI recommendations
          </p>
          <div className="device-status-grid">
            {devices.map((device) => (
              <DeviceStatusCard
                key={device.id}
                device={device}
                onClick={handleDeviceCardClick}
              />
            ))}
          </div>
        </div>
      )}

      {!loading && devices.length === 0 && (
        <div className="alerts-section" style={{ borderTopColor: "#00BFFF" }}>
          <h2 style={{ color: "#00BFFF" }}>📊 No Devices Yet</h2>
          <p style={{ color: "#888", margin: 0 }}>
            Add rooms and devices to see your smart home overview!
          </p>
        </div>
      )}
    </div>
  );
}
