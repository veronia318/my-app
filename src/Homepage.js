import React, { useState, useEffect } from 'react';
import { Bolt, Zap, Activity } from 'lucide-react';
import './Homepage.css';

// مكون البطاقة (Widget) لإعادة الاستخدام
const HomeWidget = ({ title, value, unit, icon, color }) => ( <
    div className = "home-widget"
    style = {
        { borderLeftColor: color } } >
    <
    div className = "widget-header" >
    <
    div className = "widget-icon"
    style = {
        { color } } > { icon } <
    /div> <
    h3 className = "widget-title" > { title } < /h3> <
    /div> <
    p className = "widget-value"
    style = {
        { color } } > { value } < /p> <
    p className = "widget-unit" > { unit } < /p> <
    /div>
);

export default function HomePage() {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // جلب البيانات من API
    useEffect(() => {
        const fetchDevices = async() => {
            try {
                const response = await fetch('https://69763da3c0c36a2a99509b94.mockapi.io/devices');
                if (!response.ok) throw new Error('Failed to fetch data');
                const data = await response.json();
                setDevices(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchDevices();
        // تحديث البيانات كل 30 ثانية
        const interval = setInterval(fetchDevices, 30000);
        return () => clearInterval(interval);
    }, []);

    // حساب الإحصائيات من البيانات الحقيقية
    const calculateStats = () => {
        if (!devices.length) return { totalPower: 0, activeDevices: 0, totalCurrent: 0 };

        const activeDevices = devices.filter(d => d.status === 'ON').length;

        // حساب إجمالي الطاقة للأجهزة المشغلة
        const totalPower = devices
            .filter(d => d.status === 'ON')
            .reduce((sum, device) => sum + (parseFloat(device.power) || 0), 0);

        // حساب إجمالي التيار
        const totalCurrent = devices
            .filter(d => d.status === 'ON')
            .reduce((sum, device) => sum + (parseFloat(device.current) || 0), 0);

        return {
            totalPower: totalPower.toFixed(1),
            activeDevices,
            totalDevices: devices.length,
            totalCurrent: totalCurrent.toFixed(2)
        };
    };

    // الحصول على التنبيهات
    const getAlerts = () => {
        const alerts = [];

        devices.forEach(device => {
            // أجهزة متوقفة (OFF)
            if (device.status === 'OFF') {
                alerts.push(`Device '${device.name}' is turned OFF.`);
            }

            // استهلاك طاقة عالي (أكثر من 70W)
            if (device.status === 'ON' && parseFloat(device.power) > 70) {
                alerts.push(`High power consumption in ${device.name}: ${device.power}W`);
            }

            // تيار عالي (أكثر من 50A)
            if (device.status === 'ON' && parseFloat(device.current) > 50) {
                alerts.push(`High current detected in ${device.name}: ${device.current}A`);
            }

            // جهد منخفض (أقل من 200V)
            if (device.status === 'ON' && parseFloat(device.voltage) < 200) {
                alerts.push(`Low voltage warning for ${device.name}: ${device.voltage}V`);
            }
        });

        return alerts.slice(0, 5); // أول 5 تنبيهات فقط
    };

    const stats = calculateStats();
    const alerts = getAlerts();

    const statsWidgets = [{
            title: "Total Power Consumption",
            value: loading ? "..." : stats.totalPower,
            unit: "Watts",
            icon: < Bolt size = { 32 }
            />,
            color: "#FFD700"
        },
        {
            title: "Active Devices",
            value: loading ? "..." : stats.activeDevices,
            unit: `of ${stats.totalDevices} devices`,
            icon: < Zap size = { 32 }
            />,
            color: "#32CD32"
        },
        {
            title: "Total Current",
            value: loading ? "..." : stats.totalCurrent,
            unit: "Amperes",
            icon: < Activity size = { 32 }
            />,
            color: "#00BFFF"
        },
    ];

    if (error) {
        return ( <
            div className = "home-container" >
            <
            div className = "error-message" >
            <
            h2 > ⚠️Error Loading Data < /h2> <
            p > { error } < /p> <
            /div> <
            /div>
        );
    }

    return ( <
        div className = "home-container" >
        <
        h1 className = "main-title" > Smart Home Overview < /h1> <
        p className = "subtitle" > { loading ? "Loading your home's status..." : "Welcome back! Quick glance at your home's status." } <
        /p>

        <
        div className = "widgets-grid" > {
            statsWidgets.map((stat, index) => ( <
                HomeWidget key = { index } {...stat }
                />
            ))
        } <
        /div>

        {
            alerts.length > 0 && ( <
                div className = "alerts-section" >
                <
                h2 > ⚠️Important Alerts < /h2> <
                ul > {
                    alerts.map((alert, index) => ( <
                        li key = { index } > { alert } < /li>
                    ))
                } <
                /ul> <
                /div>
            )
        }

        {
            alerts.length === 0 && !loading && ( <
                div className = "alerts-section"
                style = {
                    { borderTopColor: '#32CD32' } } >
                <
                h2 style = {
                    { color: '#32CD32' } } > ✓All Systems Normal < /h2> <
                p style = {
                    { color: '#888', margin: 0 } } > No alerts at this time.Everything is running smoothly! < /p> <
                /div>
            )
        } <
        /div>
    );
}