
import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import './RoomPage.css';
import {
  LampCeiling,
  Bed,
  Bath,
  CookingPot,
  PlusCircle,
} from "lucide-react";

const initialRooms = [
  { 
    name: "Living Room", 
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511", 
    path: "/rooms/living", 
    icon: <LampCeiling size={32} /> 
  },
  { 
    name: "Bedroom", 
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85", 
    path: "/rooms/bedroom", 
    icon: <Bed size={32} /> 
  },
  { 
    name: "Kitchen", 
    image: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0", 
    path: "/rooms/kitchen", 
    icon: <CookingPot size={32} /> 
  },
  { 
    name: "Bathroom", 
    image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6", 
    path: "/rooms/bathroom", 
    icon: <Bath size={32} /> 
  },
];

export default function RoomsPage() {
  const [rooms, setRooms] = useState(initialRooms);
  const [isAdding, setIsAdding] = useState(false);
  const [newRoomData, setNewRoomData] = useState({ name: '', image: '' });

  const handleAddRoom = useCallback((e) => {
    e.preventDefault(); 

    if (!newRoomData.name || !newRoomData.image) {
        alert("Please enter both room name and image URL.");
        return;
    }

    const newRoom = {
        name: newRoomData.name,
        image: newRoomData.image,
        path: `/rooms/${newRoomData.name.toLowerCase().replace(/\s/g, '-')}`,
        icon: <LampCeiling size={32} />, 
    };

    setRooms(prevRooms => [...prevRooms, newRoom]);

    setNewRoomData({ name: '', image: '' });
    setIsAdding(false);

  }, [newRoomData]);

  const handleChange = (e) => {
      setNewRoomData({ ...newRoomData, [e.target.name]: e.target.value });
  };

  return (
    <div className="rooms-page-container">
      <div className="rooms-header">
        <h1 style={{color: "white"}}>Your Rooms</h1>

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
                  placeholder="Room Name (e.g., Guest Room)"
                  required
              />
              <input
                  type="url"
                  name="image"
                  value={newRoomData.image}
                  onChange={handleChange}
                  placeholder="Image URL (e.g., https://unsplash.com/...)"
                  required
              />

              <div className="form-buttons">
                  <button type="submit" className="form-submit-btn">Add Room</button>
                  <button 
                      type="button" 
                      className="form-cancel-btn" 
                      onClick={() => setIsAdding(false)}>
                          Cancel
                  </button>
              </div>
          </form>
        </div>
      )}

      <div className="rooms-grid">
        {rooms.map((room) => (
          <Link
            key={room.name}
            to={room.path}
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
              <span>{room.icon}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function RoomDevices({ title, devices }) {
  return (
    <div className="w-full min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6">{title}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      </div>
    </div>
  );
}
