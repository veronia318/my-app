import React, { useState, useEffect } from "react";
import { Bolt, Zap, Activity } from "lucide-react";
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

export default function HomePage() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserDevices();
      const interval = setInterval(fetchUserDevices, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUserDevices = async () => {
    try {
      const roomsResponse = await fetchWithAuth(API_ENDPOINTS.ROOMS);
      if (!roomsResponse.ok) throw new Error("Failed to fetch rooms");
      const allRooms = await roomsResponse.json();

      const userRooms = USE_JSON_SERVER
        ? allRooms.filter((room) => room.userId === user.id)
        : allRooms;

      const userRoomIds = userRooms.map((room) => room._id || room.id);

      const devicesResponse = await fetchWithAuth(API_ENDPOINTS.DEVICES);
      if (!devicesResponse.ok) throw new Error("Failed to fetch devices");
      const allDevices = await devicesResponse.json();

      const userDevices = allDevices.filter((device) =>
        userRoomIds.includes(device.roomId),
      );

      const normalizedDevices = userDevices.map(normalizeDevice);
      setDevices(normalizedDevices);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching devices:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (!devices.length)
      return { totalPower: 0, activeDevices: 0, totalCurrent: 0 };

    const activeDevices = devices.filter((d) => d.status === "ON").length;

    const totalPower = devices
      .filter((d) => d.status === "ON")
      .reduce((sum, device) => sum + (parseFloat(device.power) || 0), 0);

    const totalCurrent = devices
      .filter((d) => d.status === "ON")
      .reduce((sum, device) => sum + (parseFloat(device.current) || 0), 0);

    return {
      totalPower: totalPower.toFixed(1),
      activeDevices,
      totalDevices: devices.length,
      totalCurrent: totalCurrent.toFixed(2),
    };
  };

  const getAlerts = () => {
    const alerts = [];

    devices.forEach((device) => {
      if (device.status === "OFF") {
        alerts.push(`Device '${device.name}' is turned OFF.`);
      }

      if (device.status === "ON" && parseFloat(device.power) > 70) {
        alerts.push(
          `High power consumption in ${device.name}: ${device.power}W`,
        );
      }

      if (device.status === "ON" && parseFloat(device.current) > 50) {
        alerts.push(
          `High current detected in ${device.name}: ${device.current}A`,
        );
      }

      if (device.status === "ON" && parseFloat(device.voltage) < 200) {
        alerts.push(
          `Low voltage warning for ${device.name}: ${device.voltage}V`,
        );
      }
    });

    return alerts.slice(0, 5);
  };

  const stats = calculateStats();
  const alerts = getAlerts();

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
      title: "Total Current",
      value: loading ? "..." : stats.totalCurrent,
      unit: "Amperes",
      icon: <Activity size={32} />,
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

      <div className="widgets-grid">
        {statsWidgets.map((stat, index) => (
          <HomeWidget key={index} {...stat} />
        ))}
      </div>

      {alerts.length > 0 && (
        <div className="alerts-section">
          <h2>⚠️ Important Alerts</h2>
          <ul>
            {alerts.map((alert, index) => (
              <li key={index}>{alert}</li>
            ))}
          </ul>
        </div>
      )}

      {alerts.length === 0 && !loading && devices.length > 0 && (
        <div className="alerts-section" style={{ borderTopColor: "#32CD32" }}>
          <h2 style={{ color: "#32CD32" }}>✓ All Systems Normal</h2>
          <p style={{ color: "#888", margin: 0 }}>
            No alerts at this time. Everything is running smoothly!
          </p>
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
