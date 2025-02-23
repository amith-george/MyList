import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/components/Sidebar.css';
import logo from '../../assets/logo4.svg';
import { logout } from '../../utils/auth';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <img 
          src={logo} 
          alt="MyList Logo" 
          className="sidebar-logo"
        />
        <h2>MyList</h2>
      </div>
      <nav className="sidebar-nav">
        <Link to="/home" className="nav-link">
          <span className="nav-icon">🏠</span>
          <span className="nav-text">Home</span>
        </Link>
        <Link to="/search" className="nav-link">
          <span className="nav-icon">🔍</span>
          <span className="nav-text">Search</span>
        </Link>
        <Link to="/lists" className="nav-link">
          <span className="nav-icon">📋</span>
          <span className="nav-text">Your Lists</span>
        </Link>
        <Link to="/profile" className="nav-link">
          <span className="nav-icon">👤</span>
          <span className="nav-text">Profile</span>
        </Link>
        <div className="nav-link" onClick={handleLogout}>
          <span className="nav-icon">🚪</span>
          <span className="nav-text">Logout</span>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;