
import React from 'react';
import './Homepage.css'; // لربط ملف التنسيق
import { Bolt, Thermometer, Shield, Zap } from 'lucide-react';

// مكون البطاقة (Widget) لإعادة الاستخدام
const HomeWidget = ({ title, value, unit, icon, color }) => (
    <div className="home-widget" style={{ borderColor: color }}>
        <div className="widget-header">
            <span className="widget-icon" style={{ color: color }}>{icon}</span>
            <h3 className="widget-title">{title}</h3>
        </div>
        <p className="widget-value" style={{ color: color }}>{value}</p>
        <span className="widget-unit">{unit}</span>
    </div>
);

export default function HomePage() {
    // هذه البيانات هي أمثلة وستقومين باستبدالها لاحقاً ببيانات MQTT الحقيقية
    const stats = [
        { 
            title: "Total Power Consumption", 
            value: "5.7", 
            unit: "kWh Today", 
            icon: <Bolt size={30} />, 
            color: "#FFD700" // ذهبي
        },
        { 
            title: "Average Temperature", 
            value: "24.5", 
            unit: "°C", 
            icon: <Thermometer size={30} />, 
            color: "#00BFFF" // أزرق (لون الـ accent)
        },
        { 
            title: "Active Devices", 
            value: "8", 
            unit: "of 15", 
            icon: <Zap size={30} />, 
            color: "#32CD32" // أخضر
        },
        { 
            title: "Security Status", 
            value: "Online", 
            unit: "All OK", 
            icon: <Shield size={30} />, 
            color: "#FF4500" // أحمر/برتقالي
        },
    ];

    return (
        <div className="home-container">
            <h1 className="main-title">Smart Home Overview</h1>
            <p className="subtitle">Welcome back! Quick glance at your home's status.</p>

            <div className="widgets-grid">
                {stats.map((stat) => (
                    <HomeWidget key={stat.title} {...stat} />
                ))}
            </div>

            <section className="alerts-section">
                <h2>⚠️ Important Alerts</h2>
                <ul>
                    <li>Window in Kitchen has been open for 15 minutes.</li>
                    <li>Power consumption spike detected in Bedroom.</li>
                    <li>Device 'Heater-03' is offline.</li>
                </ul>
            </section>
        </div>
    );
}