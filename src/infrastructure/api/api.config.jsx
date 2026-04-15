// // 🔥 Toggle between json-server and the real backend
// const USE_JSON_SERVER = false; // true = json-server, false = real backend

// const JSON_SERVER_BASE = "http://localhost:5000";
// const REAL_BACKEND_BASE = "http://localhost:4000/api";

// const BASE_URL = USE_JSON_SERVER ? JSON_SERVER_BASE : REAL_BACKEND_BASE;

// export const API_ENDPOINTS = {
//   // Users
//   USERS: `${BASE_URL}/users`,
//   USER_BY_ID: (id) => `${BASE_URL}/users/${id}`,

//   // Auth (different for real backend)
//   LOGIN: USE_JSON_SERVER
//     ? `${BASE_URL}/users`
//     : `${REAL_BACKEND_BASE}/auth/login`,
//   REGISTER: USE_JSON_SERVER
//     ? `${BASE_URL}/users`
//     : `${REAL_BACKEND_BASE}/auth/register`,
//   UPDATE_USER: USE_JSON_SERVER ? null : `${REAL_BACKEND_BASE}/auth/me`,
//   DELETE_USER: USE_JSON_SERVER ? null : `${REAL_BACKEND_BASE}/auth/me`,

//   // Rooms
//   ROOMS: `${BASE_URL}/rooms`,
//   ROOM_BY_ID: (id) => `${BASE_URL}/rooms/${id}`,

//   // Devices
//   DEVICES: `${BASE_URL}/devices`,
//   DEVICE_BY_ID: (id) => `${BASE_URL}/devices/${id}`,
//   DEVICES_BY_ROOM: (roomId) =>
//     USE_JSON_SERVER
//       ? `${BASE_URL}/devices?roomId=${roomId}`
//       : `${REAL_BACKEND_BASE}/devices/${roomId}`,
//   DEVICE_STATE: (id) =>
//     USE_JSON_SERVER
//       ? `${BASE_URL}/devices/${id}`
//       : `${REAL_BACKEND_BASE}/devices/${id}/state`,

//   // Readings (only for real backend)
//   READINGS: USE_JSON_SERVER ? null : `${REAL_BACKEND_BASE}/readings`,
//   READING_BY_DEVICE: (deviceId) =>
//     USE_JSON_SERVER ? null : `${REAL_BACKEND_BASE}/readings/${deviceId}`,
// };

// // 🔥 Helper for Authorization (works with both)
// export const fetchWithAuth = async (url, options = {}) => {
//   const token = localStorage.getItem("authToken");

//   const headers = {
//     "Content-Type": "application/json",
//     ...options.headers,
//   };

//   // Add Authorization header only for the real backend
//   if (token && !USE_JSON_SERVER) {
//     headers.Authorization = `Bearer ${token}`;
//   }

//   return fetch(url, {
//     ...options,
//     headers,
//   });
// };

// // 🔥 Helper to convert backend response to the frontend structure
// export const normalizeDevice = (device) => {
//   // If coming from the real backend (uses _id)
//   if (device._id) {
//     return {
//       id: device._id,
//       name: device.name,
//       roomId: device.roomId,
//       userId: device.userId,
//       status: device.state ? device.state.toUpperCase() : "OFF",
//       voltage: device.latestReading?.voltage || 0,
//       current: device.latestReading?.current || 0,
//       power: device.latestReading?.power || 0,
//       yearlyAverage: device.yearlyAverage || 0,
//       image: device.image || null,
//     };
//   }

//   // If coming from JSON Server (uses id)
//   return {
//     id: device.id,
//     name: device.name,
//     roomId: device.roomId,
//     userId: device.userId,
//     status: device.state ? device.state.toUpperCase() : "OFF",
//     voltage: device.latestReading?.voltage || 0,
//     current: device.latestReading?.current || 0,
//     power: device.latestReading?.power || 0,
//     yearlyAverage: device.yearlyAverage || 0,
//     image: device.image || null,
//   };
// };

// // 🔥 Helper to normalize room response
// export const normalizeRoom = (room) => {
//   // If coming from Real Backend (_id)
//   if (room._id) {
//     return {
//       id: room._id,
//       name: room.name,
//       userId: room.userId,
//       image: room.image || "https://via.placeholder.com/300",
//       iconType: getRoomIconType(room.name),
//     };
//   }

//   // If coming from JSON Server (id)
//   return {
//     id: room.id,
//     name: room.name,
//     userId: room.userId,
//     image: room.image || "https://via.placeholder.com/300",
//     iconType: getRoomIconType(room.name),
//   };
// };

// // 🔥 Helper to determine icon type from room name
// const getRoomIconType = (name) => {
//   const nameLower = name.toLowerCase();
//   if (nameLower.includes("living")) return "living";
//   if (nameLower.includes("bedroom") || nameLower.includes("bed"))
//     return "bedroom";
//   if (nameLower.includes("kitchen")) return "kitchen";
//   if (nameLower.includes("bathroom") || nameLower.includes("bath"))
//     return "bathroom";
//   if (nameLower.includes("garage")) return "garage";
//   return "default";
// };

// // 🔥 Helper functions for Authentication
// export const apiHelpers = {
//   // Login
//   login: async (email, password) => {
//     if (USE_JSON_SERVER) {
//       const response = await fetch(`${API_ENDPOINTS.USERS}?email=${email}`);
//       const users = await response.json();

//       const user = users.find(
//         (u) => u.email === email && u.password === password,
//       );

//       if (user) {
//         const fakeToken = `fake-jwt-token-${user.id}`;
//         return {
//           ok: true,
//           data: {
//             token: fakeToken,
//             user: {
//               id: user.id,
//               name: user.name,
//               email: user.email,
//             },
//           },
//         };
//       } else {
//         return {
//           ok: false,
//           error: "Invalid email or password",
//         };
//       }
//     } else {
//       const response = await fetch(API_ENDPOINTS.LOGIN, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         return {
//           ok: true,
//           data: {
//             token: data.token,
//             user: {
//               id: data.user._id || data.user.id,
//               name: data.user.name,
//               email: data.user.email,
//             },
//           },
//         };
//       } else {
//         return {
//           ok: false,
//           error: data.message || "Login failed",
//         };
//       }
//     }
//   },

//   // Register
//   register: async (userData) => {
//     if (USE_JSON_SERVER) {
//       const checkResponse = await fetch(
//         `${API_ENDPOINTS.USERS}?email=${userData.email}`,
//       );
//       const existingUsers = await checkResponse.json();

//       if (existingUsers.length > 0) {
//         return {
//           ok: false,
//           error: "Email already exists",
//         };
//       }

//       const response = await fetch(API_ENDPOINTS.USERS, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           name: userData.name || `${userData.firstname} ${userData.lastname}`,
//           email: userData.email,
//           password: userData.password,
//         }),
//       });

//       const newUser = await response.json();
//       const fakeToken = `fake-jwt-token-${newUser.id}`;

//       return {
//         ok: true,
//         data: {
//           token: fakeToken,
//           user: {
//             id: newUser.id,
//             name: newUser.name,
//             email: newUser.email,
//           },
//         },
//       };
//     } else {
//       const response = await fetch(API_ENDPOINTS.REGISTER, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           name: userData.name || `${userData.firstname} ${userData.lastname}`,
//           email: userData.email,
//           password: userData.password,
//         }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         return {
//           ok: true,
//           data: {
//             token: data.token,
//             user: {
//               id: data.user._id || data.user.id,
//               name: data.user.name,
//               email: data.user.email,
//             },
//           },
//         };
//       } else {
//         return {
//           ok: false,
//           error: data.message || "Registration failed",
//         };
//       }
//     }
//   },
// };

// export { USE_JSON_SERVER };
// export default API_ENDPOINTS;

// Toggle between json-server and the real backend
// const USE_JSON_SERVER = false; // true = json-server, false = real backend

// const JSON_SERVER_BASE = "http://localhost:5000";
// const REAL_BACKEND_BASE = "http://64.225.101.222:5000";

// const BASE_URL = USE_JSON_SERVER ? JSON_SERVER_BASE : REAL_BACKEND_BASE;

// export const API_ENDPOINTS = {
//   // Users
//   USERS: `${BASE_URL}/users`,
//   USER_BY_ID: (id) => `${BASE_URL}/users/${id}`,

//   // Auth
//   LOGIN: USE_JSON_SERVER
//     ? `${BASE_URL}/users`
//     : `${REAL_BACKEND_BASE}/auth/login`,
//   REGISTER: USE_JSON_SERVER
//     ? `${BASE_URL}/users`
//     : `${REAL_BACKEND_BASE}/auth/register`,
//   UPDATE_USER: USE_JSON_SERVER ? null : `${REAL_BACKEND_BASE}/auth/me`,
//   DELETE_USER: USE_JSON_SERVER ? null : `${REAL_BACKEND_BASE}/auth/me`,

//   // Rooms
//   ROOMS: `${BASE_URL}/rooms`,
//   ROOM_BY_ID: (id) => `${BASE_URL}/rooms/${id}`,

//   // Devices
//   DEVICES: `${BASE_URL}/devices`,
//   DEVICE_BY_ID: (id) => `${BASE_URL}/devices/${id}`,
//   DEVICES_BY_ROOM: (roomId) =>
//     USE_JSON_SERVER
//       ? `${BASE_URL}/devices?roomId=${roomId}`
//       : `${REAL_BACKEND_BASE}/devices/room/${roomId}`,
//   DEVICE_STATE: (id) =>
//     USE_JSON_SERVER
//       ? `${BASE_URL}/devices/${id}`
//       : `${REAL_BACKEND_BASE}/devices/${id}/state`,

//   // Readings
//   READINGS: USE_JSON_SERVER ? null : `${REAL_BACKEND_BASE}/readings`,

//   // GET /readings/device/:deviceId → getDeviceReadings
//   READING_BY_DEVICE: (deviceId) =>
//     USE_JSON_SERVER ? null : `${REAL_BACKEND_BASE}/readings/device/${deviceId}`,

//   // GET /readings/:deviceId → getDeviceWithLatestReading
//   DEVICE_WITH_LATEST_READING: (deviceId) =>
//     USE_JSON_SERVER ? null : `${REAL_BACKEND_BASE}/readings/${deviceId}`,

//   // Stats
//   MONTHLY_STATS: USE_JSON_SERVER ? null : `${BASE_URL}/stats/monthly`,
//   YEARLY_STATS: USE_JSON_SERVER ? null : `${BASE_URL}/stats/yearly`,
// };

// // Helper for Authorization
// export const fetchWithAuth = async (url, options = {}) => {
//   const token = localStorage.getItem("authToken");

//   const headers = {
//     "Content-Type": "application/json",
//     ...options.headers,
//   };

//   if (token && !USE_JSON_SERVER) {
//     headers.Authorization = `Bearer ${token}`;
//   }

//   return fetch(url, {
//     ...options,
//     headers,
//   });
// };

// // Normalize device from backend response
// export const normalizeDevice = (device) => {
//   if (device._id) {
//     return {
//       id: device._id,
//       name: device.name,
//       roomId: device.roomId,
//       userId: device.userId,
//       status: device.state ? device.state.toUpperCase() : "OFF",
//       voltage: device.latestReading?.voltage || 0,
//       current: device.latestReading?.current || 0,
//       power: device.latestReading?.power || 0,
//       yearlyAverage: device.yearlyAverage || 0,
//       image: device.image || null,
//     };
//   }

//   return {
//     id: device.id,
//     name: device.name,
//     roomId: device.roomId,
//     userId: device.userId,
//     status: device.state ? device.state.toUpperCase() : "OFF",
//     voltage: device.latestReading?.voltage || 0,
//     current: device.latestReading?.current || 0,
//     power: device.latestReading?.power || 0,
//     yearlyAverage: device.yearlyAverage || 0,
//     image: device.image || null,
//   };
// };

// // Normalize room
// export const normalizeRoom = (room) => {
//   if (room._id) {
//     return {
//       id: room._id,
//       name: room.name,
//       userId: room.userId,
//       image: room.image || "https://via.placeholder.com/300",
//       iconType: getRoomIconType(room.name),
//     };
//   }

//   return {
//     id: room.id,
//     name: room.name,
//     userId: room.userId,
//     image: room.image || "https://via.placeholder.com/300",
//     iconType: getRoomIconType(room.name),
//   };
// };

// const getRoomIconType = (name) => {
//   const nameLower = name.toLowerCase();
//   if (nameLower.includes("living")) return "living";
//   if (nameLower.includes("bedroom") || nameLower.includes("bed"))
//     return "bedroom";
//   if (nameLower.includes("kitchen")) return "kitchen";
//   if (nameLower.includes("bathroom") || nameLower.includes("bath"))
//     return "bathroom";
//   if (nameLower.includes("garage")) return "garage";
//   return "default";
// };

// // Auth helpers
// export const apiHelpers = {
//   login: async (email, password) => {
//     if (USE_JSON_SERVER) {
//       const response = await fetch(`${API_ENDPOINTS.USERS}?email=${email}`);
//       const users = await response.json();
//       const user = users.find(
//         (u) => u.email === email && u.password === password,
//       );

//       if (user) {
//         const fakeToken = `fake-jwt-token-${user.id}`;
//         return {
//           ok: true,
//           data: {
//             token: fakeToken,
//             user: { id: user.id, name: user.name, email: user.email },
//           },
//         };
//       } else {
//         return { ok: false, error: "Invalid email or password" };
//       }
//     } else {
//       const response = await fetch(API_ENDPOINTS.LOGIN, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         return {
//           ok: true,
//           data: {
//             token: data.token,
//             user: {
//               id: data.user._id || data.user.id,
//               name: data.user.name,
//               email: data.user.email,
//             },
//           },
//         };
//       } else {
//         return { ok: false, error: data.message || "Login failed" };
//       }
//     }
//   },

//   register: async (userData) => {
//     if (USE_JSON_SERVER) {
//       const checkResponse = await fetch(
//         `${API_ENDPOINTS.USERS}?email=${userData.email}`,
//       );
//       const existingUsers = await checkResponse.json();

//       if (existingUsers.length > 0) {
//         return { ok: false, error: "Email already exists" };
//       }

//       const response = await fetch(API_ENDPOINTS.USERS, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           name: userData.name || `${userData.firstname} ${userData.lastname}`,
//           email: userData.email,
//           password: userData.password,
//         }),
//       });

//       const newUser = await response.json();
//       const fakeToken = `fake-jwt-token-${newUser.id}`;

//       return {
//         ok: true,
//         data: {
//           token: fakeToken,
//           user: { id: newUser.id, name: newUser.name, email: newUser.email },
//         },
//       };
//     } else {
//       const response = await fetch(API_ENDPOINTS.REGISTER, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           name: userData.name || `${userData.firstname} ${userData.lastname}`,
//           email: userData.email,
//           password: userData.password,
//         }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         return {
//           ok: true,
//           data: {
//             token: data.token,
//             user: {
//               id: data.user._id || data.user.id,
//               name: data.user.name,
//               email: data.user.email,
//             },
//           },
//         };
//       } else {
//         return { ok: false, error: data.message || "Registration failed" };
//       }
//     }
//   },
// };

// export { USE_JSON_SERVER };
// export default API_ENDPOINTS;

// // 🔁 Toggle between json-server and real backend
// const USE_JSON_SERVER = false;

// const JSON_SERVER_BASE = "http://localhost:5000";
// const REAL_BACKEND_BASE = "http://64.225.101.222:5000";

// const BASE_URL = USE_JSON_SERVER ? JSON_SERVER_BASE : REAL_BACKEND_BASE;

// // ================= API ENDPOINTS =================
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
//   DEVICES: `${BASE_URL}/api/devices`,
//   DEVICE_BY_ID: (id) => `${BASE_URL}/api/devices/${id}`,

//   DEVICES_BY_ROOM: (roomId) =>
//     USE_JSON_SERVER
//       ? `${BASE_URL}/devices?roomId=${roomId}`
//       : `${BASE_URL}/api/devices/room/${roomId}`,

//   DEVICE_STATE: (id) =>
//     USE_JSON_SERVER
//       ? `${BASE_URL}/devices/${id}`
//       : `${BASE_URL}/api/devices/${id}/state`,

//   // ================= Readings =================
//   READINGS: `${BASE_URL}/api/readings`,

//   READING_BY_DEVICE: (deviceId) =>
//     `${BASE_URL}/api/readings/device/${deviceId}`,

//   DEVICE_WITH_LATEST_READING: (deviceId) =>
//     `${BASE_URL}/api/readings/${deviceId}`,

//   // ================= Stats =================
//   MONTHLY_STATS: `${BASE_URL}/api/stats/monthly`,
//   YEARLY_STATS: `${BASE_URL}/api/stats/yearly`,
// };

// // ================= AUTH FETCH =================
// export const fetchWithAuth = async (url, options = {}) => {
//   const token = localStorage.getItem("authToken");

//   const headers = {
//     "Content-Type": "application/json",
//     ...options.headers,
//   };

//   if (token && !USE_JSON_SERVER) {
//     headers.Authorization = `Bearer ${token}`;
//   }

//   return fetch(url, {
//     ...options,
//     headers,
//   });
// };

// // ================= NORMALIZE DEVICE =================
// export const normalizeDevice = (device) => {
//   return {
//     id: device._id || device.id,
//     name: device.name,
//     roomId: device.roomId,
//     userId: device.userId,
//     status: device.state ? device.state.toUpperCase() : "OFF",
//     voltage: device.latestReading?.voltage || 0,
//     current: device.latestReading?.current || 0,
//     power: device.latestReading?.power || 0,
//     yearlyAverage: device.yearlyAverage || 0,
//     image: device.image || null,
//   };
// };

// // ================= NORMALIZE ROOM =================
// export const normalizeRoom = (room) => {
//   return {
//     id: room._id || room.id,
//     name: room.name,
//     userId: room.userId,
//     image: room.image || "https://via.placeholder.com/300",
//     iconType: getRoomIconType(room.name),
//   };
// };

// // ================= ROOM ICON =================
// const getRoomIconType = (name) => {
//   const nameLower = name.toLowerCase();

//   if (nameLower.includes("living")) return "living";
//   if (nameLower.includes("bed")) return "bedroom";
//   if (nameLower.includes("kitchen")) return "kitchen";
//   if (nameLower.includes("bath")) return "bathroom";
//   if (nameLower.includes("garage")) return "garage";

//   return "default";
// };

// // ================= AUTH HELPERS =================
// export const apiHelpers = {
//   login: async (email, password) => {
//     const response = await fetch(API_ENDPOINTS.LOGIN, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ email, password }),
//     });

//     const data = await response.json();

//     if (response.ok) {
//       // 🔥 أهم خطوة
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
//     } else {
//       return {
//         ok: false,
//         error: data.message || "Login failed",
//       };
//     }
//   },

//   register: async (userData) => {
//     const response = await fetch(API_ENDPOINTS.REGISTER, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         name: userData.name || `${userData.firstname} ${userData.lastname}`,
//         email: userData.email,
//         password: userData.password,
//       }),
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
//     } else {
//       return {
//         ok: false,
//         error: data.message || "Registration failed",
//       };
//     }
//   },
// };

// export { USE_JSON_SERVER };
// export default API_ENDPOINTS;

//from folder fixed files
// 🔁 Toggle between json-server and real backend
const USE_JSON_SERVER = false;

const JSON_SERVER_BASE = "http://localhost:5000";
const REAL_BACKEND_BASE = "http://64.225.101.222:5000";

const BASE_URL = USE_JSON_SERVER ? JSON_SERVER_BASE : REAL_BACKEND_BASE;

// ================= API ENDPOINTS =================
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
  // ✅ GET all user devices — used in LiveReadings & HomePage
  DEVICES: USE_JSON_SERVER
    ? `${BASE_URL}/devices`
    : `${BASE_URL}/api/devices/user`,

  // ✅ POST new device — used in RoomDetails Add Device
  DEVICES_POST: USE_JSON_SERVER
    ? `${BASE_URL}/devices`
    : `${BASE_URL}/api/devices`,

  DEVICE_BY_ID: (id) => `${BASE_URL}/api/devices/${id}`,

  // ✅ GET devices by room — used in RoomDetails fetch
  DEVICES_BY_ROOM: (roomId) =>
    USE_JSON_SERVER
      ? `${BASE_URL}/devices?roomId=${roomId}`
      : `${BASE_URL}/api/devices/${roomId}`,

  DEVICE_STATE: (id) =>
    USE_JSON_SERVER
      ? `${BASE_URL}/devices/${id}`
      : `${BASE_URL}/api/devices/${id}/state`,

  // ================= Readings =================
  READINGS: `${BASE_URL}/api/readings`,

  READING_BY_DEVICE: (deviceId) =>
    `${BASE_URL}/api/readings/device/${deviceId}`,

  DEVICE_WITH_LATEST_READING: (deviceId) =>
    `${BASE_URL}/api/readings/${deviceId}`,

  // ================= Stats =================
  MONTHLY_STATS: `${BASE_URL}/api/stats/monthly`,
  YEARLY_STATS: `${BASE_URL}/api/stats/yearly`,
};

// ================= AUTH FETCH =================
export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem("authToken");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token && !USE_JSON_SERVER) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
};

// ================= NORMALIZE DEVICE =================
export const normalizeDevice = (device) => {
  return {
    id: device._id || device.id,
    name: device.name,
    roomId: device.roomId,
    userId: device.userId,
    status: device.state ? device.state.toUpperCase() : "OFF",
    voltage: device.latestReading?.voltage || 0,
    current: device.latestReading?.current || 0,
    power: device.latestReading?.power || 0,
    yearlyAverage: device.yearlyAverage || 0,
    image: device.image || null,
  };
};

// ================= NORMALIZE ROOM =================
export const normalizeRoom = (room) => {
  return {
    id: room._id || room.id,
    name: room.name,
    userId: room.userId,
    image: room.image || "https://via.placeholder.com/300",
    iconType: getRoomIconType(room.name),
  };
};

// ================= ROOM ICON =================
const getRoomIconType = (name) => {
  const nameLower = name.toLowerCase();

  if (nameLower.includes("living")) return "living";
  if (nameLower.includes("bed")) return "bedroom";
  if (nameLower.includes("kitchen")) return "kitchen";
  if (nameLower.includes("bath")) return "bathroom";
  if (nameLower.includes("garage")) return "garage";

  return "default";
};

// ================= AUTH HELPERS =================
export const apiHelpers = {
  login: async (email, password) => {
    const response = await fetch(API_ENDPOINTS.LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
    } else {
      return {
        ok: false,
        error: data.message || "Login failed",
      };
    }
  },

  register: async (userData) => {
    const response = await fetch(API_ENDPOINTS.REGISTER, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: userData.name || `${userData.firstname} ${userData.lastname}`,
        email: userData.email,
        password: userData.password,
      }),
    });

    const data = await response.json();

    // ✅ Backend returns { message: "User created", userId: "..." } — no token
    if (response.ok) {
      return {
        ok: true,
        data: {
          userId: data.userId,
          message: data.message,
        },
      };
    } else {
      return {
        ok: false,
        error: data.message || "Registration failed",
      };
    }
  },
};

export { USE_JSON_SERVER };
export default API_ENDPOINTS;
