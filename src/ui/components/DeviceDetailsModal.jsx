// // Shared device details modal (graphs + readings), used by both the
// // Live Readings page and the Room Details page when a device is clicked.
// import React, { useState, useEffect, useCallback } from "react";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";
// import { X } from "lucide-react";
// import "../styles/LiveReadings.css";
// import API_ENDPOINTS, {
//   fetchWithAuth,
//   USE_JSON_SERVER,
// } from "../../infrastructure/api/api.config";

// const HISTORY_LIMIT = 20;

// const METRIC_CONFIG = {
//   power: { label: "Power (W)", color: "#4a148c", unit: "W" },
//   voltage: { label: "Voltage (V)", color: "#00bcd4", unit: "V" },
//   current: { label: "Current (A)", color: "#43a047", unit: "A" },
// };

// /**
//  * DeviceDetailsModal
//  *
//  * Props:
//  * - device: the selected device object (required to render anything)
//  * - onClose: callback to close the modal
//  * - inMemoryHistory: optional locally-tracked history (used as a fallback
//  *   when the real backend history hasn't loaded yet, e.g. on Live Readings
//  *   where readings accumulate while the page is open)
//  */
// const DeviceDetailsModal = ({ device, onClose, inMemoryHistory = [] }) => {
//   const [realHistory, setRealHistory] = useState([]);
//   const [loadingHistory, setLoadingHistory] = useState(false);
//   const [monthlyAvg, setMonthlyAvg] = useState(null);
//   const [yearlyAvg, setYearlyAvg] = useState(null);
//   const [loadingStats, setLoadingStats] = useState(false);
//   const [selectedMetric, setSelectedMetric] = useState("power");

//   const fetchRealHistory = useCallback(async () => {
//     setLoadingHistory(true);
//     try {
//       const response = await fetchWithAuth(
//         API_ENDPOINTS.READING_BY_DEVICE(device.id),
//       );
//       if (!response.ok) throw new Error("Failed to fetch readings");
//       const data = await response.json();
//       const readings = Array.isArray(data) ? data : data.readings || [];

//       const chartData = readings
//         .slice()
//         .reverse()
//         .slice(-HISTORY_LIMIT)
//         .map((r) => ({
//           time: new Date(r.createdAt).toLocaleTimeString(),
//           power: r.power || 0,
//           voltage: r.voltage || 0,
//           current: r.current || 0,
//         }));

//       setRealHistory(chartData);
//     } catch (err) {
//       console.error("Error fetching readings history:", err);
//       setRealHistory([]);
//     } finally {
//       setLoadingHistory(false);
//     }
//   }, [device]);

//   const fetchMonthlyYearlyStats = useCallback(async () => {
//     setLoadingStats(true);
//     try {
//       const now = new Date();
//       const month = now.getMonth() + 1;
//       const year = now.getFullYear();

//       const monthlyUrl = `${API_ENDPOINTS.MONTHLY_STATS}?deviceId=${device.id}&month=${month}&year=${year}`;
//       const yearlyUrl = `${API_ENDPOINTS.YEARLY_STATS}?deviceId=${device.id}&year=${year}`;

//       const [monthlyRes, yearlyRes] = await Promise.all([
//         fetchWithAuth(monthlyUrl),
//         fetchWithAuth(yearlyUrl),
//       ]);

//       if (monthlyRes.ok) {
//         const monthlyData = await monthlyRes.json();
//         // ✅ Backend returns { daily, monthlyTotal, monthlyAverage }
//         setMonthlyAvg(monthlyData?.monthlyAverage ?? null);
//       }

//       if (yearlyRes.ok) {
//         const yearlyData = await yearlyRes.json();
//         // ✅ Backend returns { monthly, yearlyTotal, yearlyAverage }
//         setYearlyAvg(yearlyData?.yearlyAverage ?? null);
//       }
//     } catch (err) {
//       console.error("Error fetching stats:", err);
//     } finally {
//       setLoadingStats(false);
//     }
//   }, [device]);

//   useEffect(() => {
//     if (!device) return;
//     if (!USE_JSON_SERVER) {
//       fetchRealHistory();
//       fetchMonthlyYearlyStats();
//     }
//   }, [device, fetchRealHistory, fetchMonthlyYearlyStats]);

//   if (!device) return null;

//   const historyData =
//     !USE_JSON_SERVER && realHistory.length > 0 ? realHistory : inMemoryHistory;

//   const calculateAverage = () => {
//     if (!historyData || historyData.length === 0) return 0;
//     const total = historyData.reduce((sum, item) => sum + (item.power || 0), 0);
//     return (total / historyData.length).toFixed(2);
//   };

//   const averagePower = calculateAverage();

//   const displayMonthlyAvg =
//     monthlyAvg !== null
//       ? Number(monthlyAvg).toFixed(2)
//       : (device.monthlyAverage ?? averagePower);

//   const displayYearlyAvg =
//     yearlyAvg !== null
//       ? Number(yearlyAvg).toFixed(2)
//       : (device.yearlyAverage ?? averagePower);

//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//         <div className="modal-header">
//           <h2>{device.name} - Details</h2>
//           <button className="close-btn" onClick={onClose}>
//             <X size={24} />
//           </button>
//         </div>

//         <div className="modal-body">
//           <div className="device-stats">
//             <div
//               className={`stat-box ${selectedMetric === "voltage" ? "stat-box-active" : ""}`}
//               onClick={() => setSelectedMetric("voltage")}
//               style={{ cursor: "pointer" }}
//             >
//               <h4>Voltage</h4>
//               <p
//                 className="stat-value"
//                 style={{
//                   color: selectedMetric === "voltage" ? "#00bcd4" : undefined,
//                 }}
//               >
//                 {device.voltage.toFixed(2)} V
//               </p>
//             </div>
//             <div
//               className={`stat-box ${selectedMetric === "current" ? "stat-box-active" : ""}`}
//               onClick={() => setSelectedMetric("current")}
//               style={{ cursor: "pointer" }}
//             >
//               <h4>Current</h4>
//               <p
//                 className="stat-value"
//                 style={{
//                   color: selectedMetric === "current" ? "#43a047" : undefined,
//                 }}
//               >
//                 {device.current.toFixed(2)} A
//               </p>
//             </div>
//             <div
//               className={`stat-box ${selectedMetric === "power" ? "stat-box-active" : ""}`}
//               onClick={() => setSelectedMetric("power")}
//               style={{ cursor: "pointer" }}
//             >
//               <h4>Power</h4>
//               <p
//                 className="stat-value"
//                 style={{
//                   color: selectedMetric === "power" ? "#4a148c" : undefined,
//                 }}
//               >
//                 {device.power.toFixed(2)} W
//               </p>
//             </div>
//             <div className="stat-box">
//               <h4>Status</h4>
//               <p
//                 className={`stat-value ${device.status === "ON" ? "text-success" : "text-danger"}`}
//               >
//                 {device.status}
//               </p>
//             </div>

//             <div className="stat-box">
//               <h4>Avg. Power (Monthly)</h4>
//               <p className="stat-value" style={{ color: "#4a148c" }}>
//                 {loadingStats ? "..." : `${displayMonthlyAvg} W`}
//               </p>
//             </div>

//             <div className="stat-box">
//               <h4>Avg. Power (Yearly)</h4>
//               <p className="stat-value" style={{ color: "#ff8f00" }}>
//                 {loadingStats ? "..." : `${displayYearlyAvg} W`}
//               </p>
//             </div>

//             <div className="stat-box">
//               <h4>Temperature</h4>
//               <p className="stat-value" style={{ color: "#e53935" }}>
//                 {device.temperature !== null && device.temperature !== undefined
//                   ? `${device.temperature} °C`
//                   : "N/A"}
//               </p>
//             </div>

//             <div className="stat-box">
//               <h4>Humidity</h4>
//               <p className="stat-value" style={{ color: "#1e88e5" }}>
//                 {device.humidity !== null && device.humidity !== undefined
//                   ? `${device.humidity} %`
//                   : "N/A"}
//               </p>
//             </div>
//           </div>

//           <div className="device-graph">
//             <h3>
//               {METRIC_CONFIG[selectedMetric].label} History{" "}
//               {loadingHistory && (
//                 <span style={{ fontSize: "13px", color: "#888" }}>
//                   Loading...
//                 </span>
//               )}
//             </h3>
//             <ResponsiveContainer width="100%" height={300}>
//               <LineChart data={historyData}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="time" />
//                 <YAxis />
//                 <Tooltip />
//                 <Legend />
//                 <Line
//                   type="monotone"
//                   dataKey={selectedMetric}
//                   stroke={METRIC_CONFIG[selectedMetric].color}
//                   strokeWidth={2}
//                   dot={{ r: 3 }}
//                   name={METRIC_CONFIG[selectedMetric].label}
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DeviceDetailsModal;

// // // Shared device details modal (graphs + readings), used by both the
// // // Live Readings page and the Room Details page when a device is clicked.
// // import React, { useState, useEffect, useCallback, useMemo } from "react";
// // import {
// //   LineChart,
// //   Line,
// //   XAxis,
// //   YAxis,
// //   CartesianGrid,
// //   Tooltip,
// //   Legend,
// //   ResponsiveContainer,
// // } from "recharts";
// // import { X } from "lucide-react";
// // import "../styles/LiveReadings.css";
// // import API_ENDPOINTS, {
// //   fetchWithAuth,
// //   USE_JSON_SERVER,
// // } from "../../infrastructure/api/api.config";

// // const HISTORY_LIMIT = 20;

// // const METRIC_CONFIG = {
// //   current: { label: "Current (A)", color: "#43a047", unit: "A" },
// //   voltage: { label: "Voltage (V)", color: "#00bcd4", unit: "V" },
// //   power: { label: "Power (W)", color: "#4a148c", unit: "W" },
// // };

// // const TIME_TABS = ["Today", "Week", "Month", "Year"];

// // // Grey dot if value is 0 (device was OFF)
// // const CustomDot = ({ cx, cy, payload, dataKey, color }) => {
// //   const value = payload?.[dataKey];
// //   const isOff = value === 0;
// //   return (
// //     <circle
// //       cx={cx}
// //       cy={cy}
// //       r={3}
// //       fill={isOff ? "#666" : color}
// //       stroke={isOff ? "#444" : color}
// //       strokeWidth={1}
// //     />
// //   );
// // };

// // // Filter raw readings for Today / Week tabs only
// // function filterByTab(readings, tab) {
// //   const now = new Date();
// //   return readings.filter((r) => {
// //     const t = new Date(r.rawTime);
// //     if (tab === "Today") {
// //       return (
// //         t.getFullYear() === now.getFullYear() &&
// //         t.getMonth() === now.getMonth() &&
// //         t.getDate() === now.getDate()
// //       );
// //     }
// //     if (tab === "Week") {
// //       const weekAgo = new Date(now);
// //       weekAgo.setDate(now.getDate() - 7);
// //       return t >= weekAgo;
// //     }
// //     return true;
// //   });
// // }

// // // X-axis label for Today / Week raw readings
// // function formatTime(rawTime, tab) {
// //   const t = new Date(rawTime);
// //   if (tab === "Today")
// //     return t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
// //   if (tab === "Week")
// //     return t.toLocaleDateString([], {
// //       weekday: "short",
// //       hour: "2-digit",
// //       minute: "2-digit",
// //     });
// //   return t.toLocaleTimeString();
// // }

// // const DeviceDetailsModal = ({ device, onClose, inMemoryHistory = [] }) => {
// //   const [allReadings, setAllReadings] = useState([]); // for Today & Week
// //   const [monthlyData, setMonthlyData] = useState(null); // { daily, monthlyAverage }
// //   const [yearlyData, setYearlyData] = useState(null); // { monthly, yearlyAverage }
// //   const [loadingHistory, setLoadingHistory] = useState(false);
// //   const [loadingStats, setLoadingStats] = useState(false);
// //   const [selectedMetric, setSelectedMetric] = useState("current");
// //   const [activeTab, setActiveTab] = useState("Today");

// //   const deviceId = device?.id || device?._id;

// //   // ── 1. Fetch raw readings (Today + Week tabs) ────────────────────────────
// //   const fetchRealHistory = useCallback(async () => {
// //     if (!deviceId) return;
// //     setLoadingHistory(true);
// //     try {
// //       // GET /api/readings/device/:deviceId
// //       const res = await fetchWithAuth(
// //         API_ENDPOINTS.READING_BY_DEVICE(deviceId),
// //       );
// //       if (!res.ok) throw new Error("Failed to fetch readings");
// //       const data = await res.json();
// //       const readings = Array.isArray(data) ? data : data.readings || [];

// //       // newest-first → reverse to oldest-first for the chart
// //       setAllReadings(
// //         readings
// //           .slice()
// //           .reverse()
// //           .map((r) => ({
// //             rawTime: r.createdAt,
// //             power: r.power ?? 0,
// //             voltage: r.voltage ?? 0,
// //             current: r.current ?? 0,
// //           })),
// //       );
// //     } catch (err) {
// //       console.error("Error fetching readings:", err);
// //       setAllReadings([]);
// //     } finally {
// //       setLoadingHistory(false);
// //     }
// //   }, [deviceId]);

// //   // ── 2. Fetch monthly + yearly stats (Month + Year tabs) ──────────────────
// //   const fetchStats = useCallback(async () => {
// //     if (!deviceId) return;
// //     setLoadingStats(true);
// //     try {
// //       const now = new Date();
// //       const month = now.getMonth() + 1;
// //       const year = now.getFullYear();

// //       // GET /api/stats/monthly?deviceId=...&month=...&year=...
// //       // GET /api/stats/yearly?deviceId=...&year=...
// //       const [mRes, yRes] = await Promise.all([
// //         fetchWithAuth(
// //           `${API_ENDPOINTS.MONTHLY_STATS}?deviceId=${deviceId}&month=${month}&year=${year}`,
// //         ),
// //         fetchWithAuth(
// //           `${API_ENDPOINTS.YEARLY_STATS}?deviceId=${deviceId}&year=${year}`,
// //         ),
// //       ]);

// //       if (mRes.ok) setMonthlyData(await mRes.json());
// //       if (yRes.ok) setYearlyData(await yRes.json());
// //     } catch (err) {
// //       console.error("Error fetching stats:", err);
// //     } finally {
// //       setLoadingStats(false);
// //     }
// //   }, [deviceId]);

// //   useEffect(() => {
// //     if (!device || USE_JSON_SERVER) return;
// //     fetchRealHistory();
// //     fetchStats();
// //   }, [device, fetchRealHistory, fetchStats]);

// //   // ── Build chart data based on active tab ─────────────────────────────────
// //   const chartData = useMemo(() => {
// //     // TODAY / WEEK → raw readings filtered on frontend
// //     if (activeTab === "Today" || activeTab === "Week") {
// //       const base =
// //         !USE_JSON_SERVER && allReadings.length > 0
// //           ? allReadings
// //           : inMemoryHistory;
// //       const filtered = filterByTab(base, activeTab);
// //       const limit = activeTab === "Today" ? filtered.length : HISTORY_LIMIT;
// //       const sampled =
// //         filtered.length > limit
// //           ? filtered.filter(
// //               (_, i) => i % Math.ceil(filtered.length / limit) === 0,
// //             )
// //           : filtered;
// //       return sampled.map((r) => ({
// //         time: formatTime(r.rawTime ?? r.time, activeTab),
// //         power: r.power,
// //         voltage: r.voltage,
// //         current: r.current,
// //       }));
// //     }

// //     // MONTH → use daily totals from MONTHLY_STATS
// //     // Backend: { daily: [{ day, totalPower }], monthlyAverage, monthlyTotal }
// //     // Note: stats API only returns totalPower per day (not voltage/current)
// //     // so for Month/Year we show power only regardless of selectedMetric
// //     if (activeTab === "Month" && monthlyData?.daily) {
// //       return monthlyData.daily.map((d) => ({
// //         time: `Day ${d.day}`,
// //         power: d.totalPower ?? 0,
// //         voltage: 0,
// //         current: 0,
// //       }));
// //     }

// //     // YEAR → use monthly totals from YEARLY_STATS
// //     // Backend: { monthly: [{ month, totalPower }], yearlyAverage, yearlyTotal }
// //     if (activeTab === "Year" && yearlyData?.monthly) {
// //       const MONTHS = [
// //         "Jan",
// //         "Feb",
// //         "Mar",
// //         "Apr",
// //         "May",
// //         "Jun",
// //         "Jul",
// //         "Aug",
// //         "Sep",
// //         "Oct",
// //         "Nov",
// //         "Dec",
// //       ];
// //       return yearlyData.monthly.map((m) => ({
// //         time: MONTHS[(m.month ?? 1) - 1],
// //         power: m.totalPower ?? 0,
// //         voltage: 0,
// //         current: 0,
// //       }));
// //     }

// //     return [];
// //   }, [activeTab, allReadings, inMemoryHistory, monthlyData, yearlyData]);

// //   // For Month/Year tabs the stats API only has power — force metric to power
// //   const effectiveMetric =
// //     activeTab === "Month" || activeTab === "Year" ? "power" : selectedMetric;

// //   // ── Averages for stat cards ───────────────────────────────────────────────
// //   const fallbackAvg = useMemo(() => {
// //     if (!chartData.length) return "0.00";
// //     return (
// //       chartData.reduce((s, r) => s + (r.power || 0), 0) / chartData.length
// //     ).toFixed(2);
// //   }, [chartData]);

// //   const displayMonthlyAvg =
// //     monthlyData?.monthlyAverage != null
// //       ? Number(monthlyData.monthlyAverage).toFixed(2)
// //       : (device?.monthlyAverage ?? fallbackAvg);

// //   const displayYearlyAvg =
// //     yearlyData?.yearlyAverage != null
// //       ? Number(yearlyData.yearlyAverage).toFixed(2)
// //       : (device?.yearlyAverage ?? fallbackAvg);

// //   const isLoading = loadingHistory || loadingStats;

// //   // ✅ Early return AFTER all hooks
// //   if (!device) return null;

// //   return (
// //     <div className="modal-overlay" onClick={onClose}>
// //       <div className="modal-content" onClick={(e) => e.stopPropagation()}>
// //         {/* Header */}
// //         <div className="modal-header">
// //           <h2>{device.name} - Details</h2>
// //           <button className="close-btn" onClick={onClose}>
// //             <X size={24} />
// //           </button>
// //         </div>

// //         <div className="modal-body">
// //           {/* Stat cards */}
// //           <div className="device-stats">
// //             <div
// //               className={`stat-box ${selectedMetric === "current" ? "stat-box-active" : ""}`}
// //               onClick={() => setSelectedMetric("current")}
// //               style={{ cursor: "pointer" }}
// //             >
// //               <h4>Current</h4>
// //               <p
// //                 className="stat-value"
// //                 style={{
// //                   color: selectedMetric === "current" ? "#43a047" : undefined,
// //                 }}
// //               >
// //                 {device.current.toFixed(2)} A
// //               </p>
// //             </div>

// //             <div
// //               className={`stat-box ${selectedMetric === "voltage" ? "stat-box-active" : ""}`}
// //               onClick={() => setSelectedMetric("voltage")}
// //               style={{ cursor: "pointer" }}
// //             >
// //               <h4>Voltage</h4>
// //               <p
// //                 className="stat-value"
// //                 style={{
// //                   color: selectedMetric === "voltage" ? "#00bcd4" : undefined,
// //                 }}
// //               >
// //                 {device.voltage.toFixed(2)} V
// //               </p>
// //             </div>

// //             <div
// //               className={`stat-box ${selectedMetric === "power" ? "stat-box-active" : ""}`}
// //               onClick={() => setSelectedMetric("power")}
// //               style={{ cursor: "pointer" }}
// //             >
// //               <h4>Power</h4>
// //               <p
// //                 className="stat-value"
// //                 style={{
// //                   color: selectedMetric === "power" ? "#4a148c" : undefined,
// //                 }}
// //               >
// //                 {device.power.toFixed(2)} W
// //               </p>
// //             </div>

// //             <div className="stat-box">
// //               <h4>Status</h4>
// //               <p
// //                 className={`stat-value ${device.status === "ON" ? "text-success" : "text-danger"}`}
// //               >
// //                 {device.status}
// //               </p>
// //             </div>

// //             <div className="stat-box">
// //               <h4>Avg. Power (Monthly)</h4>
// //               <p className="stat-value" style={{ color: "#4a148c" }}>
// //                 {loadingStats ? "..." : `${displayMonthlyAvg} W`}
// //               </p>
// //             </div>

// //             <div className="stat-box">
// //               <h4>Avg. Power (Yearly)</h4>
// //               <p className="stat-value" style={{ color: "#ff8f00" }}>
// //                 {loadingStats ? "..." : `${displayYearlyAvg} W`}
// //               </p>
// //             </div>

// //             <div className="stat-box">
// //               <h4>Temperature</h4>
// //               <p className="stat-value" style={{ color: "#e53935" }}>
// //                 {device.temperature != null
// //                   ? `${device.temperature} °C`
// //                   : "N/A"}
// //               </p>
// //             </div>

// //             <div className="stat-box">
// //               <h4>Humidity</h4>
// //               <p className="stat-value" style={{ color: "#1e88e5" }}>
// //                 {device.humidity != null ? `${device.humidity} %` : "N/A"}
// //               </p>
// //             </div>
// //           </div>

// //           {/* Graph section */}
// //           <div className="device-graph">
// //             {/* Time tabs */}
// //             <div className="time-tabs">
// //               {TIME_TABS.map((tab) => (
// //                 <button
// //                   key={tab}
// //                   className={`time-tab-btn ${activeTab === tab ? "time-tab-btn--active" : ""}`}
// //                   onClick={() => setActiveTab(tab)}
// //                 >
// //                   {tab}
// //                 </button>
// //               ))}
// //             </div>

// //             <h3 style={{ marginTop: "12px" }}>
// //               {METRIC_CONFIG[effectiveMetric].label} — {activeTab}
// //               {isLoading && (
// //                 <span
// //                   style={{ fontSize: "13px", color: "#888", marginLeft: 8 }}
// //                 >
// //                   Loading...
// //                 </span>
// //               )}
// //             </h3>

// //             {/* Note for Month/Year: only power available from stats API */}
// //             {(activeTab === "Month" || activeTab === "Year") && (
// //               <p
// //                 style={{
// //                   fontSize: "12px",
// //                   color: "#888",
// //                   margin: "-6px 0 8px",
// //                 }}
// //               >
// //                 Showing total power consumption per{" "}
// //                 {activeTab === "Month" ? "day" : "month"}
// //               </p>
// //             )}

// //             {!isLoading && chartData.length === 0 ? (
// //               <div
// //                 style={{
// //                   textAlign: "center",
// //                   padding: "60px 0",
// //                   color: "#888",
// //                   fontSize: "15px",
// //                 }}
// //               >
// //                 No Data
// //               </div>
// //             ) : (
// //               <ResponsiveContainer width="100%" height={300}>
// //                 <LineChart data={chartData}>
// //                   <CartesianGrid strokeDasharray="3 3" />
// //                   <XAxis dataKey="time" tick={{ fontSize: 11 }} />
// //                   <YAxis />
// //                   <Tooltip />
// //                   <Legend />
// //                   <Line
// //                     type="monotone"
// //                     dataKey={effectiveMetric}
// //                     stroke={METRIC_CONFIG[effectiveMetric].color}
// //                     strokeWidth={2}
// //                     dot={
// //                       <CustomDot
// //                         dataKey={effectiveMetric}
// //                         color={METRIC_CONFIG[effectiveMetric].color}
// //                       />
// //                     }
// //                     name={METRIC_CONFIG[effectiveMetric].label}
// //                   />
// //                 </LineChart>
// //               </ResponsiveContainer>
// //             )}

// //             {/* Metric buttons — disabled for Month/Year since stats only have power */}
// //             <div className="metric-tabs">
// //               {Object.entries(METRIC_CONFIG).map(([key, cfg]) => {
// //                 const disabledForTab =
// //                   (activeTab === "Month" || activeTab === "Year") &&
// //                   key !== "power";
// //                 return (
// //                   <button
// //                     key={key}
// //                     className={`metric-tab-btn ${effectiveMetric === key ? "metric-tab-btn--active" : ""}`}
// //                     style={{
// //                       ...(effectiveMetric === key
// //                         ? { borderColor: cfg.color, color: cfg.color }
// //                         : {}),
// //                       ...(disabledForTab
// //                         ? { opacity: 0.35, cursor: "not-allowed" }
// //                         : {}),
// //                     }}
// //                     onClick={() => !disabledForTab && setSelectedMetric(key)}
// //                   >
// //                     {key.charAt(0).toUpperCase() + key.slice(1)}
// //                   </button>
// //                 );
// //               })}
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default DeviceDetailsModal;

// // Shared device details modal (graphs + readings), used by both the
// // Live Readings page and the Room Details page when a device is clicked.
// //
// // This mirrors the Flutter "DashboardChartsPage" layout:
// //   1. Three live-value cards (Current / Voltage / Power)
// //   2. Time filter (Today / Week / Month / Year)
// //   3. Main chart driven by the selected time filter
// //   4. Sensor tabs (Current / Voltage / Power)
// //   5. Sensor chart driven by the selected sensor tab + time filter
// //   6. Four summary cards (Monthly Avg / Yearly Avg / Monthly Total / Yearly Total)
// import React, { useState, useEffect, useCallback, useMemo } from "react";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";
// import { X } from "lucide-react";
// import "../styles/LiveReadings.css";
// import API_ENDPOINTS, {
//   fetchWithAuth,
//   USE_JSON_SERVER,
// } from "../../infrastructure/api/api.config";

// const TIME_TABS = ["Today", "Week", "Month", "Year"];

// const SENSOR_TABS = [
//   {
//     key: "current",
//     label: "Current",
//     unit: "A",
//     color: "var(--color-current)",
//   },
//   {
//     key: "voltage",
//     label: "Voltage",
//     unit: "V",
//     color: "var(--color-voltage)",
//   },
//   { key: "power", label: "Power", unit: "W", color: "var(--color-power)" },
// ];

// const MONTH_NAMES = [
//   "Jan",
//   "Feb",
//   "Mar",
//   "Apr",
//   "May",
//   "Jun",
//   "Jul",
//   "Aug",
//   "Sep",
//   "Oct",
//   "Nov",
//   "Dec",
// ];

// // ── Small live-value / summary card, styled with the site's own colors ──
// const LiveCard = ({ title, value, color }) => (
//   <div className="ddm-live-card" style={{ "--card-color": color }}>
//     <span className="ddm-live-card__title">{title}</span>
//     <span className="ddm-live-card__value">{value}</span>
//   </div>
// );

// // ── Recharts line chart, styled to match the site's existing charts ──
// const SimpleLineChart = ({ data, dataKey, color }) => {
//   if (!data || data.length === 0) {
//     return <div className="ddm-chart__empty">No Data Available</div>;
//   }
//   return (
//     <ResponsiveContainer width="100%" height={220}>
//       <LineChart data={data}>
//         <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
//         <XAxis
//           dataKey="label"
//           tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
//           axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
//           tickLine={false}
//         />
//         <YAxis
//           tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
//           axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
//           tickLine={false}
//         />
//         <Tooltip
//           contentStyle={{
//             background: "var(--bg-secondary)",
//             border: "1px solid rgba(255,255,255,0.1)",
//             borderRadius: 8,
//           }}
//         />
//         <Line
//           type="monotone"
//           dataKey={dataKey}
//           stroke={color}
//           strokeWidth={3}
//           dot={data.length < 30 ? { r: 3, fill: color } : false}
//           fill={`${color}33`}
//         />
//       </LineChart>
//     </ResponsiveContainer>
//   );
// };

// const DeviceDetailsModal = ({ device, onClose, inMemoryHistory = [] }) => {
//   const [allReadings, setAllReadings] = useState([]); // raw readings, oldest → newest
//   const [monthlyData, setMonthlyData] = useState(null); // { daily, monthlyAverage, monthlyTotal }
//   const [yearlyData, setYearlyData] = useState(null); // { monthly, yearlyAverage, yearlyTotal }
//   const [loadingHistory, setLoadingHistory] = useState(false);
//   const [loadingStats, setLoadingStats] = useState(false);

//   const [selectedTime, setSelectedTime] = useState(0); // 0 Today, 1 Week, 2 Month, 3 Year
//   const [selectedSensor, setSelectedSensor] = useState(2); // 0 Current, 1 Voltage, 2 Power

//   const deviceId = device?.id || device?._id;

//   // ── 1. Raw readings — GET /api/readings/device/:deviceId ───────────────
//   const fetchRealHistory = useCallback(async () => {
//     if (!deviceId) return;
//     setLoadingHistory(true);
//     try {
//       const res = await fetchWithAuth(
//         API_ENDPOINTS.READING_BY_DEVICE(deviceId),
//       );
//       if (!res.ok) throw new Error("Failed to fetch readings");
//       const data = await res.json();
//       const readings = Array.isArray(data) ? data : data.readings || [];

//       // Backend returns newest-first; reverse to oldest-first for charts
//       setAllReadings(
//         readings
//           .slice()
//           .reverse()
//           .map((r) => ({
//             rawTime: r.createdAt,
//             current: r.current ?? 0,
//             voltage: r.voltage ?? 0,
//             power: r.power ?? 0,
//           })),
//       );
//     } catch (err) {
//       console.error("Error fetching readings:", err);
//       setAllReadings([]);
//     } finally {
//       setLoadingHistory(false);
//     }
//   }, [deviceId]);

//   // ── 2. Monthly + yearly stats ───────────────────────────────────────────
//   const fetchStats = useCallback(async () => {
//     if (!deviceId) return;
//     setLoadingStats(true);
//     try {
//       const now = new Date();
//       const month = now.getMonth() + 1;
//       const year = now.getFullYear();

//       const [mRes, yRes] = await Promise.all([
//         fetchWithAuth(
//           `${API_ENDPOINTS.MONTHLY_STATS}?deviceId=${deviceId}&month=${month}&year=${year}`,
//         ),
//         fetchWithAuth(
//           `${API_ENDPOINTS.YEARLY_STATS}?deviceId=${deviceId}&year=${year}`,
//         ),
//       ]);

//       if (mRes.ok) setMonthlyData(await mRes.json());
//       if (yRes.ok) setYearlyData(await yRes.json());
//     } catch (err) {
//       console.error("Error fetching stats:", err);
//     } finally {
//       setLoadingStats(false);
//     }
//   }, [deviceId]);

//   useEffect(() => {
//     if (!device || USE_JSON_SERVER) return;
//     fetchRealHistory();
//     fetchStats();
//   }, [device, fetchRealHistory, fetchStats]);

//   // ── Live "now" values — latest reading, or fall back to device's own fields ──
//   const liveValues = useMemo(() => {
//     const base =
//       !USE_JSON_SERVER && allReadings.length > 0
//         ? allReadings
//         : inMemoryHistory;
//     const latest =
//       base.length > 0
//         ? base.find((r) => (r.current || 0) > 0 || (r.power || 0) > 0) ||
//           base[base.length - 1]
//         : null;

//     return {
//       current: latest?.current ?? device?.current ?? 0,
//       voltage: latest?.voltage ?? device?.voltage ?? 0,
//       power: latest?.power ?? device?.power ?? 0,
//     };
//   }, [allReadings, inMemoryHistory, device]);

//   // ── Build the readings-based dataset for Today / Week ──────────────────
//   const readingsInRange = useMemo(() => {
//     const base =
//       !USE_JSON_SERVER && allReadings.length > 0
//         ? allReadings
//         : inMemoryHistory;
//     const now = new Date();

//     if (selectedTime === 0) {
//       // Today
//       return base.filter((r) => {
//         const t = new Date(r.rawTime ?? r.time);
//         return (
//           t.getFullYear() === now.getFullYear() &&
//           t.getMonth() === now.getMonth() &&
//           t.getDate() === now.getDate()
//         );
//       });
//     }
//     if (selectedTime === 1) {
//       // Week
//       const weekAgo = new Date(now);
//       weekAgo.setDate(now.getDate() - 7);
//       return base.filter((r) => new Date(r.rawTime ?? r.time) >= weekAgo);
//     }
//     return [];
//   }, [allReadings, inMemoryHistory, selectedTime]);

//   const formatReadingLabel = (rawTime) => {
//     const t = new Date(rawTime);
//     return selectedTime === 0
//       ? t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
//       : t.toLocaleDateString([], {
//           weekday: "short",
//           hour: "2-digit",
//           minute: "2-digit",
//         });
//   };

//   // ── Main chart data — depends only on the TIME filter (Today/Week/Month/Year) ──
//   // Today/Week → real readings' power. Month/Year → daily/monthly power totals.
//   const mainChartData = useMemo(() => {
//     if (selectedTime === 0 || selectedTime === 1) {
//       return readingsInRange.map((r) => ({
//         label: formatReadingLabel(r.rawTime ?? r.time),
//         power: r.power,
//       }));
//     }
//     if (selectedTime === 2 && monthlyData?.daily) {
//       return monthlyData.daily.map((d) => ({
//         label: `Day ${d.day}`,
//         power: d.totalPower ?? 0,
//       }));
//     }
//     if (selectedTime === 3 && yearlyData?.monthly) {
//       return yearlyData.monthly.map((m) => ({
//         label: MONTH_NAMES[(m.month ?? 1) - 1],
//         power: m.totalPower ?? 0,
//       }));
//     }
//     return [];
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedTime, readingsInRange, monthlyData, yearlyData]);

//   // ── Sensor chart data — depends on TIME filter + SENSOR tab ─────────────
//   // For Today/Week we have real current/voltage/power per reading.
//   // For Month/Year the stats API only stores total power, so all three
//   // sensor tabs fall back to the same power-based series for those ranges.
//   const sensorKey = SENSOR_TABS[selectedSensor].key;

//   const sensorChartData = useMemo(() => {
//     if (selectedTime === 0 || selectedTime === 1) {
//       return readingsInRange.map((r) => ({
//         label: formatReadingLabel(r.rawTime ?? r.time),
//         value: r[sensorKey],
//       }));
//     }
//     // Month/Year — only power is available from the stats API
//     return mainChartData.map((d) => ({ label: d.label, value: d.power }));
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedTime, readingsInRange, mainChartData, sensorKey]);

//   if (!device) return null;

//   const isLoading = loadingHistory || loadingStats;

//   const monthlyAverage =
//     monthlyData?.monthlyAverage ?? device?.monthlyAverage ?? 0;
//   const yearlyAverage = yearlyData?.yearlyAverage ?? device?.yearlyAverage ?? 0;
//   const monthlyTotal = monthlyData?.monthlyTotal ?? 0;
//   const yearlyTotal = yearlyData?.yearlyTotal ?? 0;

//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div
//         className="modal-content ddm-modal"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Header */}
//         <div className="modal-header ddm-header">
//           <h2>{device.name} — Live Sensors Dashboard</h2>
//           <button className="close-btn" onClick={onClose}>
//             <X size={24} />
//           </button>
//         </div>

//         <div className="modal-body ddm-body">
//           {isLoading && allReadings.length === 0 ? (
//             <div className="ddm-loading">Loading…</div>
//           ) : (
//             <>
//               {/* ── 1. Live value cards ── */}
//               <div className="ddm-live-row">
//                 <LiveCard
//                   title="Current"
//                   value={`${liveValues.current.toFixed(1)} A`}
//                   color="var(--color-current)"
//                 />
//                 <LiveCard
//                   title="Voltage"
//                   value={`${liveValues.voltage.toFixed(1)} V`}
//                   color="var(--color-voltage)"
//                 />
//                 <LiveCard
//                   title="Power"
//                   value={`${liveValues.power.toFixed(1)} W`}
//                   color="var(--color-power)"
//                 />
//               </div>

//               {/* ── 2. Time filter ── */}
//               <div className="ddm-time-tabs">
//                 {TIME_TABS.map((tab, idx) => (
//                   <button
//                     key={tab}
//                     className={`ddm-time-tab ${selectedTime === idx ? "ddm-time-tab--active" : ""}`}
//                     onClick={() => setSelectedTime(idx)}
//                   >
//                     {tab}
//                   </button>
//                 ))}
//               </div>

//               {/* ── 3. Main chart (Power, driven by time filter) ── */}
//               <div className="ddm-chart-card">
//                 <SimpleLineChart
//                   data={mainChartData}
//                   dataKey="power"
//                   color="var(--color-power)"
//                 />
//               </div>

//               {/* ── 4. Sensor tabs ── */}
//               <div className="ddm-sensor-tabs">
//                 {SENSOR_TABS.map((sensor, idx) => (
//                   <button
//                     key={sensor.key}
//                     className={`ddm-sensor-tab ${selectedSensor === idx ? "ddm-sensor-tab--active" : ""}`}
//                     style={
//                       selectedSensor === idx
//                         ? {
//                             borderColor: sensor.color,
//                             color: sensor.color,
//                             background: `${sensor.color}33`,
//                           }
//                         : {}
//                     }
//                     onClick={() => setSelectedSensor(idx)}
//                   >
//                     {sensor.label}
//                   </button>
//                 ))}
//               </div>

//               {/* ── 5. Sensor chart ── */}
//               <div className="ddm-chart-card">
//                 <h3 className="ddm-chart-card__title">
//                   {SENSOR_TABS[selectedSensor].label} Chart
//                 </h3>
//                 <SimpleLineChart
//                   data={sensorChartData}
//                   dataKey="value"
//                   color={SENSOR_TABS[selectedSensor].color}
//                 />
//               </div>

//               {/* ── 6. Summary cards ── */}
//               <div className="ddm-summary-row">
//                 <LiveCard
//                   title="Monthly Avg"
//                   value={Number(monthlyAverage).toFixed(1)}
//                   color="var(--color-success)"
//                 />
//                 <LiveCard
//                   title="Yearly Avg"
//                   value={Number(yearlyAverage).toFixed(1)}
//                   color="var(--color-voltage)"
//                 />
//               </div>
//               <div className="ddm-summary-row">
//                 <LiveCard
//                   title="Monthly Total"
//                   value={Number(monthlyTotal).toFixed(1)}
//                   color="var(--color-warning)"
//                 />
//                 <LiveCard
//                   title="Yearly Total"
//                   value={Number(yearlyTotal).toFixed(1)}
//                   color="var(--color-danger)"
//                 />
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DeviceDetailsModal;

//صصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصصص

// import React, { useState, useEffect, useCallback, useMemo } from "react";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";
// import { X } from "lucide-react";
// import "../styles/LiveReadings.css";
// import API_ENDPOINTS, {
//   fetchWithAuth,
//   USE_JSON_SERVER,
// } from "../../infrastructure/api/api.config";

// const TIME_TABS = ["Today", "Week", "Month", "Year"];

// const SENSOR_TABS = [
//   {
//     key: "current",
//     label: "Current",
//     unit: "A",
//     color: "var(--color-current)",
//   },
//   {
//     key: "voltage",
//     label: "Voltage",
//     unit: "V",
//     color: "var(--color-voltage)",
//   },
//   { key: "power", label: "Power", unit: "W", color: "var(--color-power)" },
// ];

// const MONTH_NAMES = [
//   "Jan",
//   "Feb",
//   "Mar",
//   "Apr",
//   "May",
//   "Jun",
//   "Jul",
//   "Aug",
//   "Sep",
//   "Oct",
//   "Nov",
//   "Dec",
// ];

// // ── Small live-value / summary card, styled with the site's own colors ──
// const LiveCard = ({ title, value, color }) => (
//   <div className="ddm-live-card" style={{ "--card-color": color }}>
//     <span className="ddm-live-card__title">{title}</span>
//     <span className="ddm-live-card__value">{value}</span>
//   </div>
// );

// // ── Recharts line chart, styled to match the site's existing charts ──
// const SimpleLineChart = ({ data, dataKey, color }) => {
//   if (!data || data.length === 0) {
//     return <div className="ddm-chart__empty">No Data Available</div>;
//   }
//   return (
//     <ResponsiveContainer width="100%" height={220}>
//       <LineChart data={data}>
//         <CartesianGrid strokeDasharray="3 3" stroke="var(--color-white-soft)" />
//         <XAxis
//           dataKey="label"
//           tick={{ fill: "var(--color-white-soft-strong)", fontSize: 10 }}
//           axisLine={{ stroke: "var(--color-white-soft-12)" }}
//           tickLine={false}
//         />
//         <YAxis
//           tick={{ fill: "var(--color-white-soft-strong)", fontSize: 10 }}
//           axisLine={{ stroke: "var(--color-white-soft-12)" }}
//           tickLine={false}
//         />
//         <Tooltip
//           contentStyle={{
//             background: "var(--bg-secondary)",
//             border: "1px solid var(--color-white-soft)",
//             borderRadius: 8,
//           }}
//         />
//         <Line
//           type="monotone"
//           dataKey={dataKey}
//           stroke={color}
//           strokeWidth={3}
//           dot={data.length < 30 ? { r: 3, fill: color } : false}
//           fill={`${color}33`}
//         />
//       </LineChart>
//     </ResponsiveContainer>
//   );
// };

// const DeviceDetailsModal = ({ device, onClose, inMemoryHistory = [] }) => {
//   const [allReadings, setAllReadings] = useState([]); // raw readings, oldest → newest
//   const [monthlyData, setMonthlyData] = useState(null); // { daily, monthlyAverage, monthlyTotal }
//   const [yearlyData, setYearlyData] = useState(null); // { monthly, yearlyAverage, yearlyTotal }
//   const [loadingHistory, setLoadingHistory] = useState(false);
//   const [loadingStats, setLoadingStats] = useState(false);

//   const [selectedTime, setSelectedTime] = useState(0); // 0 Today, 1 Week, 2 Month, 3 Year
//   const [selectedSensor, setSelectedSensor] = useState(2); // 0 Current, 1 Voltage, 2 Power

//   const deviceId = device?.id || device?._id;

//   // ── 1. Raw readings — GET /api/readings/device/:deviceId ───────────────
//   const fetchRealHistory = useCallback(async () => {
//     if (!deviceId) return;
//     setLoadingHistory(true);
//     try {
//       const res = await fetchWithAuth(
//         API_ENDPOINTS.READING_BY_DEVICE(deviceId),
//       );
//       if (!res.ok) throw new Error("Failed to fetch readings");
//       const data = await res.json();
//       const readings = Array.isArray(data) ? data : data.readings || [];

//       // Backend returns newest-first; reverse to oldest-first for charts
//       setAllReadings(
//         readings
//           .slice()
//           .reverse()
//           .map((r) => ({
//             rawTime: r.createdAt,
//             current: r.current ?? 0,
//             voltage: r.voltage ?? 0,
//             power: r.power ?? 0,
//           })),
//       );
//     } catch (err) {
//       console.error("Error fetching readings:", err);
//       setAllReadings([]);
//     } finally {
//       setLoadingHistory(false);
//     }
//   }, [deviceId]);

//   // ── 2. Monthly + yearly stats ───────────────────────────────────────────
//   const fetchStats = useCallback(async () => {
//     if (!deviceId) return;
//     setLoadingStats(true);
//     try {
//       const now = new Date();
//       const month = now.getMonth() + 1;
//       const year = now.getFullYear();

//       const [mRes, yRes] = await Promise.all([
//         fetchWithAuth(
//           `${API_ENDPOINTS.MONTHLY_STATS}?deviceId=${deviceId}&month=${month}&year=${year}`,
//         ),
//         fetchWithAuth(
//           `${API_ENDPOINTS.YEARLY_STATS}?deviceId=${deviceId}&year=${year}`,
//         ),
//       ]);

//       if (mRes.ok) setMonthlyData(await mRes.json());
//       if (yRes.ok) setYearlyData(await yRes.json());
//     } catch (err) {
//       console.error("Error fetching stats:", err);
//     } finally {
//       setLoadingStats(false);
//     }
//   }, [deviceId]);

//   useEffect(() => {
//     if (!device || USE_JSON_SERVER) return;
//     fetchRealHistory();
//     fetchStats();
//   }, [device, fetchRealHistory, fetchStats]);

//   // ── Live "now" values — latest reading, or fall back to device's own fields ──
//   const liveValues = useMemo(() => {
//     const base =
//       !USE_JSON_SERVER && allReadings.length > 0
//         ? allReadings
//         : inMemoryHistory;
//     const latest = base.length > 0 ? base[base.length - 1] : null;

//     return {
//       current: latest?.current ?? device?.current ?? 0,
//       voltage: latest?.voltage ?? device?.voltage ?? 0,
//       power: latest?.power ?? device?.power ?? 0,
//     };
//   }, [allReadings, inMemoryHistory, device]);

//   // ── Build the readings-based dataset for Today / Week ──────────────────
//   const readingsInRange = useMemo(() => {
//     const base =
//       !USE_JSON_SERVER && allReadings.length > 0
//         ? allReadings
//         : inMemoryHistory;
//     const now = new Date();

//     if (selectedTime === 0) {
//       // Today
//       return base.filter((r) => {
//         const t = new Date(r.rawTime ?? r.time);
//         return (
//           t.getFullYear() === now.getFullYear() &&
//           t.getMonth() === now.getMonth() &&
//           t.getDate() === now.getDate()
//         );
//       });
//     }
//     if (selectedTime === 1) {
//       // Week
//       const weekAgo = new Date(now);
//       weekAgo.setDate(now.getDate() - 7);
//       return base.filter((r) => new Date(r.rawTime ?? r.time) >= weekAgo);
//     }
//     return [];
//   }, [allReadings, inMemoryHistory, selectedTime]);

//   const formatReadingLabel = (rawTime) => {
//     const t = new Date(rawTime);
//     return selectedTime === 0
//       ? t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
//       : t.toLocaleDateString([], {
//           weekday: "short",
//           hour: "2-digit",
//           minute: "2-digit",
//         });
//   };

//   // ── Main chart data — depends only on the TIME filter (Today/Week/Month/Year) ──
//   // Today/Week → real readings' power. Month/Year → daily/monthly power totals.
//   const mainChartData = useMemo(() => {
//     if (selectedTime === 0 || selectedTime === 1) {
//       return readingsInRange.map((r) => ({
//         label: formatReadingLabel(r.rawTime ?? r.time),
//         power: r.power,
//       }));
//     }
//     if (selectedTime === 2 && monthlyData?.daily) {
//       return monthlyData.daily.map((d) => ({
//         label: `Day ${d.day}`,
//         power: d.totalPower ?? 0,
//       }));
//     }
//     if (selectedTime === 3 && yearlyData?.monthly) {
//       return yearlyData.monthly.map((m) => ({
//         label: MONTH_NAMES[(m.month ?? 1) - 1],
//         power: m.totalPower ?? 0,
//       }));
//     }
//     return [];
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedTime, readingsInRange, monthlyData, yearlyData]);

//   // ── Sensor chart data — depends on TIME filter + SENSOR tab ─────────────
//   // For Today/Week we have real current/voltage/power per reading.
//   // For Month/Year the stats API only stores total power, so all three
//   // sensor tabs fall back to the same power-based series for those ranges.
//   const sensorKey = SENSOR_TABS[selectedSensor].key;

//   const sensorChartData = useMemo(() => {
//     if (selectedTime === 0 || selectedTime === 1) {
//       return readingsInRange.map((r) => ({
//         label: formatReadingLabel(r.rawTime ?? r.time),
//         value: r[sensorKey],
//       }));
//     }
//     // Month/Year — only power is available from the stats API
//     return mainChartData.map((d) => ({ label: d.label, value: d.power }));
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedTime, readingsInRange, mainChartData, sensorKey]);

//   if (!device) return null;

//   const isLoading = loadingHistory || loadingStats;

//   const monthlyAverage =
//     monthlyData?.monthlyAverage ?? device?.monthlyAverage ?? 0;
//   const yearlyAverage = yearlyData?.yearlyAverage ?? device?.yearlyAverage ?? 0;
//   const monthlyTotal = monthlyData?.monthlyTotal ?? 0;
//   const yearlyTotal = yearlyData?.yearlyTotal ?? 0;

//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div
//         className="modal-content ddm-modal"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Header */}
//         <div className="modal-header ddm-header">
//           <h2>{device.name} — Live Sensors Dashboard</h2>
//           <button className="close-btn" onClick={onClose}>
//             <X size={24} />
//           </button>
//         </div>

//         <div className="modal-body ddm-body">
//           {isLoading && allReadings.length === 0 ? (
//             <div className="ddm-loading">Loading…</div>
//           ) : (
//             <>
//               {/* ── 1. Live value cards ── */}
//               <div className="ddm-live-row">
//                 <LiveCard
//                   title="Current"
//                   value={`${liveValues.current.toFixed(1)} A`}
//                   color="var(--color-current)"
//                 />
//                 <LiveCard
//                   title="Voltage"
//                   value={`${liveValues.voltage.toFixed(1)} V`}
//                   color="var(--color-voltage)"
//                 />
//                 <LiveCard
//                   title="Power"
//                   value={`${liveValues.power.toFixed(1)} W`}
//                   color="var(--color-power)"
//                 />
//               </div>

//               {/* ── 2. Time filter ── */}
//               <div className="ddm-time-tabs">
//                 {TIME_TABS.map((tab, idx) => (
//                   <button
//                     key={tab}
//                     className={`ddm-time-tab ${selectedTime === idx ? "ddm-time-tab--active" : ""}`}
//                     onClick={() => setSelectedTime(idx)}
//                   >
//                     {tab}
//                   </button>
//                 ))}
//               </div>

//               {/* ── 3. Main chart (Power, driven by time filter) ── */}
//               <div className="ddm-chart-card">
//                 <SimpleLineChart
//                   data={mainChartData}
//                   dataKey="power"
//                   color="var(--color-power)"
//                 />
//               </div>

//               {/* ── 4. Sensor tabs ── */}
//               <div className="ddm-sensor-tabs">
//                 {SENSOR_TABS.map((sensor, idx) => (
//                   <button
//                     key={sensor.key}
//                     className={`ddm-sensor-tab ${selectedSensor === idx ? "ddm-sensor-tab--active" : ""}`}
//                     style={
//                       selectedSensor === idx
//                         ? {
//                             borderColor: sensor.color,
//                             color: sensor.color,
//                             background: `${sensor.color}33`,
//                           }
//                         : {}
//                     }
//                     onClick={() => setSelectedSensor(idx)}
//                   >
//                     {sensor.label}
//                   </button>
//                 ))}
//               </div>

//               {/* ── 5. Sensor chart ── */}
//               <div className="ddm-chart-card">
//                 <h3 className="ddm-chart-card__title">
//                   {SENSOR_TABS[selectedSensor].label} Chart
//                 </h3>
//                 <SimpleLineChart
//                   data={sensorChartData}
//                   dataKey="value"
//                   color={SENSOR_TABS[selectedSensor].color}
//                 />
//               </div>

//               {/* ── 6. Summary cards ── */}
//               <div className="ddm-summary-row">
//                 <LiveCard
//                   title="Monthly Avg"
//                   value={Number(monthlyAverage).toFixed(1)}
//                   color="var(--color-success)"
//                 />
//                 <LiveCard
//                   title="Yearly Avg"
//                   value={Number(yearlyAverage).toFixed(1)}
//                   color="var(--color-voltage)"
//                 />
//               </div>
//               <div className="ddm-summary-row">
//                 <LiveCard
//                   title="Monthly Total"
//                   value={Number(monthlyTotal).toFixed(1)}
//                   color="var(--color-warning)"
//                 />
//                 <LiveCard
//                   title="Yearly Total"
//                   value={Number(yearlyTotal).toFixed(1)}
//                   color="var(--color-danger)"
//                 />
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DeviceDetailsModal;

// new code 

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { X } from "lucide-react";
import "../styles/LiveReadings.css";
import API_ENDPOINTS, {
  fetchWithAuth,
  USE_JSON_SERVER,
} from "../../infrastructure/api/api.config";

const TIME_TABS = ["Today", "Week", "Month", "Year"];

const SENSOR_TABS = [
  {
    key: "current",
    label: "Current",
    unit: "A",
    color: "var(--color-current)",
  },
  {
    key: "voltage",
    label: "Voltage",
    unit: "V",
    color: "var(--color-voltage)",
  },
  { key: "power", label: "Power", unit: "W", color: "var(--color-power)" },
];

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// ── Small live-value / summary card, styled with the site's own colors ──
const LiveCard = ({ title, value, color }) => (
  <div className="ddm-live-card" style={{ "--card-color": color }}>
    <span className="ddm-live-card__title">{title}</span>
    <span className="ddm-live-card__value">{value}</span>
  </div>
);

// ── Recharts line chart, styled to match the site's existing charts ──
// Above this many points, Recharts' per-render path animation becomes the
// dominant cost. Disabling it only past this threshold keeps every normal
// (small/medium) dataset animated exactly as before — visuals are untouched
// for the common case, this only guards the pathological worst case.
const ANIMATION_POINT_THRESHOLD = 300;

const SimpleLineChart = ({ data, dataKey, color }) => {
  if (!data || data.length === 0) {
    return <div className="ddm-chart__empty">No Data Available</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-white-soft)" />
        <XAxis
          dataKey="label"
          tick={{ fill: "var(--color-white-soft-strong)", fontSize: 10 }}
          axisLine={{ stroke: "var(--color-white-soft-12)" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "var(--color-white-soft-strong)", fontSize: 10 }}
          axisLine={{ stroke: "var(--color-white-soft-12)" }}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--color-white-soft)",
            borderRadius: 8,
          }}
        />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={3}
          dot={data.length < 30 ? { r: 3, fill: color } : false}
          fill={`${color}33`}
          isAnimationActive={data.length < ANIMATION_POINT_THRESHOLD}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

const DeviceDetailsModal = ({ device, onClose, inMemoryHistory = [] }) => {
  const [allReadings, setAllReadings] = useState([]); // raw readings, oldest → newest
  const [monthlyData, setMonthlyData] = useState(null); // { daily, monthlyAverage, monthlyTotal }
  const [yearlyData, setYearlyData] = useState(null); // { monthly, yearlyAverage, yearlyTotal }
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);

  const [selectedTime, setSelectedTime] = useState(0); // 0 Today, 1 Week, 2 Month, 3 Year
  const [selectedSensor, setSelectedSensor] = useState(2); // 0 Current, 1 Voltage, 2 Power

  const deviceId = device?.id || device?._id;

  // Per-device, per-range cache of already-fetched readings so switching
  // Today <-> Week (and back) while the modal is open re-uses data instead
  // of re-hitting the network. Cleared whenever a different device is opened.
  const readingsCacheRef = useRef({}); // { [deviceId]: { today: [...], week: [...] } }

  // Today/Week are the only tabs that need raw per-reading data — Month/Year
  // are served entirely from the stats endpoints below, so there's nothing
  // to fetch or cache for them here.
  const getRangeForTime = useCallback((timeIndex) => {
    const now = new Date();
    if (timeIndex === 0) {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { key: "today", from: start.toISOString(), to: now.toISOString() };
    }
    if (timeIndex === 1) {
      const start = new Date(now);
      start.setDate(now.getDate() - 7);
      return { key: "week", from: start.toISOString(), to: now.toISOString() };
    }
    return null; // Month / Year — no raw-reading fetch needed
  }, []);

  // ── 1. Raw readings — GET /api/readings/device/:deviceId, scoped to the
  //      currently selected time range instead of the device's full history.
  //      Ask the backend to do the filtering (from/to query params); the
  //      client-side range filter below (readingsInRange) still runs too,
  //      as a safety net so accuracy holds even if the backend hasn't been
  //      updated to honor those params yet.
  const fetchReadingsForRange = useCallback(
    async (timeIndex) => {
      if (!deviceId) return;
      const range = getRangeForTime(timeIndex);
      if (!range) return;

      const cached = readingsCacheRef.current[deviceId]?.[range.key];
      if (cached) {
        setAllReadings(cached);
        return;
      }

      setLoadingHistory(true);
      try {
        const res = await fetchWithAuth(
          API_ENDPOINTS.READING_BY_DEVICE(deviceId, {
            from: range.from,
            to: range.to,
          }),
        );
        if (!res.ok) throw new Error("Failed to fetch readings");
        const data = await res.json();
        const readings = Array.isArray(data) ? data : data.readings || [];

        // Backend returns newest-first; reverse to oldest-first for charts
        const chartData = readings
          .slice()
          .reverse()
          .map((r) => ({
            rawTime: r.createdAt,
            current: r.current ?? 0,
            voltage: r.voltage ?? 0,
            power: r.power ?? 0,
          }));

        readingsCacheRef.current[deviceId] = {
          ...(readingsCacheRef.current[deviceId] || {}),
          [range.key]: chartData,
        };
        setAllReadings(chartData);
      } catch (err) {
        console.error("Error fetching readings:", err);
        setAllReadings([]);
      } finally {
        setLoadingHistory(false);
      }
    },
    [deviceId, getRangeForTime],
  );

  // ── 2. Monthly + yearly stats ───────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    if (!deviceId) return;
    setLoadingStats(true);
    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      const [mRes, yRes] = await Promise.all([
        fetchWithAuth(
          `${API_ENDPOINTS.MONTHLY_STATS}?deviceId=${deviceId}&month=${month}&year=${year}`,
        ),
        fetchWithAuth(
          `${API_ENDPOINTS.YEARLY_STATS}?deviceId=${deviceId}&year=${year}`,
        ),
      ]);

      if (mRes.ok) setMonthlyData(await mRes.json());
      if (yRes.ok) setYearlyData(await yRes.json());
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoadingStats(false);
    }
  }, [deviceId]);

  // Fires only when a genuinely different device is opened (stable primitive
  // id), NOT on every parent poll tick — this is what stops the modal from
  // re-fetching on a loop while it's sitting open.
  useEffect(() => {
    if (!deviceId || USE_JSON_SERVER) return;
    readingsCacheRef.current = {};
    fetchStats();
  }, [deviceId, fetchStats]);

  // Fires when the device changes OR the person switches the time tab —
  // this is the only thing that should trigger a readings fetch (or a
  // cache hit) for Today/Week.
  useEffect(() => {
    if (!deviceId || USE_JSON_SERVER) return;
    fetchReadingsForRange(selectedTime);
  }, [deviceId, selectedTime, fetchReadingsForRange]);

  // ── Lightweight "keep it feeling live" background refresh ───────────────
  // Always reflects the latest selectedTime without needing to restart the
  // interval below on every tab switch.
  const selectedTimeRef = useRef(selectedTime);
  useEffect(() => {
    selectedTimeRef.current = selectedTime;
  }, [selectedTime]);

  // Incrementally top up the currently-cached range: ask the backend only
  // for readings newer than the last one already loaded (from = last known
  // reading's time, not the start of the range), then append. This keeps
  // the request tiny regardless of how long the modal has been open.
  const refreshReadingsInBackground = useCallback(
    async (timeIndex) => {
      if (!deviceId) return;
      const range = getRangeForTime(timeIndex);
      if (!range) return; // Month/Year are refreshed via stats, not here

      const cached = readingsCacheRef.current[deviceId]?.[range.key] || [];
      const latest = cached.length > 0 ? cached[cached.length - 1] : null;
      const since = latest
        ? new Date(new Date(latest.rawTime).getTime() + 1).toISOString()
        : range.from;
      const now = new Date();

      try {
        const res = await fetchWithAuth(
          API_ENDPOINTS.READING_BY_DEVICE(deviceId, {
            from: since,
            to: now.toISOString(),
          }),
        );
        if (!res.ok) return;
        const data = await res.json();
        const readings = Array.isArray(data) ? data : data.readings || [];
        if (readings.length === 0) return; // nothing new — skip all state updates

        const newChartData = readings
          .slice()
          .reverse()
          .map((r) => ({
            rawTime: r.createdAt,
            current: r.current ?? 0,
            voltage: r.voltage ?? 0,
            power: r.power ?? 0,
          }));

        // Defensive de-dupe in case the backend treats `from` as inclusive
        const existingTimes = new Set(cached.map((r) => r.rawTime));
        const merged = [
          ...cached,
          ...newChartData.filter((r) => !existingTimes.has(r.rawTime)),
        ];

        readingsCacheRef.current[deviceId] = {
          ...(readingsCacheRef.current[deviceId] || {}),
          [range.key]: merged,
        };

        // Only touch the visible chart if the person is still on this exact
        // tab — a slow response shouldn't overwrite a range they've since
        // switched away from.
        if (selectedTimeRef.current === timeIndex) {
          setAllReadings(merged);
        }
      } catch (err) {
        console.error("Error refreshing readings:", err);
      }
    },
    [deviceId, getRangeForTime],
  );

  // Month/Year have no raw readings to top up — a plain, cheap re-fetch of
  // the (already lightweight, aggregate) stats endpoints is the equivalent
  // "keep it live" action for those two tabs.
  const refreshStatsInBackground = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  const BACKGROUND_REFRESH_MS = 45000; // 45s — nowhere near the old 3s loop

  useEffect(() => {
    if (!deviceId || USE_JSON_SERVER) return;
    const id = setInterval(() => {
      const timeIndex = selectedTimeRef.current;
      if (timeIndex === 2 || timeIndex === 3) {
        refreshStatsInBackground();
      } else {
        refreshReadingsInBackground(timeIndex);
      }
    }, BACKGROUND_REFRESH_MS);
    return () => clearInterval(id);
    // Deliberately NOT depending on selectedTime — selectedTimeRef already
    // tracks it, so the timer doesn't reset (and thus doesn't lose its
    // cadence) every time the person switches tabs.
  }, [deviceId, refreshReadingsInBackground, refreshStatsInBackground]);

  // ── Live "now" values ────────────────────────────────────────────────
  // `device` is kept fresh by the parent page's own poll (every few
  // seconds) independently of this modal, so it's the most reliable
  // "live" source — using it means the live cards keep updating in real
  // time without the modal needing to re-fetch reading history itself.
  // inMemoryHistory / allReadings remain as fallbacks for cases where the
  // device object doesn't carry live fields (e.g. before the first poll).
  const liveValues = useMemo(() => {
    if (
      device &&
      (device.power != null || device.voltage != null || device.current != null)
    ) {
      return {
        current: device.current ?? 0,
        voltage: device.voltage ?? 0,
        power: device.power ?? 0,
      };
    }
    const base = inMemoryHistory.length > 0 ? inMemoryHistory : allReadings;
    const latest = base.length > 0 ? base[base.length - 1] : null;
    return {
      current: latest?.current ?? 0,
      voltage: latest?.voltage ?? 0,
      power: latest?.power ?? 0,
    };
  }, [device, inMemoryHistory, allReadings]);

  // ── Build the readings-based dataset for Today / Week ──────────────────
  const readingsInRange = useMemo(() => {
    const base =
      !USE_JSON_SERVER && allReadings.length > 0
        ? allReadings
        : inMemoryHistory;
    const now = new Date();

    if (selectedTime === 0) {
      // Today
      return base.filter((r) => {
        const t = new Date(r.rawTime ?? r.time);
        return (
          t.getFullYear() === now.getFullYear() &&
          t.getMonth() === now.getMonth() &&
          t.getDate() === now.getDate()
        );
      });
    }
    if (selectedTime === 1) {
      // Week
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return base.filter((r) => new Date(r.rawTime ?? r.time) >= weekAgo);
    }
    return [];
  }, [allReadings, inMemoryHistory, selectedTime]);

  const formatReadingLabel = (rawTime) => {
    const t = new Date(rawTime);
    return selectedTime === 0
      ? t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : t.toLocaleDateString([], {
          weekday: "short",
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  // ── Main chart data — depends only on the TIME filter (Today/Week/Month/Year) ──
  // Today/Week → real readings' power. Month/Year → daily/monthly power totals.
  const mainChartData = useMemo(() => {
    if (selectedTime === 0 || selectedTime === 1) {
      return readingsInRange.map((r) => ({
        label: formatReadingLabel(r.rawTime ?? r.time),
        power: r.power,
      }));
    }
    if (selectedTime === 2 && monthlyData?.daily) {
      return monthlyData.daily.map((d) => ({
        label: `Day ${d.day}`,
        power: d.totalPower ?? 0,
      }));
    }
    if (selectedTime === 3 && yearlyData?.monthly) {
      return yearlyData.monthly.map((m) => ({
        label: MONTH_NAMES[(m.month ?? 1) - 1],
        power: m.totalPower ?? 0,
      }));
    }
    return [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTime, readingsInRange, monthlyData, yearlyData]);

  // ── Sensor chart data — depends on TIME filter + SENSOR tab ─────────────
  // For Today/Week we have real current/voltage/power per reading.
  // For Month/Year the stats API only stores total power, so all three
  // sensor tabs fall back to the same power-based series for those ranges.
  const sensorKey = SENSOR_TABS[selectedSensor].key;

  const sensorChartData = useMemo(() => {
    if (selectedTime === 0 || selectedTime === 1) {
      return readingsInRange.map((r) => ({
        label: formatReadingLabel(r.rawTime ?? r.time),
        value: r[sensorKey],
      }));
    }
    // Month/Year — only power is available from the stats API
    return mainChartData.map((d) => ({ label: d.label, value: d.power }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTime, readingsInRange, mainChartData, sensorKey]);

  if (!device) return null;

  const isLoading = loadingHistory || loadingStats;

  const monthlyAverage =
    monthlyData?.monthlyAverage ?? device?.monthlyAverage ?? 0;
  const yearlyAverage = yearlyData?.yearlyAverage ?? device?.yearlyAverage ?? 0;
  const monthlyTotal = monthlyData?.monthlyTotal ?? 0;
  const yearlyTotal = yearlyData?.yearlyTotal ?? 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content ddm-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header ddm-header">
          <h2>{device.name} — Live Sensors Dashboard</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body ddm-body">
          {isLoading && allReadings.length === 0 ? (
            <div className="ddm-loading">Loading…</div>
          ) : (
            <>
              {/* ── 1. Live value cards ── */}
              <div className="ddm-live-row">
                <LiveCard
                  title="Current"
                  value={`${liveValues.current.toFixed(1)} A`}
                  color="var(--color-current)"
                />
                <LiveCard
                  title="Voltage"
                  value={`${liveValues.voltage.toFixed(1)} V`}
                  color="var(--color-voltage)"
                />
                <LiveCard
                  title="Power"
                  value={`${liveValues.power.toFixed(1)} W`}
                  color="var(--color-power)"
                />
              </div>

              {/* ── 2. Time filter ── */}
              <div className="ddm-time-tabs">
                {TIME_TABS.map((tab, idx) => (
                  <button
                    key={tab}
                    className={`ddm-time-tab ${selectedTime === idx ? "ddm-time-tab--active" : ""}`}
                    onClick={() => setSelectedTime(idx)}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* ── 3. Main chart (Power, driven by time filter) ── */}
              <div className="ddm-chart-card">
                <SimpleLineChart
                  data={mainChartData}
                  dataKey="power"
                  color="var(--color-power)"
                />
              </div>

              {/* ── 4. Sensor tabs ── */}
              <div className="ddm-sensor-tabs">
                {SENSOR_TABS.map((sensor, idx) => (
                  <button
                    key={sensor.key}
                    className={`ddm-sensor-tab ${selectedSensor === idx ? "ddm-sensor-tab--active" : ""}`}
                    style={
                      selectedSensor === idx
                        ? {
                            borderColor: sensor.color,
                            color: sensor.color,
                            background: `${sensor.color}33`,
                          }
                        : {}
                    }
                    onClick={() => setSelectedSensor(idx)}
                  >
                    {sensor.label}
                  </button>
                ))}
              </div>

              {/* ── 5. Sensor chart ── */}
              <div className="ddm-chart-card">
                <h3 className="ddm-chart-card__title">
                  {SENSOR_TABS[selectedSensor].label} Chart
                </h3>
                <SimpleLineChart
                  data={sensorChartData}
                  dataKey="value"
                  color={SENSOR_TABS[selectedSensor].color}
                />
              </div>

              {/* ── 6. Summary cards ── */}
              <div className="ddm-summary-row">
                <LiveCard
                  title="Monthly Avg"
                  value={Number(monthlyAverage).toFixed(1)}
                  color="var(--color-success)"
                />
                <LiveCard
                  title="Yearly Avg"
                  value={Number(yearlyAverage).toFixed(1)}
                  color="var(--color-voltage)"
                />
              </div>
              <div className="ddm-summary-row">
                <LiveCard
                  title="Monthly Total"
                  value={Number(monthlyTotal).toFixed(1)}
                  color="var(--color-warning)"
                />
                <LiveCard
                  title="Yearly Total"
                  value={Number(yearlyTotal).toFixed(1)}
                  color="var(--color-danger)"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeviceDetailsModal;
