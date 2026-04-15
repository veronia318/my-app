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
// // import { Power, Zap, AlertTriangle, X } from "lucide-react";
// // import "../styles/LiveReadings.css";
// // import { useAuth } from "../../application/auth/AuthContext";
// // import API_ENDPOINTS, {
// //   fetchWithAuth,
// //   normalizeDevice,
// //   USE_JSON_SERVER,
// // } from "../../infrastructure/api/api.config";

// // const HISTORY_LIMIT = 20;
// // const UPDATE_INTERVAL_MS = 3000; // every 3 seconds

// // const ControlToggle = React.memo(({ deviceId, currentStatus, onToggle }) => {
// //   const isChecked = currentStatus === "ON";

// //   const handleToggle = (e) => {
// //     e.stopPropagation();
// //     onToggle(deviceId, isChecked ? "OFF" : "ON");
// //   };

// //   return (
// //     <label className="toggle-switch" onClick={(e) => e.stopPropagation()}>
// //       <input type="checkbox" checked={isChecked} onChange={handleToggle} />
// //       <span className="slider round"></span>
// //     </label>
// //   );
// // });

// // const DeviceRow = React.memo(({ device, onToggle, isSelected, onSelect }) => {
// //   const isOnline = device.status === "ON";
// //   const rowClass = `device-row ${isSelected ? "selected-row" : ""}`;

// //   return (
// //     <tr className={rowClass} onClick={() => onSelect(device.id)}>
// //       <td>{device.name}</td>
// //       <td>{device.voltage.toFixed(2)} V</td>
// //       <td>{device.current.toFixed(2)} A</td>
// //       <td>{device.power.toFixed(2)} W</td>
// //       <td>
// //         <span
// //           className={`status-label ${isOnline ? "online-label" : "offline-label"}`}
// //         >
// //           {isOnline ? "Active" : "Off"}
// //         </span>
// //       </td>
// //       <td>
// //         <ControlToggle
// //           deviceId={device.id}
// //           currentStatus={device.status}
// //           onToggle={onToggle}
// //         />
// //       </td>
// //     </tr>
// //   );
// // });

// // const DeviceDetailsModal = ({ device, onClose, historyData }) => {
// //   if (!device) return null;

// //   const calculateAverage = () => {
// //     if (!historyData || historyData.length === 0) return 0;
// //     const total = historyData.reduce((sum, item) => sum + (item.power || 0), 0);
// //     return (total / historyData.length).toFixed(2);
// //   };

// //   const averagePower = calculateAverage();
// //   const yearlyAverage = device.yearlyAverage || averagePower;

// //   return (
// //     <div className="modal-overlay" onClick={onClose}>
// //       <div className="modal-content" onClick={(e) => e.stopPropagation()}>
// //         <div className="modal-header">
// //           <h2>{device.name} - Details</h2>
// //           <button className="close-btn" onClick={onClose}>
// //             <X size={24} />
// //           </button>
// //         </div>

// //         <div className="modal-body">
// //           <div className="device-stats">
// //             <div className="stat-box">
// //               <h4>Voltage</h4>
// //               <p className="stat-value">{device.voltage.toFixed(2)} V</p>
// //             </div>
// //             <div className="stat-box">
// //               <h4>Current</h4>
// //               <p className="stat-value">{device.current.toFixed(2)} A</p>
// //             </div>
// //             <div className="stat-box">
// //               <h4>Power</h4>
// //               <p className="stat-value">{device.power.toFixed(2)} W</p>
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
// //               <h4>Avg. Reading (Year)</h4>
// //               <p className="stat-value" style={{ color: "#ff8f00" }}>
// //                 {yearlyAverage} W
// //               </p>
// //             </div>
// //             <div className="stat-box">
// //               <h4>Session Avg.</h4>
// //               <p className="stat-value" style={{ color: "#4a148c" }}>
// //                 {averagePower} W
// //               </p>
// //             </div>
// //           </div>

// //           <div className="device-graph">
// //             <h3>Power Consumption History</h3>
// //             <ResponsiveContainer width="100%" height={300}>
// //               <LineChart data={historyData}>
// //                 <CartesianGrid strokeDasharray="3 3" />
// //                 <XAxis dataKey="time" />
// //                 <YAxis />
// //                 <Tooltip />
// //                 <Legend />
// //                 <Line
// //                   type="monotone"
// //                   dataKey="power"
// //                   stroke="#4a148c"
// //                   strokeWidth={2}
// //                   dot={{ r: 3 }}
// //                   name="Power (W)"
// //                 />
// //               </LineChart>
// //             </ResponsiveContainer>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default function LiveReadings() {
// //   const [devices, setDevices] = useState([]);
// //   const [historyData, setHistoryData] = useState([]);
// //   const [deviceHistory, setDeviceHistory] = useState({});
// //   const [isLoading, setIsLoading] = useState(true);
// //   const [error, setError] = useState(null);
// //   const [selectedDeviceId, setSelectedDeviceId] = useState(null);
// //   const [totalPower, setTotalPower] = useState(0);

// //   const { user } = useAuth();

// //   const fetchData = useCallback(async () => {
// //     if (!user) return;

// //     try {
// //       const roomsResponse = await fetchWithAuth(API_ENDPOINTS.ROOMS);
// //       if (!roomsResponse.ok) throw new Error("Failed to fetch rooms");
// //       const allRooms = await roomsResponse.json();

// //       const userRooms = USE_JSON_SERVER
// //         ? allRooms.filter((room) => room.userId === user.id)
// //         : allRooms;

// //       const userRoomIds = userRooms.map((room) => room._id || room.id);

// //       const devicesResponse = await fetchWithAuth(API_ENDPOINTS.DEVICES);
// //       if (!devicesResponse.ok)
// //         throw new Error(`HTTP error! status: ${devicesResponse.status}`);
// //       const allDevices = await devicesResponse.json();

// //       const userDevices = allDevices.filter((device) =>
// //         userRoomIds.includes(device.roomId),
// //       );

// //       const normalizedDevices = userDevices.map(normalizeDevice);
// //       setDevices(normalizedDevices);

// //       const total = normalizedDevices.reduce(
// //         (sum, d) => sum + (d.status === "ON" ? d.power : 0),
// //         0,
// //       );
// //       setTotalPower(total);

// //       const timestamp = new Date().toLocaleTimeString();
// //       setHistoryData((prev) => {
// //         const newPoint = {
// //           time: timestamp,
// //           "Total Power": total,
// //         };
// //         const updated = [...prev, newPoint];
// //         return updated.length > HISTORY_LIMIT
// //           ? updated.slice(updated.length - HISTORY_LIMIT)
// //           : updated;
// //       });

// //       setDeviceHistory((prev) => {
// //         const newHistory = { ...prev };
// //         normalizedDevices.forEach((device) => {
// //           if (!newHistory[device.id]) {
// //             newHistory[device.id] = [];
// //           }
// //           newHistory[device.id] = [
// //             ...newHistory[device.id],
// //             {
// //               time: timestamp,
// //               power: device.status === "ON" ? device.power : 0,
// //             },
// //           ].slice(-HISTORY_LIMIT);
// //         });
// //         return newHistory;
// //       });

// //       setIsLoading(false);
// //       setError(null);
// //     } catch (err) {
// //       console.error("API Error:", err);
// //       setError(err.message);
// //       setIsLoading(false);
// //     }
// //   }, [user]);

// //   useEffect(() => {
// //     if (user) {
// //       fetchData();
// //       const id = setInterval(fetchData, UPDATE_INTERVAL_MS);
// //       return () => clearInterval(id);
// //     }
// //   }, [fetchData, user]);

// //   const toggleDeviceState = async (deviceId, newStatus) => {
// //     try {
// //       const currentDevice = devices.find((d) => d.id === deviceId);

// //       if (!currentDevice) {
// //         throw new Error("Device not found");
// //       }

// //       if (USE_JSON_SERVER) {
// //         const response = await fetchWithAuth(
// //           API_ENDPOINTS.DEVICE_BY_ID(deviceId),
// //           {
// //             method: "PUT",
// //             body: JSON.stringify({
// //               ...currentDevice,
// //               state: newStatus.toLowerCase(),
// //               latestReading: {
// //                 voltage: currentDevice.voltage,
// //                 current: currentDevice.current,
// //                 power: currentDevice.power,
// //               },
// //             }),
// //           },
// //         );

// //         if (!response.ok) {
// //           throw new Error("Failed to update device status");
// //         }
// //       } else {
// //         const response = await fetchWithAuth(
// //           API_ENDPOINTS.DEVICE_STATE(deviceId),
// //           {
// //             method: "PUT",
// //             body: JSON.stringify({
// //               state: newStatus.toLowerCase(),
// //             }),
// //           },
// //         );

// //         if (!response.ok) {
// //           throw new Error("Failed to update device status");
// //         }
// //       }

// //       setDevices((prev) =>
// //         prev.map((d) => (d.id === deviceId ? { ...d, status: newStatus } : d)),
// //       );

// //       await fetchData();
// //     } catch (err) {
// //       console.error("Error toggling device:", err);
// //       alert("Failed to update device status: " + err.message);
// //     }
// //   };

// //   const summaryReadings = useMemo(
// //     () => [
// //       {
// //         title: "Total Devices",
// //         value: devices.length,
// //         unit: "Devices",
// //         color: "#4a148c",
// //         icon: <Zap />,
// //       },
// //       {
// //         title: "Total Power",
// //         value: totalPower.toFixed(2),
// //         unit: "W",
// //         color: "#ff8f00",
// //         icon: <Power />,
// //       },
// //       {
// //         title: "System Status",
// //         value: error ? "Error" : "Normal",
// //         unit: "",
// //         color: error ? "#d32f2f" : "#2e7d32",
// //         icon: <AlertTriangle />,
// //       },
// //     ],
// //     [devices.length, totalPower, error],
// //   );

// //   const selectedDevice = devices.find((d) => d.id === selectedDeviceId);
// //   const selectedDeviceHistory = deviceHistory[selectedDeviceId] || [];

// //   if (isLoading && devices.length === 0) {
// //     return <div className="loading-state">Loading live data... ⏳</div>;
// //   }

// //   return (
// //     <div className="live-readings-container">
// //       <h2>Live Readings</h2>

// //       {error && <div className="error-state">⚠️ Error: {error}</div>}

// //       <div className="reading-cards-wrapper">
// //         {summaryReadings.map((card) => (
// //           <div
// //             key={card.title}
// //             className="reading-card"
// //             style={{ borderLeftColor: card.color }}
// //           >
// //             <h3>{card.title}</h3>
// //             <p style={{ color: card.color }}>
// //               {card.value} <span>{card.unit}</span>
// //             </p>
// //           </div>
// //         ))}
// //       </div>

// //       <div className="live-graph-container">
// //         <h3>Total Power Consumption</h3>
// //         <ResponsiveContainer width="100%" height={250}>
// //           <LineChart data={historyData}>
// //             <CartesianGrid strokeDasharray="3 3" />
// //             <XAxis dataKey="time" />
// //             <YAxis />
// //             <Tooltip />
// //             <Legend />
// //             <Line
// //               type="monotone"
// //               dataKey="Total Power"
// //               stroke="#ff8f00"
// //               strokeWidth={3}
// //               dot={false}
// //             />
// //           </LineChart>
// //         </ResponsiveContainer>
// //       </div>

// //       <div className="devices-table-container">
// //         {devices.length === 0 ? (
// //           <div
// //             style={{
// //               textAlign: "center",
// //               padding: "50px",
// //               color: "#888",
// //               fontSize: "18px",
// //             }}
// //           >
// //             No devices found. Add rooms and devices to see live readings! 📊
// //           </div>
// //         ) : (
// //           <table className="devices-table">
// //             <thead>
// //               <tr>
// //                 <th>Device</th>
// //                 <th>Voltage</th>
// //                 <th>Current</th>
// //                 <th>Power</th>
// //                 <th>Status</th>
// //                 <th>Control</th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               {devices.map((device) => (
// //                 <DeviceRow
// //                   key={device.id}
// //                   device={device}
// //                   onToggle={toggleDeviceState}
// //                   onSelect={setSelectedDeviceId}
// //                   isSelected={selectedDeviceId === device.id}
// //                 />
// //               ))}
// //             </tbody>
// //           </table>
// //         )}
// //       </div>

// //       {selectedDevice && (
// //         <DeviceDetailsModal
// //           device={selectedDevice}
// //           onClose={() => setSelectedDeviceId(null)}
// //           historyData={selectedDeviceHistory}
// //         />
// //       )}
// //     </div>
// //   );
// // }

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
// // import { Power, Zap, AlertTriangle, X } from "lucide-react";
// // import "../styles/LiveReadings.css";
// // import { useAuth } from "../../application/auth/AuthContext";
// // import API_ENDPOINTS, {
// //   fetchWithAuth,
// //   normalizeDevice,
// //   USE_JSON_SERVER,
// // } from "../../infrastructure/api/api.config";

// // const HISTORY_LIMIT = 20;
// // const UPDATE_INTERVAL_MS = 3000;

// // const ControlToggle = React.memo(({ deviceId, currentStatus, onToggle }) => {
// //   const isChecked = currentStatus === "ON";

// //   const handleToggle = (e) => {
// //     e.stopPropagation();
// //     onToggle(deviceId, isChecked ? "OFF" : "ON");
// //   };

// //   return (
// //     <label className="toggle-switch" onClick={(e) => e.stopPropagation()}>
// //       <input type="checkbox" checked={isChecked} onChange={handleToggle} />
// //       <span className="slider round"></span>
// //     </label>
// //   );
// // });

// // const DeviceRow = React.memo(({ device, onToggle, isSelected, onSelect }) => {
// //   const isOnline = device.status === "ON";
// //   const rowClass = `device-row ${isSelected ? "selected-row" : ""}`;

// //   return (
// //     <tr className={rowClass} onClick={() => onSelect(device.id)}>
// //       <td>{device.name}</td>
// //       <td>{device.voltage.toFixed(2)} V</td>
// //       <td>{device.current.toFixed(2)} A</td>
// //       <td>{device.power.toFixed(2)} W</td>
// //       <td>
// //         <span
// //           className={`status-label ${isOnline ? "online-label" : "offline-label"}`}
// //         >
// //           {isOnline ? "Active" : "Off"}
// //         </span>
// //       </td>
// //       <td>
// //         <ControlToggle
// //           deviceId={device.id}
// //           currentStatus={device.status}
// //           onToggle={onToggle}
// //         />
// //       </td>
// //     </tr>
// //   );
// // });

// // // Updated DeviceDetailsModal — now fetches REAL readings history
// // //  GET /readings/device/:deviceId
// // const DeviceDetailsModal = ({ device, onClose, inMemoryHistory }) => {
// //   const [realHistory, setRealHistory] = useState([]);
// //   const [loadingHistory, setLoadingHistory] = useState(false);

// //   useEffect(() => {
// //     if (!device) return;

// //     if (!USE_JSON_SERVER && API_ENDPOINTS.READING_BY_DEVICE(device.id)) {
// //       fetchRealHistory();
// //     }
// //   }, [device]);

// //   // GET /readings/device/:deviceId → getDeviceReadings
// //   const fetchRealHistory = async () => {
// //     setLoadingHistory(true);
// //     try {
// //       const response = await fetchWithAuth(
// //         API_ENDPOINTS.READING_BY_DEVICE(device.id),
// //       );
// //       if (!response.ok) throw new Error("Failed to fetch readings");

// //       const data = await response.json();

// //       // Backend returns { readings: [...] }
// //       const readings = data.readings || data;

// //       // Normalize to chart format — newest first from backend, so reverse
// //       const chartData = readings
// //         .slice()
// //         .reverse()
// //         .slice(-HISTORY_LIMIT)
// //         .map((r) => ({
// //           time: new Date(r.createdAt).toLocaleTimeString(),
// //           power: r.power || 0,
// //           voltage: r.voltage || 0,
// //           current: r.current || 0,
// //         }));

// //       setRealHistory(chartData);
// //     } catch (err) {
// //       console.error("Error fetching readings history:", err);
// //       // Fall back to in-memory history if real fetch fails
// //       setRealHistory([]);
// //     } finally {
// //       setLoadingHistory(false);
// //     }
// //   };

// //   if (!device) return null;

// //   // Use real history if available, otherwise fall back to in-memory
// //   const historyData =
// //     !USE_JSON_SERVER && realHistory.length > 0 ? realHistory : inMemoryHistory;

// //   const calculateAverage = () => {
// //     if (!historyData || historyData.length === 0) return 0;
// //     const total = historyData.reduce((sum, item) => sum + (item.power || 0), 0);
// //     return (total / historyData.length).toFixed(2);
// //   };

// //   const averagePower = calculateAverage();
// //   const yearlyAverage = device.yearlyAverage || averagePower;

// //   return (
// //     <div className="modal-overlay" onClick={onClose}>
// //       <div className="modal-content" onClick={(e) => e.stopPropagation()}>
// //         <div className="modal-header">
// //           <h2>{device.name} - Details</h2>
// //           <button className="close-btn" onClick={onClose}>
// //             <X size={24} />
// //           </button>
// //         </div>

// //         <div className="modal-body">
// //           <div className="device-stats">
// //             <div className="stat-box">
// //               <h4>Voltage</h4>
// //               <p className="stat-value">{device.voltage.toFixed(2)} V</p>
// //             </div>
// //             <div className="stat-box">
// //               <h4>Current</h4>
// //               <p className="stat-value">{device.current.toFixed(2)} A</p>
// //             </div>
// //             <div className="stat-box">
// //               <h4>Power</h4>
// //               <p className="stat-value">{device.power.toFixed(2)} W</p>
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
// //               <h4>Avg. Reading (Year)</h4>
// //               <p className="stat-value" style={{ color: "#ff8f00" }}>
// //                 {yearlyAverage} W
// //               </p>
// //             </div>
// //             <div className="stat-box">
// //               <h4>Session Avg.</h4>
// //               <p className="stat-value" style={{ color: "#4a148c" }}>
// //                 {averagePower} W
// //               </p>
// //             </div>
// //           </div>

// //           <div className="device-graph">
// //             <h3>
// //               Power Consumption History{" "}
// //               {loadingHistory && (
// //                 <span style={{ fontSize: "13px", color: "#888" }}>
// //                   Loading...
// //                 </span>
// //               )}
// //             </h3>
// //             <ResponsiveContainer width="100%" height={300}>
// //               <LineChart data={historyData}>
// //                 <CartesianGrid strokeDasharray="3 3" />
// //                 <XAxis dataKey="time" />
// //                 <YAxis />
// //                 <Tooltip />
// //                 <Legend />
// //                 <Line
// //                   type="monotone"
// //                   dataKey="power"
// //                   stroke="#4a148c"
// //                   strokeWidth={2}
// //                   dot={{ r: 3 }}
// //                   name="Power (W)"
// //                 />
// //               </LineChart>
// //             </ResponsiveContainer>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default function LiveReadings() {
// //   const [devices, setDevices] = useState([]);
// //   const [historyData, setHistoryData] = useState([]);
// //   const [deviceHistory, setDeviceHistory] = useState({});
// //   const [isLoading, setIsLoading] = useState(true);
// //   const [error, setError] = useState(null);
// //   const [selectedDeviceId, setSelectedDeviceId] = useState(null);
// //   const [totalPower, setTotalPower] = useState(0);

// //   const { user } = useAuth();

// //   //GET /readings/:deviceId → getDeviceWithLatestReading
// //   const fetchData = useCallback(async () => {
// //     if (!user) return;

// //     try {
// //       const roomsResponse = await fetchWithAuth(API_ENDPOINTS.ROOMS);
// //       if (!roomsResponse.ok) throw new Error("Failed to fetch rooms");
// //       const allRooms = await roomsResponse.json();

// //       const userRooms = USE_JSON_SERVER
// //         ? allRooms.filter((room) => room.userId === user.id)
// //         : allRooms;

// //       const userRoomIds = userRooms.map((room) => room._id || room.id);

// //       const devicesResponse = await fetchWithAuth(API_ENDPOINTS.DEVICES);
// //       if (!devicesResponse.ok)
// //         throw new Error(`HTTP error! status: ${devicesResponse.status}`);
// //       const allDevices = await devicesResponse.json();

// //       const userDevices = allDevices.filter((device) =>
// //         userRoomIds.includes(device.roomId),
// //       );

// //       // GET /readings/:deviceId → returns device + latestReading populated
// //       let normalizedDevices;

// //       if (!USE_JSON_SERVER) {
// //         const devicesWithReadings = await Promise.all(
// //           userDevices.map(async (device) => {
// //             try {
// //               const deviceId = device._id || device.id;
// //               const readingResponse = await fetchWithAuth(
// //                 API_ENDPOINTS.DEVICE_WITH_LATEST_READING(deviceId),
// //               );

// //               if (readingResponse.ok) {
// //                 const deviceWithReading = await readingResponse.json();
// //                 // Merge latest reading into device object
// //                 return {
// //                   ...device,
// //                   latestReading:
// //                     deviceWithReading.latestReading || device.latestReading,
// //                 };
// //               }
// //               return device;
// //             } catch {
// //               // If individual fetch fails, use device as-is
// //               return device;
// //             }
// //           }),
// //         );
// //         normalizedDevices = devicesWithReadings.map(normalizeDevice);
// //       } else {
// //         normalizedDevices = userDevices.map(normalizeDevice);
// //       }

// //       setDevices(normalizedDevices);

// //       const total = normalizedDevices.reduce(
// //         (sum, d) => sum + (d.status === "ON" ? d.power : 0),
// //         0,
// //       );
// //       setTotalPower(total);

// //       const timestamp = new Date().toLocaleTimeString();

// //       setHistoryData((prev) => {
// //         const newPoint = { time: timestamp, "Total Power": total };
// //         const updated = [...prev, newPoint];
// //         return updated.length > HISTORY_LIMIT
// //           ? updated.slice(updated.length - HISTORY_LIMIT)
// //           : updated;
// //       });

// //       setDeviceHistory((prev) => {
// //         const newHistory = { ...prev };
// //         normalizedDevices.forEach((device) => {
// //           if (!newHistory[device.id]) newHistory[device.id] = [];
// //           newHistory[device.id] = [
// //             ...newHistory[device.id],
// //             {
// //               time: timestamp,
// //               power: device.status === "ON" ? device.power : 0,
// //             },
// //           ].slice(-HISTORY_LIMIT);
// //         });
// //         return newHistory;
// //       });

// //       setIsLoading(false);
// //       setError(null);
// //     } catch (err) {
// //       console.error("API Error:", err);
// //       setError(err.message);
// //       setIsLoading(false);
// //     }
// //   }, [user]);

// //   useEffect(() => {
// //     if (user) {
// //       fetchData();
// //       const id = setInterval(fetchData, UPDATE_INTERVAL_MS);
// //       return () => clearInterval(id);
// //     }
// //   }, [fetchData, user]);

// //   const toggleDeviceState = async (deviceId, newStatus) => {
// //     try {
// //       const currentDevice = devices.find((d) => d.id === deviceId);
// //       if (!currentDevice) throw new Error("Device not found");

// //       if (USE_JSON_SERVER) {
// //         const response = await fetchWithAuth(
// //           API_ENDPOINTS.DEVICE_BY_ID(deviceId),
// //           {
// //             method: "PUT",
// //             body: JSON.stringify({
// //               ...currentDevice,
// //               state: newStatus.toLowerCase(),
// //               latestReading: {
// //                 voltage: currentDevice.voltage,
// //                 current: currentDevice.current,
// //                 power: currentDevice.power,
// //               },
// //             }),
// //           },
// //         );
// //         if (!response.ok) throw new Error("Failed to update device status");
// //       } else {
// //         const response = await fetchWithAuth(
// //           API_ENDPOINTS.DEVICE_STATE(deviceId),
// //           {
// //             method: "PUT",
// //             body: JSON.stringify({ state: newStatus.toLowerCase() }),
// //           },
// //         );
// //         if (!response.ok) throw new Error("Failed to update device status");
// //       }

// //       setDevices((prev) =>
// //         prev.map((d) => (d.id === deviceId ? { ...d, status: newStatus } : d)),
// //       );

// //       await fetchData();
// //     } catch (err) {
// //       console.error("Error toggling device:", err);
// //       alert("Failed to update device status: " + err.message);
// //     }
// //   };

// //   const summaryReadings = useMemo(
// //     () => [
// //       {
// //         title: "Total Devices",
// //         value: devices.length,
// //         unit: "Devices",
// //         color: "#4a148c",
// //         icon: <Zap />,
// //       },
// //       {
// //         title: "Total Power",
// //         value: totalPower.toFixed(2),
// //         unit: "W",
// //         color: "#ff8f00",
// //         icon: <Power />,
// //       },
// //       {
// //         title: "System Status",
// //         value: error ? "Error" : "Normal",
// //         unit: "",
// //         color: error ? "#d32f2f" : "#2e7d32",
// //         icon: <AlertTriangle />,
// //       },
// //     ],
// //     [devices.length, totalPower, error],
// //   );

// //   const selectedDevice = devices.find((d) => d.id === selectedDeviceId);
// //   const selectedDeviceInMemoryHistory = deviceHistory[selectedDeviceId] || [];

// //   if (isLoading && devices.length === 0) {
// //     return <div className="loading-state">Loading live data... ⏳</div>;
// //   }

// //   return (
// //     <div className="live-readings-container">
// //       <h2>Live Readings</h2>

// //       {error && <div className="error-state">⚠️ Error: {error}</div>}

// //       <div className="reading-cards-wrapper">
// //         {summaryReadings.map((card) => (
// //           <div
// //             key={card.title}
// //             className="reading-card"
// //             style={{ borderLeftColor: card.color }}
// //           >
// //             <h3>{card.title}</h3>
// //             <p style={{ color: card.color }}>
// //               {card.value} <span>{card.unit}</span>
// //             </p>
// //           </div>
// //         ))}
// //       </div>

// //       <div className="live-graph-container">
// //         <h3>Total Power Consumption</h3>
// //         <ResponsiveContainer width="100%" height={250}>
// //           <LineChart data={historyData}>
// //             <CartesianGrid strokeDasharray="3 3" />
// //             <XAxis dataKey="time" />
// //             <YAxis />
// //             <Tooltip />
// //             <Legend />
// //             <Line
// //               type="monotone"
// //               dataKey="Total Power"
// //               stroke="#ff8f00"
// //               strokeWidth={3}
// //               dot={false}
// //             />
// //           </LineChart>
// //         </ResponsiveContainer>
// //       </div>

// //       <div className="devices-table-container">
// //         {devices.length === 0 ? (
// //           <div
// //             style={{
// //               textAlign: "center",
// //               padding: "50px",
// //               color: "#888",
// //               fontSize: "18px",
// //             }}
// //           >
// //             No devices found. Add rooms and devices to see live readings! 📊
// //           </div>
// //         ) : (
// //           <table className="devices-table">
// //             <thead>
// //               <tr>
// //                 <th>Device</th>
// //                 <th>Voltage</th>
// //                 <th>Current</th>
// //                 <th>Power</th>
// //                 <th>Status</th>
// //                 <th>Control</th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               {devices.map((device) => (
// //                 <DeviceRow
// //                   key={device.id}
// //                   device={device}
// //                   onToggle={toggleDeviceState}
// //                   onSelect={setSelectedDeviceId}
// //                   isSelected={selectedDeviceId === device.id}
// //                 />
// //               ))}
// //             </tbody>
// //           </table>
// //         )}
// //       </div>

// //       {selectedDevice && (
// //         <DeviceDetailsModal
// //           device={selectedDevice}
// //           onClose={() => setSelectedDeviceId(null)}
// //           inMemoryHistory={selectedDeviceInMemoryHistory}
// //         />
// //       )}
// //     </div>
// //   );
// // }

// import React, { useState, useEffect, useCallback, useMemo } from "react";
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
// import { Power, Zap, AlertTriangle, X } from "lucide-react";
// import "../styles/LiveReadings.css";
// import { useAuth } from "../../application/auth/AuthContext";
// import API_ENDPOINTS, {
//   fetchWithAuth,
//   normalizeDevice,
//   USE_JSON_SERVER,
// } from "../../infrastructure/api/api.config";

// const HISTORY_LIMIT = 20;
// const UPDATE_INTERVAL_MS = 3000;

// const ControlToggle = React.memo(({ deviceId, currentStatus, onToggle }) => {
//   const isChecked = currentStatus === "ON";

//   const handleToggle = (e) => {
//     e.stopPropagation();
//     onToggle(deviceId, isChecked ? "OFF" : "ON");
//   };

//   return (
//     <label className="toggle-switch" onClick={(e) => e.stopPropagation()}>
//       <input type="checkbox" checked={isChecked} onChange={handleToggle} />
//       <span className="slider round"></span>
//     </label>
//   );
// });

// const DeviceRow = React.memo(({ device, onToggle, isSelected, onSelect }) => {
//   const isOnline = device.status === "ON";
//   const rowClass = `device-row ${isSelected ? "selected-row" : ""}`;

//   return (
//     <tr className={rowClass} onClick={() => onSelect(device.id)}>
//       <td>{device.name}</td>
//       <td>{device.voltage.toFixed(2)} V</td>
//       <td>{device.current.toFixed(2)} A</td>
//       <td>{device.power.toFixed(2)} W</td>
//       <td>
//         <span
//           className={`status-label ${isOnline ? "online-label" : "offline-label"}`}
//         >
//           {isOnline ? "Active" : "Off"}
//         </span>
//       </td>
//       <td>
//         <ControlToggle
//           deviceId={device.id}
//           currentStatus={device.status}
//           onToggle={onToggle}
//         />
//       </td>
//     </tr>
//   );
// });

// const DeviceDetailsModal = ({ device, onClose, inMemoryHistory }) => {
//   const [realHistory, setRealHistory] = useState([]);
//   const [loadingHistory, setLoadingHistory] = useState(false);
//   const [monthlyAvg, setMonthlyAvg] = useState(null);
//   const [yearlyAvg, setYearlyAvg] = useState(null);
//   const [loadingStats, setLoadingStats] = useState(false);

//   useEffect(() => {
//     if (!device) return;

//     if (!USE_JSON_SERVER) {
//       if (API_ENDPOINTS.READING_BY_DEVICE(device.id)) {
//         fetchRealHistory();
//       }
//       fetchMonthlyYearlyStats();
//     }
//   }, [device]);

//   // GET /readings/device/:deviceId
//   const fetchRealHistory = async () => {
//     setLoadingHistory(true);
//     try {
//       const response = await fetchWithAuth(
//         API_ENDPOINTS.READING_BY_DEVICE(device.id),
//       );
//       if (!response.ok) throw new Error("Failed to fetch readings");

//       const data = await response.json();
//       const readings = data.readings || data;

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
//   };

//   // GET /stats/monthly  &  GET /stats/yearly
//   const fetchMonthlyYearlyStats = async () => {
//     setLoadingStats(true);
//     try {
//       const [monthlyRes, yearlyRes] = await Promise.all([
//         fetchWithAuth(API_ENDPOINTS.MONTHLY_STATS),
//         fetchWithAuth(API_ENDPOINTS.YEARLY_STATS),
//       ]);

//       if (monthlyRes.ok) {
//         const monthlyData = await monthlyRes.json();
//         // Find this device's avg in the monthly stats array (if per-device), else use total
//         const deviceMonthly = Array.isArray(monthlyData)
//           ? monthlyData.find((d) => d.deviceId === device.id)
//           : monthlyData;
//         setMonthlyAvg(
//           deviceMonthly?.avgPower ?? deviceMonthly?.averagePower ?? null,
//         );
//       }

//       if (yearlyRes.ok) {
//         const yearlyData = await yearlyRes.json();
//         const deviceYearly = Array.isArray(yearlyData)
//           ? yearlyData.find((d) => d.deviceId === device.id)
//           : yearlyData;
//         setYearlyAvg(
//           deviceYearly?.avgPower ?? deviceYearly?.averagePower ?? null,
//         );
//       }
//     } catch (err) {
//       console.error("Error fetching monthly/yearly stats:", err);
//     } finally {
//       setLoadingStats(false);
//     }
//   };

//   if (!device) return null;

//   const historyData =
//     !USE_JSON_SERVER && realHistory.length > 0 ? realHistory : inMemoryHistory;

//   const calculateAverage = () => {
//     if (!historyData || historyData.length === 0) return 0;
//     const total = historyData.reduce((sum, item) => sum + (item.power || 0), 0);
//     return (total / historyData.length).toFixed(2);
//   };

//   const averagePower = calculateAverage();

//   // Displayed values: prefer API data, fall back to in-memory avg or device field
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
//             <div className="stat-box">
//               <h4>Voltage</h4>
//               <p className="stat-value">{device.voltage.toFixed(2)} V</p>
//             </div>
//             <div className="stat-box">
//               <h4>Current</h4>
//               <p className="stat-value">{device.current.toFixed(2)} A</p>
//             </div>
//             <div className="stat-box">
//               <h4>Power</h4>
//               <p className="stat-value">{device.power.toFixed(2)} W</p>
//             </div>
//             <div className="stat-box">
//               <h4>Status</h4>
//               <p
//                 className={`stat-value ${device.status === "ON" ? "text-success" : "text-danger"}`}
//               >
//                 {device.status}
//               </p>
//             </div>

//             {/* ── Avg. Power (Monthly) ── replaces old Session Avg */}
//             <div className="stat-box">
//               <h4>Avg. Power (Monthly)</h4>
//               <p className="stat-value" style={{ color: "#4a148c" }}>
//                 {loadingStats ? "..." : `${displayMonthlyAvg} W`}
//               </p>
//             </div>

//             {/* ── Avg. Power (Yearly) ── keeps existing yearly box */}
//             <div className="stat-box">
//               <h4>Avg. Power (Yearly)</h4>
//               <p className="stat-value" style={{ color: "#ff8f00" }}>
//                 {loadingStats ? "..." : `${displayYearlyAvg} W`}
//               </p>
//             </div>
//           </div>

//           <div className="device-graph">
//             <h3>
//               Power Consumption History{" "}
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
//                   dataKey="power"
//                   stroke="#4a148c"
//                   strokeWidth={2}
//                   dot={{ r: 3 }}
//                   name="Power (W)"
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default function LiveReadings() {
//   const [devices, setDevices] = useState([]);
//   const [historyData, setHistoryData] = useState([]);
//   const [deviceHistory, setDeviceHistory] = useState({});
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedDeviceId, setSelectedDeviceId] = useState(null);
//   const [totalPower, setTotalPower] = useState(0);

//   const { user } = useAuth();

//   const fetchData = useCallback(async () => {
//     if (!user) return;

//     try {
//       const roomsResponse = await fetchWithAuth(API_ENDPOINTS.ROOMS);
//       if (!roomsResponse.ok) throw new Error("Failed to fetch rooms");
//       const allRooms = await roomsResponse.json();

//       const userRooms = USE_JSON_SERVER
//         ? allRooms.filter((room) => room.userId === user.id)
//         : allRooms;

//       const userRoomIds = userRooms.map((room) => room._id || room.id);

//       const devicesResponse = await fetchWithAuth(API_ENDPOINTS.DEVICES);
//       if (!devicesResponse.ok)
//         throw new Error(`HTTP error! status: ${devicesResponse.status}`);
//       const allDevices = await devicesResponse.json();

//       const userDevices = allDevices.filter((device) =>
//         userRoomIds.includes(device.roomId),
//       );

//       let normalizedDevices;

//       if (!USE_JSON_SERVER) {
//         const devicesWithReadings = await Promise.all(
//           userDevices.map(async (device) => {
//             try {
//               const deviceId = device._id || device.id;
//               const readingResponse = await fetchWithAuth(
//                 API_ENDPOINTS.DEVICE_WITH_LATEST_READING(deviceId),
//               );

//               if (readingResponse.ok) {
//                 const deviceWithReading = await readingResponse.json();
//                 return {
//                   ...device,
//                   latestReading:
//                     deviceWithReading.latestReading || device.latestReading,
//                 };
//               }
//               return device;
//             } catch {
//               return device;
//             }
//           }),
//         );
//         normalizedDevices = devicesWithReadings.map(normalizeDevice);
//       } else {
//         normalizedDevices = userDevices.map(normalizeDevice);
//       }

//       setDevices(normalizedDevices);

//       const total = normalizedDevices.reduce(
//         (sum, d) => sum + (d.status === "ON" ? d.power : 0),
//         0,
//       );
//       setTotalPower(total);

//       const timestamp = new Date().toLocaleTimeString();

//       setHistoryData((prev) => {
//         const newPoint = { time: timestamp, "Total Power": total };
//         const updated = [...prev, newPoint];
//         return updated.length > HISTORY_LIMIT
//           ? updated.slice(updated.length - HISTORY_LIMIT)
//           : updated;
//       });

//       setDeviceHistory((prev) => {
//         const newHistory = { ...prev };
//         normalizedDevices.forEach((device) => {
//           if (!newHistory[device.id]) newHistory[device.id] = [];
//           newHistory[device.id] = [
//             ...newHistory[device.id],
//             {
//               time: timestamp,
//               power: device.status === "ON" ? device.power : 0,
//             },
//           ].slice(-HISTORY_LIMIT);
//         });
//         return newHistory;
//       });

//       setIsLoading(false);
//       setError(null);
//     } catch (err) {
//       console.error("API Error:", err);
//       setError(err.message);
//       setIsLoading(false);
//     }
//   }, [user]);

//   useEffect(() => {
//     if (user) {
//       fetchData();
//       const id = setInterval(fetchData, UPDATE_INTERVAL_MS);
//       return () => clearInterval(id);
//     }
//   }, [fetchData, user]);

//   const toggleDeviceState = async (deviceId, newStatus) => {
//     try {
//       const currentDevice = devices.find((d) => d.id === deviceId);
//       if (!currentDevice) throw new Error("Device not found");

//       if (USE_JSON_SERVER) {
//         const response = await fetchWithAuth(
//           API_ENDPOINTS.DEVICE_BY_ID(deviceId),
//           {
//             method: "PUT",
//             body: JSON.stringify({
//               ...currentDevice,
//               state: newStatus.toLowerCase(),
//               latestReading: {
//                 voltage: currentDevice.voltage,
//                 current: currentDevice.current,
//                 power: currentDevice.power,
//               },
//             }),
//           },
//         );
//         if (!response.ok) throw new Error("Failed to update device status");
//       } else {
//         const response = await fetchWithAuth(
//           API_ENDPOINTS.DEVICE_STATE(deviceId),
//           {
//             method: "PUT",
//             body: JSON.stringify({ state: newStatus.toLowerCase() }),
//           },
//         );
//         if (!response.ok) throw new Error("Failed to update device status");
//       }

//       setDevices((prev) =>
//         prev.map((d) => (d.id === deviceId ? { ...d, status: newStatus } : d)),
//       );

//       await fetchData();
//     } catch (err) {
//       console.error("Error toggling device:", err);
//       alert("Failed to update device status: " + err.message);
//     }
//   };

//   const summaryReadings = useMemo(
//     () => [
//       {
//         title: "Total Devices",
//         value: devices.length,
//         unit: "Devices",
//         color: "#4a148c",
//         icon: <Zap />,
//       },
//       {
//         title: "Total Power",
//         value: totalPower.toFixed(2),
//         unit: "W",
//         color: "#ff8f00",
//         icon: <Power />,
//       },
//       {
//         title: "System Status",
//         value: error ? "Error" : "Normal",
//         unit: "",
//         color: error ? "#d32f2f" : "#2e7d32",
//         icon: <AlertTriangle />,
//       },
//     ],
//     [devices.length, totalPower, error],
//   );

//   const selectedDevice = devices.find((d) => d.id === selectedDeviceId);
//   const selectedDeviceInMemoryHistory = deviceHistory[selectedDeviceId] || [];

//   if (isLoading && devices.length === 0) {
//     return <div className="loading-state">Loading live data... ⏳</div>;
//   }

//   return (
//     <div className="live-readings-container">
//       <h2>Live Readings</h2>

//       {error && <div className="error-state">⚠️ Error: {error}</div>}

//       <div className="reading-cards-wrapper">
//         {summaryReadings.map((card) => (
//           <div
//             key={card.title}
//             className="reading-card"
//             style={{ borderLeftColor: card.color }}
//           >
//             <h3>{card.title}</h3>
//             <p style={{ color: card.color }}>
//               {card.value} <span>{card.unit}</span>
//             </p>
//           </div>
//         ))}
//       </div>

//       <div className="live-graph-container">
//         <h3>Total Power Consumption</h3>
//         <ResponsiveContainer width="100%" height={250}>
//           <LineChart data={historyData}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="time" />
//             <YAxis />
//             <Tooltip />
//             <Legend />
//             <Line
//               type="monotone"
//               dataKey="Total Power"
//               stroke="#ff8f00"
//               strokeWidth={3}
//               dot={false}
//             />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>

//       <div className="devices-table-container">
//         {devices.length === 0 ? (
//           <div
//             style={{
//               textAlign: "center",
//               padding: "50px",
//               color: "#888",
//               fontSize: "18px",
//             }}
//           >
//             No devices found. Add rooms and devices to see live readings! 📊
//           </div>
//         ) : (
//           <table className="devices-table">
//             <thead>
//               <tr>
//                 <th>Device</th>
//                 <th>Voltage</th>
//                 <th>Current</th>
//                 <th>Power</th>
//                 <th>Status</th>
//                 <th>Control</th>
//               </tr>
//             </thead>
//             <tbody>
//               {devices.map((device) => (
//                 <DeviceRow
//                   key={device.id}
//                   device={device}
//                   onToggle={toggleDeviceState}
//                   onSelect={setSelectedDeviceId}
//                   isSelected={selectedDeviceId === device.id}
//                 />
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>

//       {selectedDevice && (
//         <DeviceDetailsModal
//           device={selectedDevice}
//           onClose={() => setSelectedDeviceId(null)}
//           inMemoryHistory={selectedDeviceInMemoryHistory}
//         />
//       )}
//     </div>
//   );
// }

//from folder fixed files
import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import { Power, Zap, AlertTriangle, X } from "lucide-react";
import "../styles/LiveReadings.css";
import { useAuth } from "../../application/auth/AuthContext";
import API_ENDPOINTS, {
  fetchWithAuth,
  normalizeDevice,
  USE_JSON_SERVER,
} from "../../infrastructure/api/api.config";

const HISTORY_LIMIT = 20;
const UPDATE_INTERVAL_MS = 3000;

const ControlToggle = React.memo(({ deviceId, currentStatus, onToggle }) => {
  const isChecked = currentStatus === "ON";

  const handleToggle = (e) => {
    e.stopPropagation();
    onToggle(deviceId, isChecked ? "OFF" : "ON");
  };

  return (
    <label className="toggle-switch" onClick={(e) => e.stopPropagation()}>
      <input type="checkbox" checked={isChecked} onChange={handleToggle} />
      <span className="slider round"></span>
    </label>
  );
});

const DeviceRow = React.memo(({ device, onToggle, isSelected, onSelect }) => {
  const isOnline = device.status === "ON";
  const rowClass = `device-row ${isSelected ? "selected-row" : ""}`;

  return (
    <tr className={rowClass} onClick={() => onSelect(device.id)}>
      <td>{device.name}</td>
      <td>{device.voltage.toFixed(2)} V</td>
      <td>{device.current.toFixed(2)} A</td>
      <td>{device.power.toFixed(2)} W</td>
      <td>
        <span
          className={`status-label ${isOnline ? "online-label" : "offline-label"}`}
        >
          {isOnline ? "Active" : "Off"}
        </span>
      </td>
      <td>
        <ControlToggle
          deviceId={device.id}
          currentStatus={device.status}
          onToggle={onToggle}
        />
      </td>
    </tr>
  );
});

const DeviceDetailsModal = ({ device, onClose, inMemoryHistory }) => {
  const [realHistory, setRealHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [monthlyAvg, setMonthlyAvg] = useState(null);
  const [yearlyAvg, setYearlyAvg] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (!device) return;
    if (!USE_JSON_SERVER) {
      fetchRealHistory();
      fetchMonthlyYearlyStats();
    }
  }, [device]);

  const fetchRealHistory = async () => {
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
  };

  const fetchMonthlyYearlyStats = async () => {
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
  };

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
            <div className="stat-box">
              <h4>Voltage</h4>
              <p className="stat-value">{device.voltage.toFixed(2)} V</p>
            </div>
            <div className="stat-box">
              <h4>Current</h4>
              <p className="stat-value">{device.current.toFixed(2)} A</p>
            </div>
            <div className="stat-box">
              <h4>Power</h4>
              <p className="stat-value">{device.power.toFixed(2)} W</p>
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
          </div>

          <div className="device-graph">
            <h3>
              Power Consumption History{" "}
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
                  dataKey="power"
                  stroke="#4a148c"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Power (W)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function LiveReadings() {
  const [devices, setDevices] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [deviceHistory, setDeviceHistory] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [totalPower, setTotalPower] = useState(0);

  const { user } = useAuth();

  const fetchData = useCallback(async () => {
    if (!user) return;

    try {
      const devicesResponse = await fetchWithAuth(API_ENDPOINTS.DEVICES);
      if (!devicesResponse.ok)
        throw new Error(`HTTP error! status: ${devicesResponse.status}`);

      const devicesData = await devicesResponse.json();

      // ✅ FIX: Backend returns [{ room: "name", devices: [...] }]
      // so we flatten it to get a plain array of devices
      let allDevices;
      if (USE_JSON_SERVER) {
        allDevices = Array.isArray(devicesData) ? devicesData : [];
      } else {
        allDevices = Array.isArray(devicesData)
          ? devicesData.flatMap((item) =>
              item.devices ? item.devices : [item],
            )
          : [];
      }

      let normalizedDevices;

      if (!USE_JSON_SERVER) {
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
        normalizedDevices = devicesWithReadings.map(normalizeDevice);
      } else {
        normalizedDevices = allDevices.map(normalizeDevice);
      }

      setDevices(normalizedDevices);

      const total = normalizedDevices.reduce(
        (sum, d) => sum + (d.status === "ON" ? d.power : 0),
        0,
      );
      setTotalPower(total);

      const timestamp = new Date().toLocaleTimeString();

      setHistoryData((prev) => {
        const newPoint = { time: timestamp, "Total Power": total };
        const updated = [...prev, newPoint];
        return updated.length > HISTORY_LIMIT
          ? updated.slice(updated.length - HISTORY_LIMIT)
          : updated;
      });

      setDeviceHistory((prev) => {
        const newHistory = { ...prev };
        normalizedDevices.forEach((device) => {
          if (!newHistory[device.id]) newHistory[device.id] = [];
          newHistory[device.id] = [
            ...newHistory[device.id],
            {
              time: timestamp,
              power: device.status === "ON" ? device.power : 0,
            },
          ].slice(-HISTORY_LIMIT);
        });
        return newHistory;
      });

      setIsLoading(false);
      setError(null);
    } catch (err) {
      console.error("API Error:", err);
      setError(err.message);
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchData();
      const id = setInterval(fetchData, UPDATE_INTERVAL_MS);
      return () => clearInterval(id);
    }
  }, [fetchData, user]);

  const toggleDeviceState = async (deviceId, newStatus) => {
    try {
      const currentDevice = devices.find((d) => d.id === deviceId);
      if (!currentDevice) throw new Error("Device not found");

      if (USE_JSON_SERVER) {
        const response = await fetchWithAuth(
          API_ENDPOINTS.DEVICE_BY_ID(deviceId),
          {
            method: "PUT",
            body: JSON.stringify({
              ...currentDevice,
              state: newStatus.toLowerCase(),
              latestReading: {
                voltage: currentDevice.voltage,
                current: currentDevice.current,
                power: currentDevice.power,
              },
            }),
          },
        );
        if (!response.ok) throw new Error("Failed to update device status");
      } else {
        const response = await fetchWithAuth(
          API_ENDPOINTS.DEVICE_STATE(deviceId),
          {
            method: "PUT",
            body: JSON.stringify({ state: newStatus.toLowerCase() }),
          },
        );
        if (!response.ok) throw new Error("Failed to update device status");
      }

      setDevices((prev) =>
        prev.map((d) => (d.id === deviceId ? { ...d, status: newStatus } : d)),
      );

      await fetchData();
    } catch (err) {
      console.error("Error toggling device:", err);
      alert("Failed to update device status: " + err.message);
    }
  };

  const summaryReadings = useMemo(
    () => [
      {
        title: "Total Devices",
        value: devices.length,
        unit: "Devices",
        color: "#4a148c",
        icon: <Zap />,
      },
      {
        title: "Total Power",
        value: totalPower.toFixed(2),
        unit: "W",
        color: "#ff8f00",
        icon: <Power />,
      },
      {
        title: "System Status",
        value: error ? "Error" : "Normal",
        unit: "",
        color: error ? "#d32f2f" : "#2e7d32",
        icon: <AlertTriangle />,
      },
    ],
    [devices.length, totalPower, error],
  );

  const selectedDevice = devices.find((d) => d.id === selectedDeviceId);
  const selectedDeviceInMemoryHistory = deviceHistory[selectedDeviceId] || [];

  if (isLoading && devices.length === 0) {
    return <div className="loading-state">Loading live data... ⏳</div>;
  }

  return (
    <div className="live-readings-container">
      <h2>Live Readings</h2>

      {error && <div className="error-state">⚠️ Error: {error}</div>}

      <div className="reading-cards-wrapper">
        {summaryReadings.map((card) => (
          <div
            key={card.title}
            className="reading-card"
            style={{ borderLeftColor: card.color }}
          >
            <h3>{card.title}</h3>
            <p style={{ color: card.color }}>
              {card.value} <span>{card.unit}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="live-graph-container">
        <h3>Total Power Consumption</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={historyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="Total Power"
              stroke="#ff8f00"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="devices-table-container">
        {devices.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "50px",
              color: "#888",
              fontSize: "18px",
            }}
          >
            No devices found. Add rooms and devices to see live readings! 📊
          </div>
        ) : (
          <table className="devices-table">
            <thead>
              <tr>
                <th>Device</th>
                <th>Voltage</th>
                <th>Current</th>
                <th>Power</th>
                <th>Status</th>
                <th>Control</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((device) => (
                <DeviceRow
                  key={device.id}
                  device={device}
                  onToggle={toggleDeviceState}
                  onSelect={setSelectedDeviceId}
                  isSelected={selectedDeviceId === device.id}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedDevice && (
        <DeviceDetailsModal
          device={selectedDevice}
          onClose={() => setSelectedDeviceId(null)}
          inMemoryHistory={selectedDeviceInMemoryHistory}
        />
      )}
    </div>
  );
}
