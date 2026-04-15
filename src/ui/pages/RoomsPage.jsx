// // import React, { useState, useEffect, useCallback } from "react";
// // import { Link } from "react-router-dom";
// // import "../styles/RoomPage.css";
// // import {
// //   LampCeiling,
// //   Bed,
// //   Bath,
// //   CookingPot,
// //   PlusCircle,
// //   X,
// // } from "lucide-react";
// // import { useAuth } from "../../application/auth/AuthContext";
// // import API_ENDPOINTS, {
// //   fetchWithAuth,
// //   normalizeRoom,
// //   USE_JSON_SERVER,
// // } from "../../infrastructure/api/api.config";

// // const roomIcons = {
// //   living: <LampCeiling size={32} />,
// //   bedroom: <Bed size={32} />,
// //   kitchen: <CookingPot size={32} />,
// //   bathroom: <Bath size={32} />,
// //   garage: <LampCeiling size={32} />,
// //   default: <LampCeiling size={32} />,
// // };

// // export default function RoomsPage() {
// //   const [rooms, setRooms] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [isAdding, setIsAdding] = useState(false);
// //   const [newRoomData, setNewRoomData] = useState({
// //     name: "",
// //     image: "https://via.placeholder.com/300",
// //   });
// //   const { user } = useAuth();

// //   useEffect(() => {
// //     if (user) {
// //       fetchRooms();
// //     }
// //   }, [user]);

// //   const fetchRooms = async () => {
// //     try {
// //       const response = await fetchWithAuth(API_ENDPOINTS.ROOMS);
// //       if (!response.ok) throw new Error("Failed to fetch rooms");
// //       const data = await response.json();

// //       const userRooms = USE_JSON_SERVER
// //         ? data.filter((room) => room.userId === user.id)
// //         : data;

// //       const normalizedRooms = userRooms.map(normalizeRoom);
// //       setRooms(normalizedRooms);
// //       setLoading(false);
// //     } catch (err) {
// //       console.error("Error fetching rooms:", err);
// //       setLoading(false);
// //     }
// //   };

// //   const handleAddRoom = useCallback(
// //     async (e) => {
// //       e.preventDefault();

// //       if (!newRoomData.name) {
// //         alert("Please enter room name.");
// //         return;
// //       }

// //       const roomPayload = USE_JSON_SERVER
// //         ? {
// //             name: newRoomData.name,
// //             userId: user.id,
// //             image: newRoomData.image || "https://via.placeholder.com/300",
// //           }
// //         : {
// //             name: newRoomData.name,
// //           };

// //       try {
// //         const response = await fetchWithAuth(API_ENDPOINTS.ROOMS, {
// //           method: "POST",
// //           body: JSON.stringify(roomPayload),
// //         });

// //         if (!response.ok) throw new Error("Failed to add room");

// //         const addedRoom = await response.json();

// //         const normalizedRoom = normalizeRoom({
// //           ...addedRoom,
// //           userId: user.id,
// //           image: newRoomData.image || addedRoom.image,
// //         });

// //         setRooms((prev) => [...prev, normalizedRoom]);
// //         setNewRoomData({ name: "", image: "https://via.placeholder.com/300" });
// //         setIsAdding(false);
// //       } catch (err) {
// //         console.error("Error adding room:", err);
// //         alert("Failed to add room. Please try again.");
// //       }
// //     },
// //     [newRoomData, user],
// //   );

// //   const handleDeleteRoom = async (roomId) => {
// //     if (!window.confirm("Are you sure you want to delete this room?")) return;

// //     try {
// //       const response = await fetchWithAuth(API_ENDPOINTS.ROOM_BY_ID(roomId), {
// //         method: "DELETE",
// //       });

// //       if (!response.ok) throw new Error("Failed to delete room");

// //       setRooms((prev) => prev.filter((room) => room.id !== roomId));
// //     } catch (err) {
// //       console.error("Error deleting room:", err);
// //       alert("Failed to delete room. Please try again.");
// //     }
// //   };

// //   const handleChange = (e) => {
// //     setNewRoomData({ ...newRoomData, [e.target.name]: e.target.value });
// //   };

// //   if (loading) {
// //     return (
// //       <div className="rooms-page-container">
// //         <div style={{ textAlign: "center", padding: "50px", color: "white" }}>
// //           Loading rooms... ⏳
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="rooms-page-container">
// //       <div className="rooms-header">
// //         <h1 style={{ color: "white" }}>Your Rooms ({rooms.length})</h1>

// //         <button className="add-room-button" onClick={() => setIsAdding(true)}>
// //           <PlusCircle size={24} /> <span>Add New Room</span>
// //         </button>
// //       </div>

// //       {isAdding && (
// //         <div className="add-room-form-container">
// //           <form onSubmit={handleAddRoom} className="add-room-form">
// //             <input
// //               type="text"
// //               name="name"
// //               value={newRoomData.name}
// //               onChange={handleChange}
// //               placeholder="Room Name (e.g., Guest Room, Living Room)"
// //               required
// //             />
// //             <input
// //               type="url"
// //               name="image"
// //               value={newRoomData.image}
// //               onChange={handleChange}
// //               placeholder="Image URL (optional)"
// //             />

// //             <div className="form-buttons">
// //               <button type="submit" className="form-submit-btn">
// //                 Add Room
// //               </button>
// //               <button
// //                 type="button"
// //                 className="form-cancel-btn"
// //                 onClick={() => {
// //                   setIsAdding(false);
// //                   setNewRoomData({
// //                     name: "",
// //                     image: "https://via.placeholder.com/300",
// //                   });
// //                 }}
// //               >
// //                 Cancel
// //               </button>
// //             </div>
// //           </form>
// //         </div>
// //       )}

// //       <div className="rooms-grid">
// //         {rooms.map((room) => (
// //           <div key={room.id} className="room-card-wrapper">
// //             <Link
// //               to={`/rooms/${room.id}`}
// //               state={{ room }}
// //               className="room-card-link"
// //             >
// //               <div className="room-image-container">
// //                 <img
// //                   src={room.image}
// //                   alt={room.name}
// //                   className="w-full h-full object-cover"
// //                 />
// //               </div>

// //               <div className="room-info-section">
// //                 <h2>{room.name}</h2>
// //                 <span>{roomIcons[room.iconType] || roomIcons.default}</span>
// //               </div>
// //             </Link>

// //             <button
// //               className="delete-room-btn"
// //               onClick={(e) => {
// //                 e.preventDefault();
// //                 handleDeleteRoom(room.id);
// //               }}
// //               title="Delete Room"
// //             >
// //               <X size={20} />
// //             </button>
// //           </div>
// //         ))}
// //       </div>

// //       {rooms.length === 0 && !loading && (
// //         <div
// //           style={{
// //             textAlign: "center",
// //             padding: "50px",
// //             color: "#888",
// //             fontSize: "18px",
// //           }}
// //         >
// //           No rooms yet. Click "Add New Room" to get started! 🏠
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

// import React, { useState, useEffect, useCallback } from "react";
// import { Link } from "react-router-dom";
// import "../styles/RoomPage.css";
// import {
//   LampCeiling,
//   Bed,
//   Bath,
//   CookingPot,
//   PlusCircle,
//   X,
//   Pencil, // ✅ NEW
//   Check, // ✅ NEW
// } from "lucide-react";
// import { useAuth } from "../../application/auth/AuthContext";
// import API_ENDPOINTS, {
//   fetchWithAuth,
//   normalizeRoom,
//   USE_JSON_SERVER,
// } from "../../infrastructure/api/api.config";

// const roomIcons = {
//   living: <LampCeiling size={32} />,
//   bedroom: <Bed size={32} />,
//   kitchen: <CookingPot size={32} />,
//   bathroom: <Bath size={32} />,
//   garage: <LampCeiling size={32} />,
//   default: <LampCeiling size={32} />,
// };

// export default function RoomsPage() {
//   const [rooms, setRooms] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [isAdding, setIsAdding] = useState(false);
//   const [newRoomData, setNewRoomData] = useState({
//     name: "",
//     image: "https://via.placeholder.com/300",
//   });

//   // ✅ NEW — edit state
//   const [editingRoomId, setEditingRoomId] = useState(null);
//   const [editRoomData, setEditRoomData] = useState({ name: "", image: "" });

//   const { user } = useAuth();

//   useEffect(() => {
//     if (user) {
//       fetchRooms();
//     }
//   }, [user]);

//   const fetchRooms = async () => {
//     try {
//       const response = await fetchWithAuth(API_ENDPOINTS.ROOMS);
//       if (!response.ok) throw new Error("Failed to fetch rooms");
//       const data = await response.json();

//       const userRooms = USE_JSON_SERVER
//         ? data.filter((room) => room.userId === user.id)
//         : data;

//       const normalizedRooms = userRooms.map(normalizeRoom);
//       setRooms(normalizedRooms);
//       setLoading(false);
//     } catch (err) {
//       console.error("Error fetching rooms:", err);
//       setLoading(false);
//     }
//   };

//   const handleAddRoom = useCallback(
//     async (e) => {
//       e.preventDefault();

//       if (!newRoomData.name) {
//         alert("Please enter room name.");
//         return;
//       }

//       const roomPayload = USE_JSON_SERVER
//         ? {
//             name: newRoomData.name,
//             userId: user.id,
//             image: newRoomData.image || "https://via.placeholder.com/300",
//           }
//         : {
//             name: newRoomData.name,
//           };

//       try {
//         const response = await fetchWithAuth(API_ENDPOINTS.ROOMS, {
//           method: "POST",
//           body: JSON.stringify(roomPayload),
//         });

//         if (!response.ok) throw new Error("Failed to add room");

//         const addedRoom = await response.json();

//         const normalizedRoom = normalizeRoom({
//           ...addedRoom,
//           userId: user.id,
//           image: newRoomData.image || addedRoom.image,
//         });

//         setRooms((prev) => [...prev, normalizedRoom]);
//         setNewRoomData({ name: "", image: "https://via.placeholder.com/300" });
//         setIsAdding(false);
//       } catch (err) {
//         console.error("Error adding room:", err);
//         alert("Failed to add room. Please try again.");
//       }
//     },
//     [newRoomData, user],
//   );

//   const handleDeleteRoom = async (roomId) => {
//     if (!window.confirm("Are you sure you want to delete this room?")) return;

//     try {
//       const response = await fetchWithAuth(API_ENDPOINTS.ROOM_BY_ID(roomId), {
//         method: "DELETE",
//       });

//       if (!response.ok) throw new Error("Failed to delete room");

//       setRooms((prev) => prev.filter((room) => room.id !== roomId));
//     } catch (err) {
//       console.error("Error deleting room:", err);
//       alert("Failed to delete room. Please try again.");
//     }
//   };

//   // ✅ NEW — open edit form for a specific room
//   const handleStartEdit = (e, room) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setEditingRoomId(room.id);
//     setEditRoomData({ name: room.name, image: room.image });
//   };

//   // ✅ NEW — save edited room
//   const handleUpdateRoom = async (e, roomId) => {
//     e.preventDefault();

//     if (!editRoomData.name) {
//       alert("Room name cannot be empty.");
//       return;
//     }

//     try {
//       const response = await fetchWithAuth(API_ENDPOINTS.ROOM_BY_ID(roomId), {
//         method: "PUT",
//         body: JSON.stringify({
//           name: editRoomData.name,
//           image: editRoomData.image || "https://via.placeholder.com/300",
//         }),
//       });

//       if (!response.ok) throw new Error("Failed to update room");

//       const updatedRoom = await response.json();

//       setRooms((prev) =>
//         prev.map((room) =>
//           room.id === roomId
//             ? normalizeRoom({ ...room, ...updatedRoom })
//             : room,
//         ),
//       );

//       setEditingRoomId(null);
//     } catch (err) {
//       console.error("Error updating room:", err);
//       alert("Failed to update room. Please try again.");
//     }
//   };

//   const handleChange = (e) => {
//     setNewRoomData({ ...newRoomData, [e.target.name]: e.target.value });
//   };

//   // ✅ NEW — handle edit form input change
//   const handleEditChange = (e) => {
//     setEditRoomData({ ...editRoomData, [e.target.name]: e.target.value });
//   };

//   if (loading) {
//     return (
//       <div className="rooms-page-container">
//         <div style={{ textAlign: "center", padding: "50px", color: "white" }}>
//           Loading rooms... ⏳
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="rooms-page-container">
//       <div className="rooms-header">
//         <h1 style={{ color: "white" }}>Your Rooms ({rooms.length})</h1>

//         <button className="add-room-button" onClick={() => setIsAdding(true)}>
//           <PlusCircle size={24} /> <span>Add New Room</span>
//         </button>
//       </div>

//       {isAdding && (
//         <div className="add-room-form-container">
//           <form onSubmit={handleAddRoom} className="add-room-form">
//             <input
//               type="text"
//               name="name"
//               value={newRoomData.name}
//               onChange={handleChange}
//               placeholder="Room Name (e.g., Guest Room, Living Room)"
//               required
//             />
//             <input
//               type="url"
//               name="image"
//               value={newRoomData.image}
//               onChange={handleChange}
//               placeholder="Image URL (optional)"
//             />

//             <div className="form-buttons">
//               <button type="submit" className="form-submit-btn">
//                 Add Room
//               </button>
//               <button
//                 type="button"
//                 className="form-cancel-btn"
//                 onClick={() => {
//                   setIsAdding(false);
//                   setNewRoomData({
//                     name: "",
//                     image: "https://via.placeholder.com/300",
//                   });
//                 }}
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       <div className="rooms-grid">
//         {rooms.map((room) => (
//           <div key={room.id} className="room-card-wrapper">
//             {/* ✅ NEW — Edit form appears inline on the card */}
//             {editingRoomId === room.id ? (
//               <form
//                 className="add-room-form"
//                 onSubmit={(e) => handleUpdateRoom(e, room.id)}
//                 style={{ padding: "16px" }}
//               >
//                 <h3 style={{ color: "white", marginBottom: "10px" }}>
//                   Edit Room
//                 </h3>
//                 <input
//                   type="text"
//                   name="name"
//                   value={editRoomData.name}
//                   onChange={handleEditChange}
//                   placeholder="Room Name"
//                   required
//                 />
//                 <input
//                   type="url"
//                   name="image"
//                   value={editRoomData.image}
//                   onChange={handleEditChange}
//                   placeholder="Image URL (optional)"
//                 />
//                 <div className="form-buttons">
//                   <button type="submit" className="form-submit-btn">
//                     <Check size={16} /> Save
//                   </button>
//                   <button
//                     type="button"
//                     className="form-cancel-btn"
//                     onClick={() => setEditingRoomId(null)}
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </form>
//             ) : (
//               // ✅ Normal card view
//               <Link
//                 to={`/rooms/${room.id}`}
//                 state={{ room }}
//                 className="room-card-link"
//               >
//                 <div className="room-image-container">
//                   <img
//                     src={room.image}
//                     alt={room.name}
//                     className="w-full h-full object-cover"
//                   />
//                 </div>

//                 <div className="room-info-section">
//                   <h2>{room.name}</h2>
//                   <span>{roomIcons[room.iconType] || roomIcons.default}</span>
//                 </div>
//               </Link>
//             )}

//             {/* ✅ Action buttons — always visible */}
//             {editingRoomId !== room.id && (
//               <>
//                 {/* Edit button */}
//                 <button
//                   className="edit-room-btn"
//                   onClick={(e) => handleStartEdit(e, room)}
//                   title="Edit Room"
//                 >
//                   <Pencil size={20} />
//                 </button>

//                 {/* Delete button */}
//                 <button
//                   className="delete-room-btn"
//                   onClick={(e) => {
//                     e.preventDefault();
//                     handleDeleteRoom(room.id);
//                   }}
//                   title="Delete Room"
//                 >
//                   <X size={20} />
//                 </button>
//               </>
//             )}
//           </div>
//         ))}
//       </div>

//       {rooms.length === 0 && !loading && (
//         <div
//           style={{
//             textAlign: "center",
//             padding: "50px",
//             color: "#888",
//             fontSize: "18px",
//           }}
//         >
//           No rooms yet. Click "Add New Room" to get started! 🏠
//         </div>
//       )}
//     </div>
//   );
// }

//from folder fixed files

import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import "../styles/RoomPage.css";
import {
  LampCeiling,
  Bed,
  Bath,
  CookingPot,
  PlusCircle,
  X,
  Pencil,
  Check,
} from "lucide-react";
import { useAuth } from "../../application/auth/AuthContext";
import API_ENDPOINTS, {
  fetchWithAuth,
  normalizeRoom,
  USE_JSON_SERVER,
} from "../../infrastructure/api/api.config";

const roomIcons = {
  living: <LampCeiling size={32} />,
  bedroom: <Bed size={32} />,
  kitchen: <CookingPot size={32} />,
  bathroom: <Bath size={32} />,
  garage: <LampCeiling size={32} />,
  default: <LampCeiling size={32} />,
};

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newRoomData, setNewRoomData] = useState({
    name: "",
    image: "https://via.placeholder.com/300",
  });

  const [editingRoomId, setEditingRoomId] = useState(null);
  const [editRoomData, setEditRoomData] = useState({ name: "", image: "" });

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchRooms();
    }
  }, [user]);

  const fetchRooms = async () => {
    try {
      const response = await fetchWithAuth(API_ENDPOINTS.ROOMS);
      if (!response.ok) throw new Error("Failed to fetch rooms");
      const data = await response.json();

      const userRooms = USE_JSON_SERVER
        ? data.filter((room) => room.userId === user.id)
        : data;

      const normalizedRooms = userRooms.map(normalizeRoom);
      setRooms(normalizedRooms);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching rooms:", err);
      setLoading(false);
    }
  };

  const handleAddRoom = useCallback(
    async (e) => {
      e.preventDefault();

      if (!newRoomData.name) {
        alert("Please enter room name.");
        return;
      }

      const roomPayload = USE_JSON_SERVER
        ? {
            name: newRoomData.name,
            userId: user.id,
            image: newRoomData.image || "https://via.placeholder.com/300",
          }
        : {
            name: newRoomData.name,
          };

      try {
        const response = await fetchWithAuth(API_ENDPOINTS.ROOMS, {
          method: "POST",
          body: JSON.stringify(roomPayload),
        });

        if (!response.ok) throw new Error("Failed to add room");

        const addedRoom = await response.json();

        const normalizedRoom = normalizeRoom({
          ...addedRoom,
          userId: user.id,
          image: newRoomData.image || addedRoom.image,
        });

        setRooms((prev) => [...prev, normalizedRoom]);
        setNewRoomData({ name: "", image: "https://via.placeholder.com/300" });
        setIsAdding(false);
      } catch (err) {
        console.error("Error adding room:", err);
        alert("Failed to add room. Please try again.");
      }
    },
    [newRoomData, user],
  );

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;

    try {
      const response = await fetchWithAuth(API_ENDPOINTS.ROOM_BY_ID(roomId), {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete room");

      setRooms((prev) => prev.filter((room) => room.id !== roomId));
    } catch (err) {
      console.error("Error deleting room:", err);
      alert("Failed to delete room. Please try again.");
    }
  };

  const handleStartEdit = (e, room) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingRoomId(room.id);
    setEditRoomData({ name: room.name, image: room.image });
  };

  // ✅ FIX #2: كان بياخد الـ response كله — دلوقتي بيعمل unwrap لـ data.room
  const handleUpdateRoom = async (e, roomId) => {
    e.preventDefault();

    if (!editRoomData.name) {
      alert("Room name cannot be empty.");
      return;
    }

    try {
      const response = await fetchWithAuth(API_ENDPOINTS.ROOM_BY_ID(roomId), {
        method: "PUT",
        body: JSON.stringify({
          name: editRoomData.name,
          image: editRoomData.image || "https://via.placeholder.com/300",
        }),
      });

      if (!response.ok) throw new Error("Failed to update room");

      const data = await response.json();
      // ✅ Backend returns { message: "...", room: { ... } }
      const updatedRoom = data.room || data;

      setRooms((prev) =>
        prev.map((room) =>
          room.id === roomId
            ? normalizeRoom({ ...room, ...updatedRoom })
            : room,
        ),
      );

      setEditingRoomId(null);
    } catch (err) {
      console.error("Error updating room:", err);
      alert("Failed to update room. Please try again.");
    }
  };

  const handleChange = (e) => {
    setNewRoomData({ ...newRoomData, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditRoomData({ ...editRoomData, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div className="rooms-page-container">
        <div style={{ textAlign: "center", padding: "50px", color: "white" }}>
          Loading rooms... ⏳
        </div>
      </div>
    );
  }

  return (
    <div className="rooms-page-container">
      <div className="rooms-header">
        <h1 style={{ color: "white" }}>Your Rooms ({rooms.length})</h1>

        <button className="add-room-button" onClick={() => setIsAdding(true)}>
          <PlusCircle size={24} /> <span>Add New Room</span>
        </button>
      </div>

      {isAdding && (
        <div className="add-room-form-container">
          <form onSubmit={handleAddRoom} className="add-room-form">
            <input
              type="text"
              name="name"
              value={newRoomData.name}
              onChange={handleChange}
              placeholder="Room Name (e.g., Guest Room, Living Room)"
              required
            />
            <input
              type="url"
              name="image"
              value={newRoomData.image}
              onChange={handleChange}
              placeholder="Image URL (optional)"
            />

            <div className="form-buttons">
              <button type="submit" className="form-submit-btn">
                Add Room
              </button>
              <button
                type="button"
                className="form-cancel-btn"
                onClick={() => {
                  setIsAdding(false);
                  setNewRoomData({
                    name: "",
                    image: "https://via.placeholder.com/300",
                  });
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rooms-grid">
        {rooms.map((room) => (
          <div key={room.id} className="room-card-wrapper">
            {editingRoomId === room.id ? (
              <form
                className="add-room-form"
                onSubmit={(e) => handleUpdateRoom(e, room.id)}
                style={{ padding: "16px" }}
              >
                <h3 style={{ color: "white", marginBottom: "10px" }}>
                  Edit Room
                </h3>
                <input
                  type="text"
                  name="name"
                  value={editRoomData.name}
                  onChange={handleEditChange}
                  placeholder="Room Name"
                  required
                />
                <input
                  type="url"
                  name="image"
                  value={editRoomData.image}
                  onChange={handleEditChange}
                  placeholder="Image URL (optional)"
                />
                <div className="form-buttons">
                  <button type="submit" className="form-submit-btn">
                    <Check size={16} /> Save
                  </button>
                  <button
                    type="button"
                    className="form-cancel-btn"
                    onClick={() => setEditingRoomId(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <Link
                to={`/rooms/${room.id}`}
                state={{ room }}
                className="room-card-link"
              >
                <div className="room-image-container">
                  <img
                    src={room.image}
                    alt={room.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="room-info-section">
                  <h2>{room.name}</h2>
                  <span>{roomIcons[room.iconType] || roomIcons.default}</span>
                </div>
              </Link>
            )}

            {editingRoomId !== room.id && (
              <>
                <button
                  className="edit-room-btn"
                  onClick={(e) => handleStartEdit(e, room)}
                  title="Edit Room"
                >
                  <Pencil size={20} />
                </button>

                <button
                  className="delete-room-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    handleDeleteRoom(room.id);
                  }}
                  title="Delete Room"
                >
                  <X size={20} />
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {rooms.length === 0 && !loading && (
        <div
          style={{
            textAlign: "center",
            padding: "50px",
            color: "#888",
            fontSize: "18px",
          }}
        >
          No rooms yet. Click "Add New Room" to get started! 🏠
        </div>
      )}
    </div>
  );
}
