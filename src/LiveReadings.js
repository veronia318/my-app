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
import { Power, Zap, AlertTriangle } from 'lucide-react';
import './LiveReadings.css';

const HISTORY_LIMIT = 20;
const UPDATE_INTERVAL_MS = 1000;

// بيانات الأجهزة
const initialDevices = [
    { id: 1, name: "Living Room AC", voltage: 0, current: 0, power: 0, status: 'ON' },
    { id: 2, name: "Kitchen Fridge", voltage: 0, current: 0, power: 0, status: 'ON' },
    { id: 3, name: "Bedroom Heater", voltage: 0, current: 0, power: 0, status: 'OFF' },
    { id: 4, name: "Water Pump", voltage: 0, current: 0, power: 0, status: 'ON' },
];

// زرار ON / OFF
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

// صف الجهاز
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

export default function LiveReadings() {
    const [devices, setDevices] = useState(initialDevices);
    const [historyData, setHistoryData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDeviceId, setSelectedDeviceId] = useState(null);
    const [totalPower, setTotalPower] = useState(0);

    // 🟢 Dummy API (محاكاة API عادي)
    const fetchData = useCallback(async() => {
        try {
            // محاكاة تأخير API
            await new Promise(resolve => setTimeout(resolve, 300));

            const voltage = 220 + Math.random() * 5;
            const current = 1 + Math.random();
            const power = voltage * current;

            setDevices(prev =>
                prev.map(d => ({
                    ...d,
                    voltage,
                    current,
                    power: d.status === 'ON' ? power : 0
                }))
            );

            setTotalPower(power);

            setHistoryData(prev => {
                const newPoint = {
                    time: new Date().toLocaleTimeString(),
                    "Total Power": power
                };

                const updated = [...prev, newPoint];
                return updated.length > HISTORY_LIMIT ?
                    updated.slice(updated.length - HISTORY_LIMIT) :
                    updated;
            });

            setIsLoading(false);
        } catch (err) {
            console.error(err);
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const id = setInterval(fetchData, UPDATE_INTERVAL_MS);
        return () => clearInterval(id);
    }, [fetchData]);

    const summaryReadings = useMemo(() => ([
        { title: "Total Devices", value: devices.length, unit: "Devices", color: "#4a148c", icon: < Zap / > },
        { title: "Total Power", value: totalPower.toFixed(2), unit: "W", color: "#ff8f00", icon: < Power / > },
        { title: "System Status", value: "Normal", unit: "", color: "#2e7d32", icon: < AlertTriangle / > },
    ]), [devices.length, totalPower]);

    const toggleDeviceState = (id, state) => {
        setDevices(prev =>
            prev.map(d => d.id === id ? {...d, status: state } : d)
        );
    };

    if (isLoading) {
        return <div className = "loading-state" > Loading live data...⏳ < /div>;
    }

    return ( <
        div className = "live-readings-container" >
        <
        h2 > Live Readings < /h2>

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
        /div> <
        /div>
    );
}