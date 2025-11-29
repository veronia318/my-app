import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import LiveReadings from "./LiveReadings";
import Login from "./login";
import RegisterForm from './RegisterForm';
import Navbar from './Navbar';
import RoomsPage from './RoomsPage'; // <-- تأكدي من تسمية الملف بهذا الاسم

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/live-readings" element={<LiveReadings />} />
          <Route path="/login" element={<Login />} />
          <Route path="/rooms" element={<RoomsPage />} />
        </Routes>

      </div>
    </Router>
  );
}

export default App;
