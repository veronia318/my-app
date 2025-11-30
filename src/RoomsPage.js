import React from "react";
import { Link } from "react-router-dom";
import './RoomPage.css';
import {
  LampCeiling,
  Bed,
  Bath,
  CookingPot,
} from "lucide-react"; // Icons

// ======== Rooms Page =========
export default function RoomsPage() {
  const rooms = [
    {
      name: "Living Room",
      image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511", // you can replace later
      path: "/rooms/living",
      icon: <LampCeiling size={32} />, 
    },
    {
      name: "Bedroom",
      image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
      path: "/rooms/bedroom",
      icon: <Bed size={32} />,
    },
    {
      name: "Kitchen",
      image: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0",
      path: "/rooms/kitchen",
      icon: <CookingPot size={32} />,
    },
    {
      name: "Bathroom",
      image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6",
      path: "/rooms/bathroom",
      icon: <Bath size={32} />,
    },
  ];

  return (
    <div className="rooms-page-container">
      <h1 className="text-3xl font-bold mb-6" style={{color: "white"}}>Your Rooms</h1>

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
              <h2 className="text-xl font-bold">{room.name}</h2>
              <span>{room.icon}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ========= Room Devices Template =========
export function RoomDevices({ title, devices }) {
  return (
    <div className="w-full min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6">{title}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map((device) => (
          <div
            key={device.name}
            className="shadow-md p-4 bg-white rounded-2xl flex flex-col items-center"
          >
            <device.icon size={40} className="mb-3" />
            <h3 className="text-lg font-semibold mb-2">{device.name}</h3>

            <button
              onClick={device.toggle}
              className={`px-4 py-2 rounded-xl text-white font-medium duration-200 ${
                device.state ? "bg-green-600" : "bg-gray-500"
              }`}
            >
              {device.state ? "Turn Off" : "Turn On"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
