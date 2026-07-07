// // 🔁 Toggle between json-server and real backend
// const USE_JSON_SERVER = false;

// const JSON_SERVER_BASE = "http://localhost:5000";
// const REAL_BACKEND_BASE = "http://64.225.101.222:5000";

// const BASE_URL = USE_JSON_SERVER ? JSON_SERVER_BASE : REAL_BACKEND_BASE;

// export const API_ENDPOINTS = {
//   // ================= Users =================
//   USERS: `${BASE_URL}/api/users`,
//   USER_BY_ID: (id) => `${BASE_URL}/api/users/${id}`,

//   // ================= Auth =================
//   LOGIN: USE_JSON_SERVER ? `${BASE_URL}/users` : `${BASE_URL}/api/auth/login`,
//   REGISTER: USE_JSON_SERVER
//     ? `${BASE_URL}/users`
//     : `${BASE_URL}/api/auth/register`,
//   UPDATE_USER: `${BASE_URL}/api/auth/me`,
//   DELETE_USER: `${BASE_URL}/api/auth/me`,

//   // ================= Rooms =================
//   ROOMS: `${BASE_URL}/api/rooms`,
//   ROOM_BY_ID: (id) => `${BASE_URL}/api/rooms/${id}`,

//   // ================= Devices =================
//   DEVICES: USE_JSON_SERVER
//     ? `${BASE_URL}/devices`
//     : `${BASE_URL}/api/devices/user`,
//   DEVICES_POST: USE_JSON_SERVER
//     ? `${BASE_URL}/devices`
//     : `${BASE_URL}/api/devices`,
//   DEVICE_BY_ID: (id) => `${BASE_URL}/api/devices/${id}`,
//   DEVICES_BY_ROOM: (roomId) =>
//     USE_JSON_SERVER
//       ? `${BASE_URL}/devices?roomId=${roomId}`
//       : `${BASE_URL}/api/devices/${roomId}`,
//   DEVICE_STATE: (id) =>
//     USE_JSON_SERVER
//       ? `${BASE_URL}/devices/${id}`
//       : `${BASE_URL}/api/devices/${id}/state`,
//   ALL_DEVICES_OFF: USE_JSON_SERVER
//     ? `${BASE_URL}/devices/all/off`
//     : `${BASE_URL}/api/devices/all/off`,

//   // ================= Readings =================
//   READINGS: `${BASE_URL}/api/readings`,
//   READING_BY_DEVICE: (deviceId) =>
//     `${BASE_URL}/api/readings/device/${deviceId}`,
//   DEVICE_WITH_LATEST_READING: (deviceId) =>
//     `${BASE_URL}/api/readings/${deviceId}`,

//   // ================= Stats =================
//   MONTHLY_STATS: `${BASE_URL}/api/stats/monthly`,
//   YEARLY_STATS: `${BASE_URL}/api/stats/yearly`,

//   // ================= Schedules =================
//   SCHEDULES: `${BASE_URL}/api/schedules`,
//   SCHEDULES_BY_DEVICE: (deviceId) =>
//     `${BASE_URL}/api/schedules/device/${deviceId}`,
//   SCHEDULE_BY_ID: (id) => `${BASE_URL}/api/schedules/${id}`,

//   // ================= AI Chat =================
//   CHAT: `${BASE_URL}/api/chat`,
// };

// // ================= AUTH FETCH =================
// export const fetchWithAuth = async (url, options = {}) => {
//   const token = localStorage.getItem("authToken");
//   const headers = { "Content-Type": "application/json", ...options.headers };
//   if (token && !USE_JSON_SERVER) headers.Authorization = `Bearer ${token}`;
//   return fetch(url, { ...options, headers });
// };

// // ================= NORMALIZE DEVICE =================
// export const normalizeDevice = (device) => ({
//   id: device._id || device.id,
//   name: device.name,
//   roomId: device.roomId,
//   userId: device.userId,
//   status: device.state ? device.state.toUpperCase() : "OFF",
//   voltage: device.latestReading?.voltage || 0,
//   current: device.latestReading?.current || 0,
//   power: device.latestReading?.power || 0,
//   temperature: device.latestReading?.temperature ?? null,
//   humidity: device.latestReading?.humidity ?? null,
//   monthlyAverage: device.monthlyAverage ?? null,
//   yearlyAverage: device.yearlyAverage ?? null,
//   image: device.image || null,
// });

// // ================= NORMALIZE ROOM =================
// export const normalizeRoom = (room) => ({
//   id: room._id || room.id,
//   name: room.name,
//   userId: room.userId,
//   image: room.image || "https://via.placeholder.com/300",
//   iconType: getRoomIconType(room.name),
// });

// const getRoomIconType = (name) => {
//   const n = name.toLowerCase();
//   if (n.includes("living")) return "living";
//   if (n.includes("bed")) return "bedroom";
//   if (n.includes("kitchen")) return "kitchen";
//   if (n.includes("bath")) return "bathroom";
//   if (n.includes("garage")) return "garage";
//   return "default";
// };

// // ================= AUTH HELPERS =================
// export const apiHelpers = {
//   login: async (email, password) => {
//     const response = await fetch(API_ENDPOINTS.LOGIN, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email, password }),
//     });
//     const data = await response.json();
//     if (response.ok) {
//       localStorage.setItem("authToken", data.token);
//       return {
//         ok: true,
//         data: {
//           token: data.token,
//           user: {
//             id: data.user._id || data.user.id,
//             name: data.user.name,
//             email: data.user.email,
//           },
//         },
//       };
//     }
//     return { ok: false, error: data.message || "Login failed" };
//   },

//   register: async (userData) => {
//     const response = await fetch(API_ENDPOINTS.REGISTER, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         name: userData.name || `${userData.firstname} ${userData.lastname}`,
//         email: userData.email,
//         password: userData.password,
//       }),
//     });
//     const data = await response.json();
//     if (response.ok)
//       return { ok: true, data: { userId: data.userId, message: data.message } };
//     return { ok: false, error: data.message || "Registration failed" };
//   },
// };

// export { USE_JSON_SERVER };
// export default API_ENDPOINTS;

// 🔁 Toggle between json-server and real backend
const USE_JSON_SERVER = false;

const JSON_SERVER_BASE = "http://localhost:5000";
const REAL_BACKEND_BASE = "http://64.225.101.222:5000";

const BASE_URL = USE_JSON_SERVER ? JSON_SERVER_BASE : REAL_BACKEND_BASE;

export const API_ENDPOINTS = {
  // ================= Users =================
  USERS: `${BASE_URL}/api/users`,
  USER_BY_ID: (id) => `${BASE_URL}/api/users/${id}`,

  // ================= Auth =================
  LOGIN: USE_JSON_SERVER ? `${BASE_URL}/users` : `${BASE_URL}/api/auth/login`,
  REGISTER: USE_JSON_SERVER
    ? `${BASE_URL}/users`
    : `${BASE_URL}/api/auth/register`,
  UPDATE_USER: `${BASE_URL}/api/auth/me`,
  DELETE_USER: `${BASE_URL}/api/auth/me`,

  // ================= Rooms =================
  ROOMS: `${BASE_URL}/api/rooms`,
  ROOM_BY_ID: (id) => `${BASE_URL}/api/rooms/${id}`,

  // ================= Devices =================
  DEVICES: USE_JSON_SERVER
    ? `${BASE_URL}/devices`
    : `${BASE_URL}/api/devices/user`,
  DEVICES_POST: USE_JSON_SERVER
    ? `${BASE_URL}/devices`
    : `${BASE_URL}/api/devices`,
  DEVICE_BY_ID: (id) => `${BASE_URL}/api/devices/${id}`,
  DEVICES_BY_ROOM: (roomId) =>
    USE_JSON_SERVER
      ? `${BASE_URL}/devices?roomId=${roomId}`
      : `${BASE_URL}/api/devices/${roomId}`,
  DEVICE_STATE: (id) =>
    USE_JSON_SERVER
      ? `${BASE_URL}/devices/${id}`
      : `${BASE_URL}/api/devices/${id}/state`,
  ALL_DEVICES_OFF: USE_JSON_SERVER
    ? `${BASE_URL}/devices/all/off`
    : `${BASE_URL}/api/devices/all/off`,

  // ================= Readings =================
  READINGS: `${BASE_URL}/api/readings`,
  // `params` is optional so every existing call site keeps working exactly
  // as before. Pass { from, to, limit } (any subset) to scope the request —
  // e.g. READING_BY_DEVICE(id, { from: isoStart, to: isoEnd }) for a
  // specific time range instead of the device's entire reading history.
  // Requires the backend route to read and honor these query params.
  READING_BY_DEVICE: (deviceId, params = {}) => {
    const base = `${BASE_URL}/api/readings/device/${deviceId}`;
    const query = new URLSearchParams();
    if (params.from) query.set("from", params.from);
    if (params.to) query.set("to", params.to);
    if (params.limit) query.set("limit", params.limit);
    const qs = query.toString();
    return qs ? `${base}?${qs}` : base;
  },
  DEVICE_WITH_LATEST_READING: (deviceId) =>
    `${BASE_URL}/api/readings/${deviceId}`,

  // ================= Stats =================
  MONTHLY_STATS: `${BASE_URL}/api/stats/monthly`,
  YEARLY_STATS: `${BASE_URL}/api/stats/yearly`,

  // ================= Schedules =================
  SCHEDULES: `${BASE_URL}/api/schedules`,
  SCHEDULES_BY_DEVICE: (deviceId) =>
    `${BASE_URL}/api/schedules/device/${deviceId}`,
  SCHEDULE_BY_ID: (id) => `${BASE_URL}/api/schedules/${id}`,

  // ================= AI Chat =================
  CHAT: `${BASE_URL}/api/chat`,
};

// ================= AUTH FETCH =================
export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem("authToken");
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token && !USE_JSON_SERVER) headers.Authorization = `Bearer ${token}`;
  return fetch(url, { ...options, headers });
};

// ================= NORMALIZE DEVICE =================
export const normalizeDevice = (device) => ({
  id: device._id || device.id,
  name: device.name,
  roomId: device.roomId,
  userId: device.userId,
  status: device.state ? device.state.toUpperCase() : "OFF",
  voltage: device.latestReading?.voltage || 0,
  current: device.latestReading?.current || 0,
  power: device.latestReading?.power || 0,
  temperature: device.latestReading?.temperature ?? null,
  humidity: device.latestReading?.humidity ?? null,
  monthlyAverage: device.monthlyAverage ?? null,
  yearlyAverage: device.yearlyAverage ?? null,
  image: device.image || null,
});

// ================= NORMALIZE ROOM =================
export const normalizeRoom = (room) => ({
  id: room._id || room.id,
  name: room.name,
  userId: room.userId,
  image: room.image || "https://via.placeholder.com/300",
  iconType: getRoomIconType(room.name),
});

const getRoomIconType = (name) => {
  const n = name.toLowerCase();
  if (n.includes("living")) return "living";
  if (n.includes("bed")) return "bedroom";
  if (n.includes("kitchen")) return "kitchen";
  if (n.includes("bath")) return "bathroom";
  if (n.includes("garage")) return "garage";
  return "default";
};

// ================= AUTH HELPERS =================
export const apiHelpers = {
  login: async (email, password) => {
    const response = await fetch(API_ENDPOINTS.LOGIN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("authToken", data.token);
      return {
        ok: true,
        data: {
          token: data.token,
          user: {
            id: data.user._id || data.user.id,
            name: data.user.name,
            email: data.user.email,
          },
        },
      };
    }
    return { ok: false, error: data.message || "Login failed" };
  },

  register: async (userData) => {
    const response = await fetch(API_ENDPOINTS.REGISTER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: userData.name || `${userData.firstname} ${userData.lastname}`,
        email: userData.email,
        password: userData.password,
      }),
    });
    const data = await response.json();
    if (response.ok)
      return { ok: true, data: { userId: data.userId, message: data.message } };
    return { ok: false, error: data.message || "Registration failed" };
  },
};

export { USE_JSON_SERVER };
export default API_ENDPOINTS;
