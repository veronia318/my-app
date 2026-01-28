// [
//   {
//     "id": 1,
//     "name": "Living Room AC",
//     "voltage": 220.5,
//     "current": 1.2,
//     "power": 264.6,
//     "status": "ON"
//   },
//   {
//     "id": 2,
//     "name": "Kitchen Fridge",
//     "voltage": 221.0,
//     "current": 0.8,
//     "power": 176.8,
//     "status": "ON"
//   }
// ]













import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { Power, Zap, AlertTriangle, X } from 'lucide-react';
import './LiveReadings.css';

const HISTORY_LIMIT = 20;
const UPDATE_INTERVAL_MS = 3000; // كل 3 ثواني

// 🔴 ضع رابط الـ API الحقيقي هنا
const API_ENDPOINT = 'https://69763da3c0c36a2a99509b94.mockapi.io/devices';

const ControlToggle = React.memo(({ deviceId, currentStatus, onToggle }) => {
    const isChecked = currentStatus === 'ON';

    const handleToggle = (e) => {
        e.stopPropagation();
        onToggle(deviceId, isChecked ? 'OFF' : 'ON');
    };

    return ( <
        label className = "toggle-switch"
        onClick = { e => e.stopPropagation() } >
        <
        input type = "checkbox"
        checked = { isChecked }
        onChange = { handleToggle }
        /> <
        span className = "slider round" > < /span> <
        /label>
    );
});

const DeviceRow = React.memo(({ device, onToggle, isSelected, onSelect }) => {
    const isOnline = device.status === 'ON';
    const rowClass = `device-row ${isSelected ? 'selected-row' : ''}`;

    return ( <
        tr className = { rowClass }
        onClick = {
            () => onSelect(device.id) } >
        <
        td > { device.name } < /td> <
        td > { device.voltage.toFixed(2) }
        V < /td> <
        td > { device.current.toFixed(2) }
        A < /td> <
        td > { device.power.toFixed(2) }
        W < /td> <
        td >
        <
        span className = { `status-label ${isOnline ? 'online-label' : 'offline-label'}` } > { isOnline ? 'Active' : 'Off' } <
        /span> <
        /td> <
        td >
        <
        ControlToggle deviceId = { device.id }
        currentStatus = { device.status }
        onToggle = { onToggle }
        /> <
        /td> <
        /tr>
    );
});

const DeviceDetailsModal = ({ device, onClose, historyData }) => {
    if (!device) return null;

    return ( <
        div className = "modal-overlay"
        onClick = { onClose } >
        <
        div className = "modal-content"
        onClick = { e => e.stopPropagation() } >
        <
        div className = "modal-header" >
        <
        h2 > { device.name } - Details < /h2> <
        button className = "close-btn"
        onClick = { onClose } >
        <
        X size = { 24 }
        /> <
        /button> <
        /div>

        <
        div className = "modal-body" >
        <
        div className = "device-stats" >
        <
        div className = "stat-box" >
        <
        h4 > Voltage < /h4> <
        p className = "stat-value" > { device.voltage.toFixed(2) }
        V < /p> <
        /div> <
        div className = "stat-box" >
        <
        h4 > Current < /h4> <
        p className = "stat-value" > { device.current.toFixed(2) }
        A < /p> <
        /div> <
        div className = "stat-box" >
        <
        h4 > Power < /h4> <
        p className = "stat-value" > { device.power.toFixed(2) }
        W < /p> <
        /div> <
        div className = "stat-box" >
        <
        h4 > Status < /h4> <
        p className = { `stat-value ${device.status === 'ON' ? 'text-success' : 'text-danger'}` } > { device.status } <
        /p> <
        /div> <
        /div>

        <
        div className = "device-graph" >
        <
        h3 > Power Consumption History < /h3> <
        ResponsiveContainer width = "100%"
        height = { 300 } >
        <
        LineChart data = { historyData } >
        <
        CartesianGrid strokeDasharray = "3 3" / >
        <
        XAxis dataKey = "time" / >
        <
        YAxis / >
        <
        Tooltip / >
        <
        Legend / >
        <
        Line type = "monotone"
        dataKey = "power"
        stroke = "#4a148c"
        strokeWidth = { 2 }
        dot = {
            { r: 3 } }
        name = "Power (W)" /
        >
        <
        /LineChart> <
        /ResponsiveContainer> <
        /div> <
        /div> <
        /div> <
        /div>
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

    // 🟢 Fetch Real Data from API
    const fetchData = useCallback(async() => {
        try {
            const response = await fetch(API_ENDPOINT);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // افترض إن الـ API بيرجع array من الأجهزة بالشكل ده:
            // [{ id, name, voltage, current, power, status }, ...]

            setDevices(data);

            // حساب إجمالي الاستهلاك
            const total = data.reduce((sum, d) =>
                sum + (d.status === 'ON' ? d.power : 0), 0
            );
            setTotalPower(total);

            // إضافة نقطة للتاريخ العام
            const timestamp = new Date().toLocaleTimeString();
            setHistoryData(prev => {
                const newPoint = {
                    time: timestamp,
                    "Total Power": total
                };
                const updated = [...prev, newPoint];
                return updated.length > HISTORY_LIMIT ?
                    updated.slice(updated.length - HISTORY_LIMIT) :
                    updated;
            });

            // إضافة نقاط لتاريخ كل جهاز
            setDeviceHistory(prev => {
                const newHistory = {...prev };
                data.forEach(device => {
                    if (!newHistory[device.id]) {
                        newHistory[device.id] = [];
                    }
                    newHistory[device.id] = [
                        ...newHistory[device.id],
                        {
                            time: timestamp,
                            power: device.status === 'ON' ? device.power : 0
                        }
                    ].slice(-HISTORY_LIMIT);
                });
                return newHistory;
            });

            setIsLoading(false);
            setError(null);
        } catch (err) {
            console.error('API Error:', err);
            setError(err.message);
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const id = setInterval(fetchData, UPDATE_INTERVAL_MS);
        return () => clearInterval(id);
    }, [fetchData]);

    // التحكم في تشغيل/إيقاف الجهاز
    const toggleDeviceState = async(deviceId, newStatus) => {
        try {
            // أرسل الطلب للـ API لتحديث حالة الجهاز
            const response = await fetch(`${API_ENDPOINT}/${deviceId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                throw new Error('Failed to update device status');
            }

            // تحديث محلي فوري
            setDevices(prev =>
                prev.map(d => d.id === deviceId ? {...d, status: newStatus } : d)
            );

            // جلب البيانات المحدثة
            await fetchData();
        } catch (err) {
            console.error('Error toggling device:', err);
            alert('Failed to update device status');
        }
    };

    const summaryReadings = useMemo(() => ([{
            title: "Total Devices",
            value: devices.length,
            unit: "Devices",
            color: "#4a148c",
            icon: < Zap / >
        },
        {
            title: "Total Power",
            value: totalPower.toFixed(2),
            unit: "W",
            color: "#ff8f00",
            icon: < Power / >
        },
        {
            title: "System Status",
            value: error ? "Error" : "Normal",
            unit: "",
            color: error ? "#d32f2f" : "#2e7d32",
            icon: < AlertTriangle / >
        },
    ]), [devices.length, totalPower, error]);

    const selectedDevice = devices.find(d => d.id === selectedDeviceId);
    const selectedDeviceHistory = deviceHistory[selectedDeviceId] || [];

    if (isLoading && devices.length === 0) {
        return <div className = "loading-state" > Loading live data...⏳ < /div>;
    }

    return ( <
        div className = "live-readings-container" >
        <
        h2 > Live Readings < /h2>

        {
            error && ( <
                div className = "error-state" > ⚠️Error: { error } <
                /div>
            )
        }

        <
        div className = "reading-cards-wrapper" > {
            summaryReadings.map(card => ( <
                div key = { card.title }
                className = "reading-card"
                style = {
                    { borderLeftColor: card.color } } >
                <
                h3 > { card.title } < /h3> <
                p style = {
                    { color: card.color } } > { card.value } < span > { card.unit } < /span> <
                /p> <
                /div>
            ))
        } <
        /div>

        <
        div className = "live-graph-container" >
        <
        h3 > Total Power Consumption < /h3> <
        ResponsiveContainer width = "100%"
        height = { 250 } >
        <
        LineChart data = { historyData } >
        <
        CartesianGrid strokeDasharray = "3 3" / >
        <
        XAxis dataKey = "time" / >
        <
        YAxis / >
        <
        Tooltip / >
        <
        Legend / >
        <
        Line type = "monotone"
        dataKey = "Total Power"
        stroke = "#ff8f00"
        strokeWidth = { 3 }
        dot = { false }
        /> <
        /LineChart> <
        /ResponsiveContainer> <
        /div>

        <
        div className = "devices-table-container" >
        <
        table className = "devices-table" >
        <
        thead >
        <
        tr >
        <
        th > Device < /th> <
        th > Voltage < /th> <
        th > Current < /th> <
        th > Power < /th> <
        th > Status < /th> <
        th > Control < /th> <
        /tr> <
        /thead> <
        tbody > {
            devices.map(device => ( <
                DeviceRow key = { device.id }
                device = { device }
                onToggle = { toggleDeviceState }
                onSelect = { setSelectedDeviceId }
                isSelected = { selectedDeviceId === device.id }
                />
            ))
        } <
        /tbody> <
        /table> <
        /div>

        {
            selectedDevice && ( <
                DeviceDetailsModal device = { selectedDevice }
                onClose = {
                    () => setSelectedDeviceId(null) }
                historyData = { selectedDeviceHistory }
                />
            )
        } <
        /div>
    );
}