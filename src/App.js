import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import SiteLoader from './components/ui/SiteLoader'; // Your terminal-style loader
import Login from './pages/Login/Login';
import Register from './pages/Login/Register';
import ForgotPassword from './pages/Login/ForgotPassword';
import HomePage from './pages/HomePage/HomePage';
import ProfilePage from './pages/HomePage/ProfilePage';
import SearchPage from './pages/HomePage/SearchPage';
import ListPage from './pages/ListPage/ListPage';
import ListDetail from './pages/ListPage/ListDetail';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 1 day in milliseconds

const RootRedirect = () => {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/home" /> : <Navigate to="/register" />;
};

function App() {
  // Get stored backend status if available
  const storedStatus = JSON.parse(localStorage.getItem("backendActive") || "null");
  const isStoredValid = storedStatus && (Date.now() - storedStatus.timestamp < ONE_DAY_MS);
  
  // If stored status is valid, skip showing the overlay.
  const initialOverlay = isStoredValid ? false : true;

  const [showOverlay, setShowOverlay] = useState(initialOverlay);
  const [backendActive, setBackendActive] = useState(isStoredValid ? storedStatus.active : false);

  useEffect(() => {
    // If we already have valid stored status, we don't need to check again.
    if (isStoredValid) return;
    
    const checkBackend = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/status/ping`);
        if (response.data.status === 'ok') {
          setBackendActive(true);
          // Store backend status with current timestamp
          localStorage.setItem("backendActive", JSON.stringify({ active: true, timestamp: Date.now() }));
        }
      } catch (error) {
        console.error('Backend status check failed:', error);
      } finally {
        setShowOverlay(false);
      }
    };

    checkBackend();
  }, [BACKEND_URL, isStoredValid]);

  if (!backendActive && !showOverlay) {
    return (
      <div style={{ color: 'white', textAlign: 'center', marginTop: '2rem' }}>
        <p>Backend is not available. Please try again later.</p>
      </div>
    );
  }

  return (
    <>
      {showOverlay && (
        <div className="loader-overlay">
          <SiteLoader />
        </div>
      )}

      <Router>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/search/:page?" element={<SearchPage />} />
          <Route path="/lists" element={<ListPage />} />
          <Route path="/list/:userId/:listId" element={<ListDetail />} />
          <Route path="/list/:userId/:listId/movies" element={<ListDetail />} />
          <Route path="/list/:userId/:listId/tvshows" element={<ListDetail />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
