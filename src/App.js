import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import LiveReadings from "./LiveReadings";
import Login from "./login";
import RegisterForm from './RegisterForm';
import Navbar from './Navbar';
import RoomsPage from './RoomsPage';
import LoadingPage from './loading';
import HomePage from './Homepage';
import RoomDetails from './RoomDetails';


function App() {

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return <LoadingPage / > ;
    }

    return ( <
        Router >
        <
        div className = "App" >
        <
        Navbar / >
        <
        Routes >
        <
        Route path = "/"
        element = { < HomePage / > }
        /> <
        Route path = "/register"
        element = { < RegisterForm / > }
        /> <
        Route path = "/live-readings"
        element = { < LiveReadings / > }
        /> <
        Route path = "/login"
        element = { < Login / > }
        /> <
        Route path = "/rooms"
        element = { < RoomsPage / > }
        /> <
        Route path = "/rooms/:roomId"
        element = { < RoomDetails / > }
        /> <
        /Routes>

        <
        /div> <
        /Router>
    );
}

export default App;