import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import Register from './pages/Login/Register';
import ForgotPassword from './pages/Login/ForgotPassword';
import HomePage from './pages/HomePage/HomePage';
import ProfilePage from './pages/HomePage/ProfilePage';
import SearchPage from './pages/HomePage/SearchPage';
import ListPage from './pages/ListPage/ListPage';
import ListDetail from './pages/ListPage/ListDetail';


// This component will check LocalStorage for a token and redirect accordingly.
const RootRedirect = () => {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/home" /> : <Navigate to="/register" />;
};

function App() {
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
