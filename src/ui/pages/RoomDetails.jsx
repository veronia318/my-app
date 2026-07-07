// import React, { useState, useEffect, useCallback } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { ArrowLeft, X, PlusCircle, Pencil, Check } from "lucide-react";
// import "../styles/RoomDetails.css";
// import API_ENDPOINTS, {
//   fetchWithAuth,
//   normalizeDevice,
//   USE_JSON_SERVER,
// } from "../../infrastructure/api/api.config";
// import { useAuth } from "../../application/auth/AuthContext";
// import DeviceDetailsModal from "../components/DeviceDetailsModal";

// const getDeviceIcon = (name = "") => {
//   const n = name.toLowerCase();
//   if (n.includes("fan")) return "🌀";
//   if (n.includes("light") || n.includes("lamp") || n.includes("bulb"))
//     return "💡";
//   if (n.includes("ac") || n.includes("air") || n.includes("cool")) return "❄️";
//   if (n.includes("tv") || n.includes("television")) return "📺";
//   if (n.includes("fridge") || n.includes("refrigerator")) return "🧊";
//   if (n.includes("wash")) return "🫧";
//   if (n.includes("heater") || n.includes("heat")) return "🔥";
//   if (n.includes("oven") || n.includes("microwave")) return "🍳";
//   if (n.includes("computer") || n.includes("pc") || n.includes("laptop"))
//     return "💻";
//   if (n.includes("phone") || n.includes("charger")) return "🔌";
//   if (n.includes("camera")) return "📷";
//   if (n.includes("speaker") || n.includes("sound")) return "🔊";
//   return "⚡";
// };

// export default function RoomDetails() {
//   const { roomId } = useParams();
//   const navigate = useNavigate();
//   const { user } = useAuth();

//   const [room, setRoom] = useState(null);
//   const [devices, setDevices] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [isAdding, setIsAdding] = useState(false);
//   const [newDeviceData, setNewDeviceData] = useState({ name: "" });
//   const [editingDeviceId, setEditingDeviceId] = useState(null);
//   const [editDeviceData, setEditDeviceData] = useState({ name: "" });
//   const [selectedDeviceId, setSelectedDeviceId] = useState(null);
//   const [monthlyAverages, setMonthlyAverages] = useState({}); // { [deviceId]: number }
//   const [aiStates, setAiStates] = useState({}); // { [deviceId]: "Normal" | "Anomaly" }

//   const fetchRoomAndDevices = useCallback(async () => {
//     try {
//       // ✅ جيب كل الـ rooms وفلتر بالـ id — بدل ما نطلب ROOM_BY_ID اللي مش موجود في الـ backend
//       const allRoomsResponse = await fetchWithAuth(API_ENDPOINTS.ROOMS);
//       if (!allRoomsResponse.ok) throw new Error("Failed to fetch rooms");
//       const allRooms = await allRoomsResponse.json();
//       const roomData = allRooms.find((r) => (r._id || r.id) === roomId);
//       if (!roomData) throw new Error("Room not found");

//       setRoom({
//         id: roomData._id || roomData.id,
//         name: roomData.name,
//         userId: roomData.userId,
//         image: roomData.image,
//       });

//       // Fetch devices by room
//       const devicesResponse = await fetchWithAuth(
//         API_ENDPOINTS.DEVICES_BY_ROOM(roomId),
//       );
//       if (!devicesResponse.ok) throw new Error("Failed to fetch devices");
//       const devicesData = await devicesResponse.json();

//       const devicesList = Array.isArray(devicesData)
//         ? devicesData
//         : devicesData.devices || [];

//       const devicesWithReadings = await Promise.all(
//         devicesList.map(async (device) => {
//           try {
//             const deviceId = device._id || device.id;
//             const readingResponse = await fetchWithAuth(
//               API_ENDPOINTS.DEVICE_WITH_LATEST_READING(deviceId),
//             );
//             if (readingResponse.ok) {
//               const deviceWithReading = await readingResponse.json();
//               return {
//                 ...device,
//                 latestReading:
//                   deviceWithReading.latestReading || device.latestReading,
//               };
//             }
//             return device;
//           } catch {
//             return device;
//           }
//         }),
//       );

//       const normalizedDevices = devicesWithReadings.map(normalizeDevice);
//       setDevices(normalizedDevices);
//       setLoading(false);

//       // Fetch Monthly Avg (same source as DeviceDetailsModal) and AI status
//       // (same single-latest-reading logic as the Homepage) for each device
//       fetchMonthlyAverages(normalizedDevices);
//       fetchAiStates(normalizedDevices);
//     } catch (err) {
//       console.error("Error:", err);
//       setLoading(false);
//     }
//   }, [roomId]);

//   // ── Monthly Avg — pulled from the same stats endpoint the
//   // DeviceDetailsModal uses, instead of a device.monthlyAverage field
//   // that the backend doesn't actually populate. ──
//   const fetchMonthlyAverages = async (deviceList) => {
//     const now = new Date();
//     const month = now.getMonth() + 1;
//     const year = now.getFullYear();

//     const results = await Promise.all(
//       deviceList.map(async (device) => {
//         try {
//           const res = await fetchWithAuth(
//             `${API_ENDPOINTS.MONTHLY_STATS}?deviceId=${device.id}&month=${month}&year=${year}`,
//           );
//           if (!res.ok) return [device.id, null];
//           const data = await res.json();
//           return [device.id, data?.monthlyAverage ?? null];
//         } catch {
//           return [device.id, null];
//         }
//       }),
//     );
//     setMonthlyAverages(Object.fromEntries(results));
//   };

//   // ── AI status — based on the device's MOST RECENT reading only,
//   // same logic used on the Homepage. ──
//   const fetchAiStates = async (deviceList) => {
//     const results = await Promise.all(
//       deviceList.map(async (device) => {
//         try {
//           const res = await fetchWithAuth(
//             API_ENDPOINTS.READING_BY_DEVICE(device.id),
//           );
//           if (!res.ok) return [device.id, "Normal"];

//           const data = await res.json();
//           const readings = Array.isArray(data) ? data : data.readings || [];
//           const latest = readings[0];

//           if (!latest) return [device.id, "Normal"];

//           const status =
//             latest.aiPrediction?.status?.toLowerCase() === "anomaly"
//               ? "Anomaly"
//               : "Normal";

//           return [device.id, status];
//         } catch {
//           return [device.id, "Normal"];
//         }
//       }),
//     );
//     setAiStates(Object.fromEntries(results));
//   };

//   useEffect(() => {
//     fetchRoomAndDevices();
//     const interval = setInterval(fetchRoomAndDevices, 10000);
//     return () => clearInterval(interval);
//   }, [fetchRoomAndDevices]);

//   const handleAddDevice = async (e) => {
//     e.preventDefault();
//     if (!newDeviceData.name) {
//       alert("Please enter device name.");
//       return;
//     }

//     const devicePayload = USE_JSON_SERVER
//       ? {
//           name: newDeviceData.name,
//           roomId,
//           userId: user.id,
//           state: "off",
//           image: null,
//           latestReading: { voltage: 0, current: 0, power: 0 },
//           yearlyAverage: 0,
//         }
//       : { name: newDeviceData.name, roomId };

//     try {
//       const response = await fetchWithAuth(API_ENDPOINTS.DEVICES_POST, {
//         method: "POST",
//         body: JSON.stringify(devicePayload),
//       });
//       if (!response.ok) throw new Error("Failed to add device");
//       const data = await response.json();
//       const addedDevice = data.device || data;
//       setDevices((prev) => [
//         ...prev,
//         normalizeDevice({ ...addedDevice, userId: user.id, roomId }),
//       ]);
//       setNewDeviceData({ name: "" });
//       setIsAdding(false);
//     } catch (err) {
//       alert("Failed to add device: " + err.message);
//     }
//   };

//   const removeDevice = async (deviceId) => {
//     const deviceToRemove = devices.find((d) => d.id === deviceId);
//     if (
//       !window.confirm(
//         `Are you sure you want to remove "${deviceToRemove.name}"?`,
//       )
//     )
//       return;
//     try {
//       const response = await fetchWithAuth(
//         API_ENDPOINTS.DEVICE_BY_ID(deviceId),
//         { method: "DELETE" },
//       );
//       if (!response.ok) throw new Error("Failed to delete device");
//       setDevices((prev) => prev.filter((device) => device.id !== deviceId));
//     } catch (err) {
//       alert("Failed to remove device: " + err.message);
//     }
//   };

//   const handleStartEdit = (e, device) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setEditingDeviceId(device.id);
//     setEditDeviceData({ name: device.name });
//   };

//   const handleUpdateDevice = async (e, deviceId) => {
//     e.preventDefault();
//     if (!editDeviceData.name) {
//       alert("Device name cannot be empty.");
//       return;
//     }
//     try {
//       const response = await fetchWithAuth(
//         API_ENDPOINTS.DEVICE_BY_ID(deviceId),
//         {
//           method: "PUT",
//           body: JSON.stringify({ name: editDeviceData.name }),
//         },
//       );
//       if (!response.ok) throw new Error("Failed to update device");
//       const data = await response.json();
//       const updatedDevice = data.device || data;
//       setDevices((prev) =>
//         prev.map((d) =>
//           d.id === deviceId ? normalizeDevice({ ...d, ...updatedDevice }) : d,
//         ),
//       );
//       setEditingDeviceId(null);
//     } catch (err) {
//       alert("Failed to update device: " + err.message);
//     }
//   };

//   const handleChange = (e) =>
//     setNewDeviceData({ ...newDeviceData, [e.target.name]: e.target.value });
//   const handleEditChange = (e) =>
//     setEditDeviceData({ ...editDeviceData, [e.target.name]: e.target.value });

//   if (loading) return <div className="loading">Loading... ⏳</div>;
//   if (!room) return <div className="error">Room not found!</div>;

//   return (
//     <div
//       className="room-details-container"
//       style={{ "--bg-image": `url(${room.image})` }}
//     >
//       <div className="room-details-header">
//         <button className="back-btn" onClick={() => navigate("/rooms")}>
//           <ArrowLeft size={20} /> Back to Rooms
//         </button>
//         <h1>{room.name}</h1>
//         <button className="add-device-button" onClick={() => setIsAdding(true)}>
//           <PlusCircle size={20} /> Add Device
//         </button>
//       </div>

//       {isAdding && (
//         <div className="add-device-form-container">
//           <form onSubmit={handleAddDevice} className="add-device-form">
//             <h3>Add New Device</h3>
//             <select
//               name="name"
//               value={newDeviceData.name}
//               onChange={handleChange}
//               className="add-device-input"
//               required
//             >
//               <option value="" disabled>
//                 Select a device...
//               </option>
//               <option>Smart TV</option>
//               <option>Smart Kettle</option>
//               <option>Smart Microwave</option>
//               <option>Smart Fan</option>
//               <option>Smart Lamp</option>
//               <option>Smart Toaster</option>
//               <option>Smart Coffee Maker</option>
//               <option>Smart Speaker</option>
//               <option>Smart Laptop Charger</option>
//             </select>
//             <div className="form-buttons">
//               <button type="submit" className="form-submit-btn">
//                 Add Device
//               </button>
//               <button
//                 type="button"
//                 className="form-cancel-btn"
//                 onClick={() => {
//                   setIsAdding(false);
//                   setNewDeviceData({ name: "" });
//                 }}
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       <div className="devices-grid">
//         {devices.length === 0 ? (
//           <div className="no-devices">
//             <p>No devices in this room yet.</p>
//             <p>Click "Add Device" to get started!</p>
//           </div>
//         ) : (
//           devices.map((device) => {
//             const monthlyAvg = monthlyAverages[device.id];
//             const aiStatus = aiStates[device.id] || "Normal";
//             const isAbnormal = aiStatus === "Anomaly";

//             return (
//               <div
//                 key={device.id}
//                 className="device-card"
//                 onClick={() => {
//                   if (editingDeviceId !== device.id) {
//                     setSelectedDeviceId(device.id);
//                   }
//                 }}
//                 style={{
//                   cursor: editingDeviceId === device.id ? "default" : "pointer",
//                 }}
//               >
//                 {editingDeviceId === device.id ? (
//                   <form
//                     onSubmit={(e) => handleUpdateDevice(e, device.id)}
//                     style={{ padding: "8px" }}
//                   >
//                     <h3 style={{ marginBottom: "10px" }}>Edit Device</h3>
//                     <input
//                       type="text"
//                       name="name"
//                       value={editDeviceData.name}
//                       onChange={handleEditChange}
//                       placeholder="Device Name"
//                       className="add-device-input"
//                       required
//                     />
//                     <div className="form-buttons" style={{ marginTop: "10px" }}>
//                       <button type="submit" className="form-submit-btn">
//                         <Check size={16} /> Save
//                       </button>
//                       <button
//                         type="button"
//                         className="form-cancel-btn"
//                         onClick={() => setEditingDeviceId(null)}
//                       >
//                         Cancel
//                       </button>
//                     </div>
//                   </form>
//                 ) : (
//                   <>
//                     <div className="device-header">
//                       <div className="device-title">
//                         <span className="device-emoji">
//                           {getDeviceIcon(device.name)}
//                         </span>
//                         <h3>{device.name || "Unknown Device"}</h3>
//                       </div>
//                       <div
//                         style={{
//                           display: "flex",
//                           gap: "6px",
//                           alignItems: "center",
//                         }}
//                       >
//                         <span
//                           className={`ai-status-badge ${isAbnormal ? "ai-status-badge--anomaly" : "ai-status-badge--normal"}`}
//                         >
//                           {isAbnormal ? "⚠️ Anomaly" : "✅ Normal"}
//                         </span>
//                         <span
//                           className={`status-badge ${device.status === "ON" ? "active" : "inactive"}`}
//                         >
//                           {device.status === "ON" ? "🟢 ON" : "🔴 OFF"}
//                         </span>
//                         <button
//                           className="edit-device-btn"
//                           onClick={(e) => handleStartEdit(e, device)}
//                           title="Edit device"
//                           type="button"
//                         >
//                           <Pencil size={16} />
//                         </button>
//                         <button
//                           className="remove-device-btn"
//                           onClick={(e) => {
//                             e.preventDefault();
//                             e.stopPropagation();
//                             removeDevice(device.id);
//                           }}
//                           title="Remove device"
//                           type="button"
//                         >
//                           <X size={18} />
//                         </button>
//                       </div>
//                     </div>

//                     <div className="device-readings-grid">
//                       <div className="reading-item">
//                         <span className="reading-label">⚡ Voltage</span>
//                         <span className="reading-value">
//                           {device.voltage || 0} V
//                         </span>
//                       </div>
//                       <div className="reading-item">
//                         <span className="reading-label">🔁 Current</span>
//                         <span className="reading-value">
//                           {device.current || 0} A
//                         </span>
//                       </div>
//                       <div className="reading-item">
//                         <span className="reading-label">💥 Power</span>
//                         <span className="reading-value">
//                           {device.power || 0} W
//                         </span>
//                       </div>
//                       <div className="reading-item">
//                         <span className="reading-label">🌡️ Temperature</span>
//                         <span className="reading-value">
//                           {device.temperature != null
//                             ? `${device.temperature} °C`
//                             : "N/A"}
//                         </span>
//                       </div>
//                       <div className="reading-item">
//                         <span className="reading-label">💧 Humidity</span>
//                         <span className="reading-value">
//                           {device.humidity != null
//                             ? `${device.humidity} %`
//                             : "N/A"}
//                         </span>
//                       </div>
//                       <div className="reading-item">
//                         <span className="reading-label">📅 Monthly Avg</span>
//                         <span className="reading-value">
//                           {monthlyAvg != null
//                             ? `${Number(monthlyAvg).toFixed(1)} W`
//                             : "N/A"}
//                         </span>
//                       </div>
//                     </div>
//                   </>
//                 )}
//               </div>
//             );
//           })
//         )}
//       </div>

//       {selectedDeviceId &&
//         (() => {
//           const selectedDevice = devices.find((d) => d.id === selectedDeviceId);
//           return selectedDevice ? (
//             <DeviceDetailsModal
//               device={selectedDevice}
//               onClose={() => setSelectedDeviceId(null)}
//             />
//           ) : null;
//         })()}
//     </div>
//   );
// }

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, X, PlusCircle, Pencil, Check } from "lucide-react";
import "../styles/RoomDetails.css";
import API_ENDPOINTS, {
  fetchWithAuth,
  normalizeDevice,
  USE_JSON_SERVER,
} from "../../infrastructure/api/api.config";
import { useAuth } from "../../application/auth/AuthContext";
import DeviceDetailsModal from "../components/DeviceDetailsModal";

const DEVICE_OPTIONS = [
  "Smart TV",
  "Smart Kettle",
  "Smart Microwave",
  "Smart Fan",
  "Smart Lamp",
  "Smart Toaster",
  "Smart Coffee Maker",
  "Smart Speaker",
  "Smart Laptop Charger",
];

const getDeviceIcon = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("fan")) return "🌀";
  if (n.includes("light") || n.includes("lamp") || n.includes("bulb"))
    return "💡";
  if (n.includes("ac") || n.includes("air") || n.includes("cool")) return "❄️";
  if (n.includes("tv") || n.includes("television")) return "📺";
  if (n.includes("fridge") || n.includes("refrigerator")) return "🧊";
  if (n.includes("wash")) return "🫧";
  if (n.includes("heater") || n.includes("heat")) return "🔥";
  if (n.includes("oven") || n.includes("microwave")) return "🍳";
  if (n.includes("computer") || n.includes("pc") || n.includes("laptop"))
    return "💻";
  if (n.includes("phone") || n.includes("charger")) return "🔌";
  if (n.includes("camera")) return "📷";
  if (n.includes("speaker") || n.includes("sound")) return "🔊";
  return "⚡";
};

export default function RoomDetails() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [room, setRoom] = useState(null);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newDeviceData, setNewDeviceData] = useState({ name: "" });
  const [editingDeviceId, setEditingDeviceId] = useState(null);
  const [editDeviceData, setEditDeviceData] = useState({ name: "" });
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [monthlyAverages, setMonthlyAverages] = useState({}); // { [deviceId]: number }
  const [aiStates, setAiStates] = useState({}); // { [deviceId]: "Normal" | "Anomaly" }

  const fetchRoomAndDevices = useCallback(async () => {
    try {
      // ✅ جيب كل الـ rooms وفلتر بالـ id — بدل ما نطلب ROOM_BY_ID اللي مش موجود في الـ backend
      const allRoomsResponse = await fetchWithAuth(API_ENDPOINTS.ROOMS);
      if (!allRoomsResponse.ok) throw new Error("Failed to fetch rooms");
      const allRooms = await allRoomsResponse.json();
      const roomData = allRooms.find((r) => (r._id || r.id) === roomId);
      if (!roomData) throw new Error("Room not found");

      setRoom({
        id: roomData._id || roomData.id,
        name: roomData.name,
        userId: roomData.userId,
        image: roomData.image,
      });

      // Fetch devices by room
      const devicesResponse = await fetchWithAuth(
        API_ENDPOINTS.DEVICES_BY_ROOM(roomId),
      );
      if (!devicesResponse.ok) throw new Error("Failed to fetch devices");
      const devicesData = await devicesResponse.json();

      const devicesList = Array.isArray(devicesData)
        ? devicesData
        : devicesData.devices || [];

      const devicesWithReadings = await Promise.all(
        devicesList.map(async (device) => {
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
      setDevices(normalizedDevices);
      setLoading(false);

      // Fetch Monthly Avg (same source as DeviceDetailsModal) and AI status
      // (same single-latest-reading logic as the Homepage) for each device
      fetchMonthlyAverages(normalizedDevices);
      fetchAiStates(normalizedDevices);
    } catch (err) {
      console.error("Error:", err);
      setLoading(false);
    }
  }, [roomId]);

  // ── Monthly Avg — pulled from the same stats endpoint the
  // DeviceDetailsModal uses, instead of a device.monthlyAverage field
  // that the backend doesn't actually populate. ──
  const fetchMonthlyAverages = async (deviceList) => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const results = await Promise.all(
      deviceList.map(async (device) => {
        try {
          const res = await fetchWithAuth(
            `${API_ENDPOINTS.MONTHLY_STATS}?deviceId=${device.id}&month=${month}&year=${year}`,
          );
          if (!res.ok) return [device.id, null];
          const data = await res.json();
          return [device.id, data?.monthlyAverage ?? null];
        } catch {
          return [device.id, null];
        }
      }),
    );
    setMonthlyAverages(Object.fromEntries(results));
  };

  // ── AI status — same logic as HomePage.jsx:
  //   - If the device is OFF → always "Normal", no AI evaluation at all.
  //   - If the device is ON  → search from the newest reading backwards
  //     until finding the nearest reading with a valid aiPrediction.status.
  //     If none exists anywhere, default to "Normal".
  const fetchAiStates = async (deviceList) => {
    const results = await Promise.all(
      deviceList.map(async (device) => {
        // Device is OFF — don't evaluate or search for AI predictions at all.
        if (device.status === "OFF") {
          return [device.id, "Normal"];
        }

        try {
          const res = await fetchWithAuth(
            API_ENDPOINTS.READING_BY_DEVICE(device.id),
          );
          if (!res.ok) return [device.id, "Normal"];

          const data = await res.json();
          const readings = Array.isArray(data) ? data : data.readings || [];

          // Readings come back newest-first (sort: createdAt -1 on the backend)
          // Search backwards from the latest reading until we find one with
          // a valid aiPrediction.
          const readingWithPrediction = readings.find((r) => r.aiPrediction);
          const aiPrediction = readingWithPrediction?.aiPrediction;

          const status =
            aiPrediction?.status?.toLowerCase() === "anomaly"
              ? "Anomaly"
              : "Normal";

          return [device.id, status];
        } catch {
          return [device.id, "Normal"];
        }
      }),
    );
    setAiStates(Object.fromEntries(results));
  };

  useEffect(() => {
    fetchRoomAndDevices();
    const interval = setInterval(fetchRoomAndDevices, 10000);
    return () => clearInterval(interval);
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
          roomId,
          userId: user.id,
          state: "off",
          image: null,
          latestReading: { voltage: 0, current: 0, power: 0 },
          yearlyAverage: 0,
        }
      : { name: newDeviceData.name, roomId };

    try {
      const response = await fetchWithAuth(API_ENDPOINTS.DEVICES_POST, {
        method: "POST",
        body: JSON.stringify(devicePayload),
      });
      if (!response.ok) throw new Error("Failed to add device");
      const data = await response.json();
      const addedDevice = data.device || data;
      setDevices((prev) => [
        ...prev,
        normalizeDevice({ ...addedDevice, userId: user.id, roomId }),
      ]);
      setNewDeviceData({ name: "" });
      setIsAdding(false);
    } catch (err) {
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
      alert("Failed to remove device: " + err.message);
    }
  };

  const handleStartEdit = (e, device) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingDeviceId(device.id);
    setEditDeviceData({ name: device.name });
  };

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
          body: JSON.stringify({ name: editDeviceData.name }),
        },
      );
      if (!response.ok) throw new Error("Failed to update device");
      const data = await response.json();
      const updatedDevice = data.device || data;
      setDevices((prev) =>
        prev.map((d) =>
          d.id === deviceId ? normalizeDevice({ ...d, ...updatedDevice }) : d,
        ),
      );
      setEditingDeviceId(null);
    } catch (err) {
      alert("Failed to update device: " + err.message);
    }
  };

  const handleChange = (e) =>
    setNewDeviceData({ ...newDeviceData, [e.target.name]: e.target.value });
  const handleEditChange = (e) =>
    setEditDeviceData({ ...editDeviceData, [e.target.name]: e.target.value });

  if (loading) return <div className="loading">Loading... ⏳</div>;
  if (!room) return <div className="error">Room not found!</div>;

  return (
    <div
      className="room-details-container"
      style={{ "--bg-image": `url(${room.image})` }}
    >
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
            <select
              name="name"
              value={newDeviceData.name}
              onChange={handleChange}
              className="add-device-input"
              required
            >
              <option value="" disabled>
                Select a device...
              </option>
              {DEVICE_OPTIONS.map((deviceName) => (
                <option key={deviceName} value={deviceName}>
                  {deviceName}
                </option>
              ))}
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
          devices.map((device) => {
            const monthlyAvg = monthlyAverages[device.id];
            const aiStatus = aiStates[device.id] || "Normal";
            const isAbnormal = aiStatus === "Anomaly";

            return (
              <div
                key={device.id}
                className="device-card"
                onClick={() => {
                  if (editingDeviceId !== device.id) {
                    setSelectedDeviceId(device.id);
                  }
                }}
                style={{
                  cursor: editingDeviceId === device.id ? "default" : "pointer",
                }}
              >
                {editingDeviceId === device.id ? (
                  <form
                    onSubmit={(e) => handleUpdateDevice(e, device.id)}
                    style={{ padding: "8px" }}
                  >
                    <h3 style={{ marginBottom: "10px" }}>Edit Device</h3>
                    <select
                      name="name"
                      value={editDeviceData.name}
                      onChange={handleEditChange}
                      className="add-device-input"
                      required
                    >
                      <option value="" disabled>
                        Select a device...
                      </option>
                      {DEVICE_OPTIONS.map((deviceName) => (
                        <option key={deviceName} value={deviceName}>
                          {deviceName}
                        </option>
                      ))}
                    </select>
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
                  <>
                    <div className="device-header">
                      <div className="device-title">
                        <span className="device-emoji">
                          {getDeviceIcon(device.name)}
                        </span>
                        <h3>{device.name || "Unknown Device"}</h3>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "6px",
                          alignItems: "center",
                        }}
                      >
                        <span
                          className={`ai-status-badge ${isAbnormal ? "ai-status-badge--anomaly" : "ai-status-badge--normal"}`}
                        >
                          {isAbnormal ? "⚠️ Anomaly" : "✅ Normal"}
                        </span>
                        <span
                          className={`status-badge ${device.status === "ON" ? "active" : "inactive"}`}
                        >
                          {device.status === "ON" ? "🟢 ON" : "🔴 OFF"}
                        </span>
                        <button
                          className="edit-device-btn"
                          onClick={(e) => handleStartEdit(e, device)}
                          title="Edit device"
                          type="button"
                        >
                          <Pencil size={16} />
                        </button>
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

                    <div className="device-readings-grid">
                      <div className="reading-item">
                        <span className="reading-label">⚡ Voltage</span>
                        <span className="reading-value">
                          {device.voltage || 0} V
                        </span>
                      </div>
                      <div className="reading-item">
                        <span className="reading-label">🔁 Current</span>
                        <span className="reading-value">
                          {device.current || 0} A
                        </span>
                      </div>
                      <div className="reading-item">
                        <span className="reading-label">💥 Power</span>
                        <span className="reading-value">
                          {device.power || 0} W
                        </span>
                      </div>
                      <div className="reading-item">
                        <span className="reading-label">🌡️ Temperature</span>
                        <span className="reading-value">
                          {device.temperature != null
                            ? `${device.temperature} °C`
                            : "N/A"}
                        </span>
                      </div>
                      <div className="reading-item">
                        <span className="reading-label">💧 Humidity</span>
                        <span className="reading-value">
                          {device.humidity != null
                            ? `${device.humidity} %`
                            : "N/A"}
                        </span>
                      </div>
                      <div className="reading-item">
                        <span className="reading-label">📅 Monthly Avg</span>
                        <span className="reading-value">
                          {monthlyAvg != null
                            ? `${Number(monthlyAvg).toFixed(1)} W`
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {selectedDeviceId &&
        (() => {
          const selectedDevice = devices.find((d) => d.id === selectedDeviceId);
          return selectedDevice ? (
            <DeviceDetailsModal
              device={selectedDevice}
              onClose={() => setSelectedDeviceId(null)}
            />
          ) : null;
        })()}
    </div>
  );
}
