// import React, { useState, useCallback } from "react";
// import { Link } from "react-router-dom";
// import './RoomPage.css';
// import {
//   LampCeiling,
//   Bed,
//   Bath,
//   CookingPot,
//   PlusCircle,
// } from "lucide-react";

// const initialRooms = [
//   { 
//     name: "Living Room", 
//     image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511", 
//     path: "/rooms/living", 
//     icon: <LampCeiling size={32} /> 
//   },
//   { 
//     name: "Bedroom", 
//     image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85", 
//     path: "/rooms/bedroom", 
//     icon: <Bed size={32} /> 
//   },
//   { 
//     name: "Kitchen", 
//     image: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0", 
//     path: "/rooms/kitchen", 
//     icon: <CookingPot size={32} /> 
//   },
//   { 
//     name: "Bathroom", 
//     image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6", 
//     path: "/rooms/bathroom", 
//     icon: <Bath size={32} /> 
//   },
// ];

// export default function RoomsPage() {
//   const [rooms, setRooms] = useState(initialRooms);
//   const [isAdding, setIsAdding] = useState(false);
//   const [newRoomData, setNewRoomData] = useState({ name: '', image: '' });

//   const handleAddRoom = useCallback((e) => {
//     e.preventDefault(); 

//     if (!newRoomData.name || !newRoomData.image) {
//         alert("Please enter both room name and image URL.");
//         return;
//     }

//     const newRoom = {
//         name: newRoomData.name,
//         image: newRoomData.image,
//         path: `/rooms/${newRoomData.name.toLowerCase().replace(/\s/g, '-')}`,
//         icon: <LampCeiling size={32} />, 
//     };

//     setRooms(prevRooms => [...prevRooms, newRoom]);

//     setNewRoomData({ name: '', image: '' });
//     setIsAdding(false);

//   }, [newRoomData]);

//   const handleChange = (e) => {
//       setNewRoomData({ ...newRoomData, [e.target.name]: e.target.value });
//   };

//   return (
//     <div className="rooms-page-container">
//       <div className="rooms-header">
//         <h1 style={{color: "white"}}>Your Rooms</h1>

//         <button className="add-room-button" onClick={() => setIsAdding(true)}>
//           <PlusCircle size={24} /> <span>Add New Room</span>
//         </button>
//       </div>

//       {isAdding && (
//         <div className="add-room-form-container">
//           <form onSubmit={handleAddRoom} className="add-room-form">
//               <input
//                   type="text"
//                   name="name"
//                   value={newRoomData.name}
//                   onChange={handleChange}
//                   placeholder="Room Name (e.g., Guest Room)"
//                   required
//               />
//               <input
//                   type="url"
//                   name="image"
//                   value={newRoomData.image}
//                   onChange={handleChange}
//                   placeholder="Image URL (e.g., https://unsplash.com/...)"
//                   required
//               />

//               <div className="form-buttons">
//                   <button type="submit" className="form-submit-btn">Add Room</button>
//                   <button 
//                       type="button" 
//                       className="form-cancel-btn" 
//                       onClick={() => setIsAdding(false)}>
//                           Cancel
//                   </button>
//               </div>
//           </form>
//         </div>
//       )}

//       <div className="rooms-grid">
//         {rooms.map((room) => (
//           <Link
//             key={room.name}
//             to={room.path}
//             className="room-card-link"
//           >
//             <div className="room-image-container">
//               <img
//                 src={room.image}
//                 alt={room.name}
//                 className="w-full h-full object-cover"
//               />
//             </div>

//             <div className="room-info-section">
//               <h2>{room.name}</h2>
//               <span>{room.icon}</span>
//             </div>
//           </Link>
//         ))}
//       </div>
//     </div>
//   );
// }

// export function RoomDevices({ title, devices }) {
//   return (
//     <div className="w-full min-h-screen p-6">
//       <h1 className="text-3xl font-bold mb-6">{title}</h1>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//       </div>
//     </div>
//   );
// }


import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import './RoomPage.css';
import {
    LampCeiling,
    Bed,
    Bath,
    CookingPot,
    PlusCircle,
    Trash2
} from "lucide-react";

// 🔴 ضعي رابط الـ API هنا
const ROOMS_API = 'https://69763da3c0c36a2a99509b94.mockapi.io/rooms';

// أيقونات الغرف
const roomIcons = {
    living: < LampCeiling size = { 32 }
    />,
    bedroom: < Bed size = { 32 }
    />,
    kitchen: < CookingPot size = { 32 }
    />,
    bathroom: < Bath size = { 32 }
    />,
    default: < LampCeiling size = { 32 }
    />
};

export default function RoomsPage() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newRoomData, setNewRoomData] = useState({ name: '', image: '' });

    // جلب الغرف من API
    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async() => {
        try {
            const response = await fetch(ROOMS_API);
            if (!response.ok) throw new Error('Failed to fetch rooms');
            const data = await response.json();
            setRooms(data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching rooms:', err);
            setLoading(false);
        }
    };

    // إضافة غرفة جديدة
    const handleAddRoom = useCallback(async(e) => {
        e.preventDefault();

        if (!newRoomData.name || !newRoomData.image) {
            alert("Please enter both room name and image URL.");
            return;
        }

        const roomType = newRoomData.name.toLowerCase();
        const iconType = Object.keys(roomIcons).find(key => roomType.includes(key)) || 'default';

        const newRoom = {
            name: newRoomData.name,
            image: newRoomData.image,
            iconType: iconType,
            devices: [] // بداية بدون أجهزة
        };

        try {
            const response = await fetch(ROOMS_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newRoom)
            });

            if (!response.ok) throw new Error('Failed to add room');

            const addedRoom = await response.json();
            setRooms(prev => [...prev, addedRoom]);
            setNewRoomData({ name: '', image: '' });
            setIsAdding(false);
            alert('Room added successfully!');
        } catch (err) {
            console.error('Error adding room:', err);
            alert('Failed to add room. Please try again.');
        }
    }, [newRoomData]);

    // حذف غرفة
    const handleDeleteRoom = async(roomId) => {
        if (!window.confirm('Are you sure you want to delete this room?')) return;

        try {
            const response = await fetch(`${ROOMS_API}/${roomId}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete room');

            setRooms(prev => prev.filter(room => room.id !== roomId));
            alert('Room deleted successfully!');
        } catch (err) {
            console.error('Error deleting room:', err);
            alert('Failed to delete room. Please try again.');
        }
    };

    const handleChange = (e) => {
        setNewRoomData({...newRoomData, [e.target.name]: e.target.value });
    };

    if (loading) {
        return ( <
            div className = "rooms-page-container" >
            <
            div style = {
                { textAlign: 'center', padding: '50px', color: 'white' } } >
            Loading rooms...⏳ <
            /div> <
            /div>
        );
    }

    return ( <
        div className = "rooms-page-container" >
        <
        div className = "rooms-header" >
        <
        h1 style = {
            { color: "white" } } > Your Rooms({ rooms.length }) < /h1>

        <
        button className = "add-room-button"
        onClick = {
            () => setIsAdding(true) } >
        <
        PlusCircle size = { 24 }
        /> <span>Add New Room</span >
        <
        /button> <
        /div>

        {
            isAdding && ( <
                div className = "add-room-form-container" >
                <
                form onSubmit = { handleAddRoom }
                className = "add-room-form" >
                <
                input type = "text"
                name = "name"
                value = { newRoomData.name }
                onChange = { handleChange }
                placeholder = "Room Name (e.g., Guest Room, Living Room)"
                required /
                >
                <
                input type = "url"
                name = "image"
                value = { newRoomData.image }
                onChange = { handleChange }
                placeholder = "Image URL (e.g., https://images.unsplash.com/...)"
                required /
                >

                <
                div className = "form-buttons" >
                <
                button type = "submit"
                className = "form-submit-btn" > Add Room < /button> <
                button type = "button"
                className = "form-cancel-btn"
                onClick = {
                    () => setIsAdding(false) } >
                Cancel <
                /button> <
                /div> <
                /form> <
                /div>
            )
        }

        <
        div className = "rooms-grid" > {
            rooms.map((room) => ( <
                div key = { room.id }
                className = "room-card-wrapper" >
                <
                Link to = { `/rooms/${room.id}` }
                state = {
                    { room } }
                className = "room-card-link" >
                <
                div className = "room-image-container" >
                <
                img src = { room.image }
                alt = { room.name }
                className = "w-full h-full object-cover" /
                >
                <
                /div>

                <
                div className = "room-info-section" >
                <
                h2 > { room.name } < /h2> <
                span > { roomIcons[room.iconType] || roomIcons.default } < /span> <
                /div> <
                /Link>

                <
                button className = "delete-room-btn"
                onClick = {
                    (e) => {
                        e.preventDefault();
                        handleDeleteRoom(room.id);
                    }
                }
                title = "Delete Room" >
                <
                Trash2 size = { 18 }
                /> <
                /button> <
                /div>
            ))
        } <
        /div>

        {
            rooms.length === 0 && !loading && ( <
                div style = {
                    {
                        textAlign: 'center',
                        padding: '50px',
                        color: '#888',
                        fontSize: '18px'
                    }
                } >
                No rooms yet.Click "Add New Room"
                to get started!🏠
                <
                /div>
            )
        } <
        /div>
    );
}