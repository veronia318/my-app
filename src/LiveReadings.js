
// this is the old code with api without graph 
//import React, { useState, useEffect } from 'react';

//function LiveReadings() {
//    const [readings, setReadings] = useState({
//        voltage: 0.00,
//        current: 0.00,
//        power: 0.00
//    });
//    const [isLoading, setIsLoading] = useState(true);
//    const [error, setError] = useState(null);

//    const API_ENDPOINT = '/readings'; 

//    const fetchData = async () => {
//        try {
//            const response = await fetch(API_ENDPOINT);
//            if (!response.ok) {
//                throw new Error(`HTTP error! status: ${response.status}`);
//            }
//            const data = await response.json();
//            setReadings(data);
//            setIsLoading(false);
//            setError(null);
//        } catch (err) {
//            console.error("Failed to fetch data:", err);
//            setError("Cannot connect to ESP32 server. Please check the network and API endpoint.");
//            setIsLoading(false);
//        }
//    };

//    useEffect(() => {
//        fetchData();
//        const intervalId = setInterval(fetchData, 1000);
//        return () => clearInterval(intervalId);
//    }, []);

//    if (isLoading) {
//        return <div className="loading-state">Loading live data... ⏳</div>;
//    }

//    if (error) {
//        return <div className="error-state" style={{ color: 'red' }}>Error: {error}</div>;
//    }

//    return (
//        <div className="live-readings-container">
//            <h2> Live Readings </h2>
            
//            <div className="reading-card voltage">
//                <h3>Voltage</h3>
//                <p>{readings.voltage.toFixed(2)} <span>V</span></p>
//            </div>
            
//            <div className="reading-card current">
//                <h3>Current</h3>
//                <p>{readings.current.toFixed(2)} <span>A</span></p>
//            </div>
            
//            <div className="reading-card power">
//                <h3>Power</h3>
//                <p>{readings.power.toFixed(2)} <span>W</span></p>
//            </div>

//            <p className="last-update">Last updated: {new Date().toLocaleTimeString()}</p>
//        </div>
//    );
//}

//export default LiveReadings;














//this is the new code with graph

//import React, { useState, useEffect } from 'react';
//import { 
//    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
//} from 'recharts';

//// Set a limit for how many data points to keep in history
//const HISTORY_LIMIT = 20; 

//function LiveReadings() {
//    const [readings, setReadings] = useState({
//        voltage: 0.00,
//        current: 0.00,
//        power: 0.00
//    });
//    // New state to hold historical data for the graph
//    const [historyData, setHistoryData] = useState([]);
//    const [isLoading, setIsLoading] = useState(true);
//    const [error, setError] = useState(null);

//    const API_ENDPOINT = '/readings';

//    const fetchData = async () => {
//        try {
//            const response = await fetch(API_ENDPOINT);
//            if (!response.ok) {
//                throw new Error(`HTTP error! status: ${response.status}`);
//            }
//            const data = await response.json();
            
//            // 1. Update the current readings state
//            setReadings(data);

//            // 2. Format the new reading with a timestamp for the graph
//            const newReading = {
//                ...data,
//                // Use a simple time string for the X-axis label
//                time: new Date().toLocaleTimeString('en-US', { hour12: false, second: '2-digit', minute: '2-digit' })
//            };

//            // 3. Update historyData while keeping the array size limited
//            setHistoryData(prevData => {
//                const updatedData = [...prevData, newReading];
//                // Limit the array size for better performance and visualization
//                if (updatedData.length > HISTORY_LIMIT) {
//                    return updatedData.slice(updatedData.length - HISTORY_LIMIT);
//                }
//                return updatedData;
//            });
            
//            setIsLoading(false);
//            setError(null);
//        } catch (err) {
//            console.error("Failed to fetch data:", err);
//            setError("Cannot connect to ESP32 server. Please check the network and API endpoint.");
//            setIsLoading(false);
//        }
//    };

//    useEffect(() => {
//        // Initial fetch
//        fetchData(); 
//        // Set up the interval for continuous updates (1000ms = 1 second)
//        const intervalId = setInterval(fetchData, 1000); 
//        // Clean up the interval when the component unmounts
//        return () => clearInterval(intervalId);
//    }, []);

//    if (isLoading) {
//        return <div className="loading-state">Loading live data... ⏳</div>;
//    }

//    if (error) {
//        return <div className="error-state" style={{ color: 'red' }}>Error: {error}</div>;
//    }

//    return (
//        <div className="live-readings-container">
//            <h2>Live Readings and History 📈</h2>
            
//            {/* Display Cards for Current Readings */}
//            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '20px' }}>
//                <div className="reading-card voltage">
//                    <h3>Voltage</h3>
//                    <p>{readings.voltage.toFixed(2)} <span>V</span></p>
//                </div>
                
//                <div className="reading-card current">
//                    <h3>Current</h3>
//                    <p>{readings.current.toFixed(2)} <span>A</span></p>
//                </div>
                
//                <div className="reading-card power">
//                    <h3>Power</h3>
//                    <p>{readings.power.toFixed(2)} <span>W</span></p>
//                </div>
//            </div>
            
//            <p className="last-update">Last updated: {new Date().toLocaleTimeString()}</p>

//            {/* Section for the Live Graph */}
//            <div className="live-graph-container" style={{ width: '100%', height: 300, marginTop: '30px', border: '1px solid #ccc', padding: '10px', borderRadius: '8px' }}>
//                <h3>Real-Time Plot</h3>
//                <ResponsiveContainer width="100%" height="100%">
//                    <LineChart
//                        data={historyData}
//                        margin={{
//                            top: 5, right: 30, left: 20, bottom: 5,
//                        }}
//                    >
//                        {/* A background grid for better readability */}
//                        <CartesianGrid strokeDasharray="3 3" /> 
                        
//                        {/* X-Axis: Time */}
//                        <XAxis dataKey="time" /> 
                        
//                        {/* Y-Axis: Values */}
//                        <YAxis /> 
                        
//                        {/* Tooltip: Shows details when hovering over the graph */}
//                        <Tooltip /> 
                        
//                        {/* Legend: Shows which line corresponds to which reading */}
//                        <Legend /> 
                        
//                        {/* Voltage Line (Blue) */}
//                        <Line type="monotone" dataKey="voltage" stroke="#8884d8" name="Voltage (V)" dot={false} /> 
                        
//                        {/* Current Line (Green) */}
//                        <Line type="monotone" dataKey="current" stroke="#82ca9d" name="Current (A)" dot={false} /> 
                        
//                        {/* Power Line (Red) */}
//                        <Line type="monotone" dataKey="power" stroke="#ffc658" name="Power (W)" dot={false} /> 
//                    </LineChart>
//                </ResponsiveContainer>
//            </div>
//        </div>
//    );
//}

//export default LiveReadings;







import React, { useState, useEffect } from 'react';
import './LiveReadings.css';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const HISTORY_LIMIT = 20; 

function LiveReadings() {
    const [readings, setReadings] = useState({
        voltage: 0.00,
        current: 0.00,
        power: 0.00
    });

    const [historyData, setHistoryData] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);

    const generateDummyData = () => {

        const dummyVoltage = (Math.random() * 5 + 225).toFixed(2); // V ~ 225 to 230
        const dummyCurrent = (Math.random() * 0.5 + 1).toFixed(2);   // A ~ 1 to 1.5
        const dummyPower = (parseFloat(dummyVoltage) * parseFloat(dummyCurrent)).toFixed(2);
        
        return {
            voltage: parseFloat(dummyVoltage),
            current: parseFloat(dummyCurrent),
            power: parseFloat(dummyPower)
        };
    };

    const fetchData = async () => {
        await new Promise(resolve => setTimeout(resolve, 300)); 

        const data = generateDummyData();
        
        setReadings(data);
        
        const newReading = {
            ...data,
            time: new Date().toLocaleTimeString('en-US', { hour12: false, second: '2-digit', minute: '2-digit' })
        };

        setHistoryData(prevData => {
            const updatedData = [...prevData, newReading];
            if (updatedData.length > HISTORY_LIMIT) {
                // إزالة أقدم نقطة بيانات
                return updatedData.slice(updatedData.length - HISTORY_LIMIT);
            }
            return updatedData;
        });
        
        setIsLoading(false);
    };

    useEffect(() => {
        fetchData(); 

        const intervalId = setInterval(fetchData, 1000);

        return () => clearInterval(intervalId);
    }, []);

    if (isLoading) {
        return <div className="loading-state">Loading live data... ⏳</div>;
    }

    return (
        <div className="live-readings-container">
            <header className="system-header">
                <div className="logo-section">
                    <h2 className="logo">Live Readings</h2>
                    <p className="logo-subtitle">Real-time Electrical Monitoring System</p>
                </div>
                <div className="status-section online">
                    <span className="status-dot"></span>
                    <span className="status-text">SYSTEM ONLINE</span>
                </div>
            </header>
            {/* قراءات البيانات الحالية */}
            <div className="reading-cards-wrapper">
                <div className="reading-card voltage">
                    <h3>Voltage</h3>
                    <p>{readings.voltage.toFixed(2)} <span>V</span></p>
                </div>
                
                <div className="reading-card current">
                    <h3>Current</h3>
                    <p>{readings.current.toFixed(2)} <span>A</span></p>
                </div>
                
                <div className="reading-card power">
                    <h3>Power</h3>
                    <p>{readings.power.toFixed(2)} <span>W</span></p>
                </div>
            </div>

            <p className="last-update">Last updated: {new Date().toLocaleTimeString()}</p>

            {/* -------------------- جزء الرسم البياني -------------------- */}
            <div className="live-graph-container" style={{ width: '95%',margin:'auto', height: 260, marginTop: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                <h3>Real-Time Readings Plot</h3>
                {/* ResponsiveContainer لضمان ملاءمة الرسم البياني لحجم الشاشة */}
                <ResponsiveContainer width="100%" height="80%">
                    <LineChart
                        data={historyData}
                        margin={{ top: 5, right: 30, left:-5, bottom: 0 }}
                    >
                        {/* شبكة الخلفية */}
                        <CartesianGrid strokeDasharray="3 3" /> 
                        
                        {/* محور X (الزمن) */}
                        <XAxis dataKey="time" /> 
                        
                        {/* محور Y (القراءات) */}
                        <YAxis /> 
                        
                        {/* التلميح الذي يظهر عند المرور فوق النقاط */}
                        <Tooltip /> 
                        
                        {/* وسيلة الإيضاح */}
                        <Legend /> 
                        
                        {/* خط الجهد (أزرق) */}
                        <Line type="monotone" dataKey="voltage" stroke="#4a148c" name="Voltage (V)" dot={false} strokeWidth={2} /> 
                        
                        {/* خط التيار (أخضر) */}
                        <Line type="monotone" dataKey="current" stroke="#2e7d32" name="Current (A)" dot={false} strokeWidth={2} /> 
                        
                        {/* خط الطاقة (أصفر/برتقالي) */}
                        <Line type="monotone" dataKey="power" stroke="#ff8f00" name="Power (W)" dot={false} strokeWidth={2} /> 
                    </LineChart>
                </ResponsiveContainer>
            </div>
            {/* ----------------------------------------------------------- */}
        </div>
    );
}

export default LiveReadings;

