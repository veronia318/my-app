// Shared device details modal (graphs + readings), used by both the
// Live Readings page and the Room Details page when a device is clicked.
import React, { useState, useEffect, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { X } from "lucide-react";
import "../styles/LiveReadings.css";
import API_ENDPOINTS, {
  fetchWithAuth,
  USE_JSON_SERVER,
} from "../../infrastructure/api/api.config";

const HISTORY_LIMIT = 20;

const METRIC_CONFIG = {
  power: { label: "Power (W)", color: "#4a148c", unit: "W" },
  voltage: { label: "Voltage (V)", color: "#00bcd4", unit: "V" },
  current: { label: "Current (A)", color: "#43a047", unit: "A" },
};

/**
 * DeviceDetailsModal
 *
 * Props:
 * - device: the selected device object (required to render anything)
 * - onClose: callback to close the modal
 * - inMemoryHistory: optional locally-tracked history (used as a fallback
 *   when the real backend history hasn't loaded yet, e.g. on Live Readings
 *   where readings accumulate while the page is open)
 */
const DeviceDetailsModal = ({ device, onClose, inMemoryHistory = [] }) => {
  const [realHistory, setRealHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [monthlyAvg, setMonthlyAvg] = useState(null);
  const [yearlyAvg, setYearlyAvg] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState("power");

  const fetchRealHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const response = await fetchWithAuth(
        API_ENDPOINTS.READING_BY_DEVICE(device.id),
      );
      if (!response.ok) throw new Error("Failed to fetch readings");
      const data = await response.json();
      const readings = Array.isArray(data) ? data : data.readings || [];

      const chartData = readings
        .slice()
        .reverse()
        .slice(-HISTORY_LIMIT)
        .map((r) => ({
          time: new Date(r.createdAt).toLocaleTimeString(),
          power: r.power || 0,
          voltage: r.voltage || 0,
          current: r.current || 0,
        }));

      setRealHistory(chartData);
    } catch (err) {
      console.error("Error fetching readings history:", err);
      setRealHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, [device]);

  const fetchMonthlyYearlyStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      const monthlyUrl = `${API_ENDPOINTS.MONTHLY_STATS}?deviceId=${device.id}&month=${month}&year=${year}`;
      const yearlyUrl = `${API_ENDPOINTS.YEARLY_STATS}?deviceId=${device.id}&year=${year}`;

      const [monthlyRes, yearlyRes] = await Promise.all([
        fetchWithAuth(monthlyUrl),
        fetchWithAuth(yearlyUrl),
      ]);

      if (monthlyRes.ok) {
        const monthlyData = await monthlyRes.json();
        // ✅ Backend returns { daily, monthlyTotal, monthlyAverage }
        setMonthlyAvg(monthlyData?.monthlyAverage ?? null);
      }

      if (yearlyRes.ok) {
        const yearlyData = await yearlyRes.json();
        // ✅ Backend returns { monthly, yearlyTotal, yearlyAverage }
        setYearlyAvg(yearlyData?.yearlyAverage ?? null);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoadingStats(false);
    }
  }, [device]);

  useEffect(() => {
    if (!device) return;
    if (!USE_JSON_SERVER) {
      fetchRealHistory();
      fetchMonthlyYearlyStats();
    }
  }, [device, fetchRealHistory, fetchMonthlyYearlyStats]);

  if (!device) return null;

  const historyData =
    !USE_JSON_SERVER && realHistory.length > 0 ? realHistory : inMemoryHistory;

  const calculateAverage = () => {
    if (!historyData || historyData.length === 0) return 0;
    const total = historyData.reduce((sum, item) => sum + (item.power || 0), 0);
    return (total / historyData.length).toFixed(2);
  };

  const averagePower = calculateAverage();

  const displayMonthlyAvg =
    monthlyAvg !== null
      ? Number(monthlyAvg).toFixed(2)
      : (device.monthlyAverage ?? averagePower);

  const displayYearlyAvg =
    yearlyAvg !== null
      ? Number(yearlyAvg).toFixed(2)
      : (device.yearlyAverage ?? averagePower);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{device.name} - Details</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          <div className="device-stats">
            <div
              className={`stat-box ${selectedMetric === "voltage" ? "stat-box-active" : ""}`}
              onClick={() => setSelectedMetric("voltage")}
              style={{ cursor: "pointer" }}
            >
              <h4>Voltage</h4>
              <p
                className="stat-value"
                style={{
                  color: selectedMetric === "voltage" ? "#00bcd4" : undefined,
                }}
              >
                {device.voltage.toFixed(2)} V
              </p>
            </div>
            <div
              className={`stat-box ${selectedMetric === "current" ? "stat-box-active" : ""}`}
              onClick={() => setSelectedMetric("current")}
              style={{ cursor: "pointer" }}
            >
              <h4>Current</h4>
              <p
                className="stat-value"
                style={{
                  color: selectedMetric === "current" ? "#43a047" : undefined,
                }}
              >
                {device.current.toFixed(2)} A
              </p>
            </div>
            <div
              className={`stat-box ${selectedMetric === "power" ? "stat-box-active" : ""}`}
              onClick={() => setSelectedMetric("power")}
              style={{ cursor: "pointer" }}
            >
              <h4>Power</h4>
              <p
                className="stat-value"
                style={{
                  color: selectedMetric === "power" ? "#4a148c" : undefined,
                }}
              >
                {device.power.toFixed(2)} W
              </p>
            </div>
            <div className="stat-box">
              <h4>Status</h4>
              <p
                className={`stat-value ${device.status === "ON" ? "text-success" : "text-danger"}`}
              >
                {device.status}
              </p>
            </div>

            <div className="stat-box">
              <h4>Avg. Power (Monthly)</h4>
              <p className="stat-value" style={{ color: "#4a148c" }}>
                {loadingStats ? "..." : `${displayMonthlyAvg} W`}
              </p>
            </div>

            <div className="stat-box">
              <h4>Avg. Power (Yearly)</h4>
              <p className="stat-value" style={{ color: "#ff8f00" }}>
                {loadingStats ? "..." : `${displayYearlyAvg} W`}
              </p>
            </div>

            <div className="stat-box">
              <h4>Temperature</h4>
              <p className="stat-value" style={{ color: "#e53935" }}>
                {device.temperature !== null && device.temperature !== undefined
                  ? `${device.temperature} °C`
                  : "N/A"}
              </p>
            </div>

            <div className="stat-box">
              <h4>Humidity</h4>
              <p className="stat-value" style={{ color: "#1e88e5" }}>
                {device.humidity !== null && device.humidity !== undefined
                  ? `${device.humidity} %`
                  : "N/A"}
              </p>
            </div>
          </div>

          <div className="device-graph">
            <h3>
              {METRIC_CONFIG[selectedMetric].label} History{" "}
              {loadingHistory && (
                <span style={{ fontSize: "13px", color: "#888" }}>
                  Loading...
                </span>
              )}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey={selectedMetric}
                  stroke={METRIC_CONFIG[selectedMetric].color}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name={METRIC_CONFIG[selectedMetric].label}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceDetailsModal;
