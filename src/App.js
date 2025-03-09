import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './pages/Login/Login';
import Register from './pages/Login/Register';
import ForgotPassword from './pages/Login/ForgotPassword';
import HomePage from './pages/HomePage/HomePage';
import ProfilePage from './pages/HomePage/ProfilePage';
import SearchPage from './pages/HomePage/SearchPage';
import ListPage from './pages/ListPage/ListPage';
import ListDetail from './pages/ListPage/ListDetail';
import SiteLoader from './components/ui/SiteLoader';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const RootRedirect = () => {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/home" /> : <Navigate to="/register" />;
};

function App() {
  const [backendActive, setBackendActive] = useState(false);
  const [checkingBackend, setCheckingBackend] = useState(true);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/status/ping`);
        if (response.data.status === 'ok') {
          setBackendActive(true);
        } else {
          setBackendActive(false);
        }
      } catch (error) {
        console.error('Error checking backend status:', error);
        setBackendActive(false);
      } finally {
        setCheckingBackend(false);
      }
    };

    checkBackend();
  }, []);

  if (checkingBackend) {
    return <SiteLoader />;
  }

  if (!backendActive) {
    return (
      <div style={{ color: 'white', textAlign: 'center', marginTop: '2rem' }}>
        <p>Backend is not available. Please try again later.</p>
      </div>
    );
  }

  return (
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
  );
}

export default App;
