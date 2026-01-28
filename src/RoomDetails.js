// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { ArrowLeft, Plus, Power, Zap, Trash2 } from 'lucide-react';
// import './RoomDetails.css';

// const ROOMS_API = 'https://69763da3c0c36a2a99509b94.mockapi.io/rooms';
// const DEVICES_API = 'https://69763da3c0c36a2a99509b94.mockapi.io/devices';

// export default function RoomDetails() {
//   const { roomId } = useParams();
//   const navigate = useNavigate();
//   const [room, setRoom] = useState(null);
//   const [devices, setDevices] = useState([]);
//   const [allDevices, setAllDevices] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [isAddingDevice, setIsAddingDevice] = useState(false);

//   useEffect(() => {
//     fetchRoomAndDevices();
//   }, [roomId]);

//   const fetchRoomAndDevices = async () => {
//     try {
//       // جلب بيانات الغرفة
//       const roomResponse = await fetch(`${ROOMS_API}/${roomId}`);
//       if (!roomResponse.ok) throw new Error('Room not found');
//       const roomData = await roomResponse.json();
//       setRoom(roomData);

//       // جلب جميع الأجهزة
//       const devicesResponse = await fetch(DEVICES_API);
//       if (!devicesResponse.ok) throw new Error('Failed to fetch devices');
//       const devicesData = await devicesResponse.json();
//       setAllDevices(devicesData);

//       // فلترة الأجهزة الخاصة بهذه الغرفة
//       const roomDeviceIds = roomData.devices || [];
//       const roomDevices = devicesData.filter(d => roomDeviceIds.includes(d.id));
//       setDevices(roomDevices);

//       setLoading(false);
//     } catch (err) {
//       console.error('Error:', err);
//       setLoading(false);
//     }
//   };

//   // إضافة جهاز للغرفة
//   const handleAddDevice = async (deviceId) => {
//     try {
//       const updatedDeviceIds = [...(room.devices || []), deviceId];

//       const response = await fetch(`${ROOMS_API}/${roomId}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ ...room, devices: updatedDeviceIds })
//       });

//       if (!response.ok) throw new Error('Failed to add device');

//       await fetchRoomAndDevices();
//       setIsAddingDevice(false);
//       alert('Device added to room!');
//     } catch (err) {
//       console.error('Error adding device:', err);
//       alert('Failed to add device');
//     }
//   };

//   // حذف جهاز من الغرفة
//   const handleRemoveDevice = async (deviceId) => {
//     try {
//       const updatedDeviceIds = (room.devices || []).filter(id => id !== deviceId);

//       const response = await fetch(`${ROOMS_API}/${roomId}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ ...room, devices: updatedDeviceIds })
//       });

//       if (!response.ok) throw new Error('Failed to remove device');

//       await fetchRoomAndDevices();
//       alert('Device removed from room!');
//     } catch (err) {
//       console.error('Error removing device:', err);
//       alert('Failed to remove device');
//     }
//   };

//   // التحكم في تشغيل/إيقاف الجهاز
//   const toggleDevice = async (device) => {
//     try {
//       const newStatus = device.status === 'ON' ? 'OFF' : 'ON';

//       const response = await fetch(`${DEVICES_API}/${device.id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ ...device, status: newStatus })
//       });

//       if (!response.ok) throw new Error('Failed to toggle device');

//       await fetchRoomAndDevices();
//     } catch (err) {
//       console.error('Error toggling device:', err);
//       alert('Failed to toggle device');
//     }
//   };

//   const availableDevices = allDevices.filter(
//     d => !(room?.devices || []).includes(d.id)
//   );

//   if (loading) {
//     return <div className="loading">Loading... ⏳</div>;
//   }

//   if (!room) {
//     return <div className="error">Room not found!</div>;
//   }

//   return (
//     <div className="room-details-container">
//       <div className="room-details-header">
//         <button className="back-btn" onClick={() => navigate('/rooms')}>
//           <ArrowLeft size={20} /> Back to Rooms
//         </button>
//         <h1>{room.name}</h1>
//         <button className="add-device-btn" onClick={() => setIsAddingDevice(!isAddingDevice)}>
//           <Plus size={20} /> Add Device
//         </button>
//       </div>

//       {isAddingDevice && (
//         <div className="add-device-panel">
//           <h3>Available Devices</h3>
//           <div className="devices-list">
//             {availableDevices.length === 0 ? (
//               <p>No available devices to add</p>
//             ) : (
//               availableDevices.map(device => (
//                 <div key={device.id} className="device-option">
//                   <span>{device.name}</span>
//                   <button onClick={() => handleAddDevice(device.id)}>
//                     Add
//                   </button>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       )}

//       <div className="devices-grid">
//         {devices.length === 0 ? (
//           <div className="no-devices">
//             <p>No devices in this room yet.</p>
//             <p>Click "Add Device" to get started!</p>
//           </div>
//         ) : (
//           devices.map(device => (
//             <div key={device.id} className="device-card">
//               <div className="device-header">
//                 <h3>{device.name}</h3>
//                 <button 
//                   className="remove-device-btn"
//                   onClick={() => handleRemoveDevice(device.id)}
//                   title="Remove from room"
//                 >
//                   <Trash2 size={16} />
//                 </button>
//               </div>

//               <div className="device-info">
//                 <div className="info-row">
//                   <Zap size={18} />
//                   <span>Voltage: {device.voltage}V</span>
//                 </div>
//                 <div className="info-row">
//                   <Zap size={18} />
//                   <span>Current: {device.current}A</span>
//                 </div>
//                 <div className="info-row">
//                   <Power size={18} />
//                   <span>Power: {device.power}W</span>
//                 </div>
//               </div>

//               <div className="device-controls">
//                 <span className={`status ${device.status === 'ON' ? 'active' : 'inactive'}`}>
//                   {device.status}
//                 </span>
//                 <button 
//                   className={`toggle-btn ${device.status === 'ON' ? 'on' : 'off'}`}
//                   onClick={() => toggleDevice(device)}
//                 >
//                   <Power size={20} />
//                   {device.status === 'ON' ? 'Turn OFF' : 'Turn ON'}
//                 </button>
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// }









import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Power, Zap, Trash2 } from 'lucide-react';
import './RoomDetails.css';

const ROOMS_API = 'https://69763da3c0c36a2a99509b94.mockapi.io/rooms';

export default function RoomDetails() {
    const { roomId } = useParams();
    const navigate = useNavigate();

    const [room, setRoom] = useState(null);
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);

    // 🔹 جلب بيانات الغرفة + الأجهزة
    useEffect(() => {
        fetchRoom();
    }, [roomId]);

    const fetchRoom = async() => {
        try {
            const response = await fetch(`${ROOMS_API}/${roomId}`);
            if (!response.ok) throw new Error('Room not found');

            const roomData = await response.json();
            setRoom(roomData);
            setDevices(roomData.devices || []);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    // 🔹 تشغيل / إيقاف الجهاز
    const toggleDevice = async(index) => {
        try {
            const updatedDevices = [...devices];
            updatedDevices[index].status =
                updatedDevices[index].status === 'ON' ? 'OFF' : 'ON';

            const response = await fetch(`${ROOMS_API}/${roomId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...room,
                    devices: updatedDevices
                })
            });

            if (!response.ok) throw new Error('Failed to update device');

            setDevices(updatedDevices);
        } catch (err) {
            console.error(err);
            alert('Failed to toggle device');
        }
    };

    // 🔹 حذف جهاز من الغرفة
    const removeDevice = async(index) => {
        try {
            const updatedDevices = devices.filter((_, i) => i !== index);

            const response = await fetch(`${ROOMS_API}/${roomId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...room,
                    devices: updatedDevices
                })
            });

            if (!response.ok) throw new Error('Failed to remove device');

            setDevices(updatedDevices);
        } catch (err) {
            console.error(err);
            alert('Failed to remove device');
        }
    };

    if (loading) {
        return <div className = "loading" > Loading...⏳ < /div>;
    }

    if (!room) {
        return <div className = "error" > Room not found! < /div>;
    }

    return ( <
        div className = "room-details-container" > { /* 🔙 Header */ } <
        div className = "room-details-header" >
        <
        button className = "back-btn"
        onClick = {
            () => navigate('/rooms') } >
        <
        ArrowLeft size = { 20 }
        /> Back to Rooms <
        /button> <
        h1 > { room.name } < /h1> <
        /div>

        { /* 🧠 الأجهزة */ } <
        div className = "devices-grid" > {
            devices.length === 0 ? ( <
                div className = "no-devices" >
                <
                p > No devices in this room yet. < /p> <
                /div>
            ) : (
                devices.map((device, index) => ( <
                    div key = { index }
                    className = "device-card" >
                    <
                    div className = "device-header" >
                    <
                    h3 > { device.name } < /h3> <
                    button className = "remove-device-btn"
                    onClick = {
                        () => removeDevice(index) }
                    title = "Remove device" >
                    <
                    Trash2 size = { 16 }
                    /> <
                    /button> <
                    /div>

                    <
                    div className = "device-info" >
                    <
                    div className = "info-row" >
                    <
                    Zap size = { 18 }
                    /> <
                    span > Voltage: { device.voltage }
                    V < /span> <
                    /div> <
                    div className = "info-row" >
                    <
                    Zap size = { 18 }
                    /> <
                    span > Current: { device.current }
                    A < /span> <
                    /div> <
                    div className = "info-row" >
                    <
                    Power size = { 18 }
                    /> <
                    span > Power: { device.power }
                    W < /span> <
                    /div> <
                    /div>

                    <
                    div className = "device-controls" >
                    <
                    span className = { `status ${
                    device.status === 'ON' ? 'active' : 'inactive'
                  }` } >
                    { device.status } <
                    /span>

                    <
                    button className = { `toggle-btn ${
                    device.status === 'ON' ? 'on' : 'off'
                  }` }
                    onClick = {
                        () => toggleDevice(index) } >
                    <
                    Power size = { 20 }
                    /> { device.status === 'ON' ? 'Turn OFF' : 'Turn ON' } <
                    /button> <
                    /div> <
                    /div>
                ))
            )
        } <
        /div> <
        /div>
    );
}